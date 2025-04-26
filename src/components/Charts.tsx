import {
  Area,
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import { formatPercent, nMinutesAfter, padOneZero, reverse } from '../utils'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { scaleTime } from 'd3-scale'
import {
  ForecastRecord,
  HistoricalRecord,
  Library,
  libraryAreas,
  MetricsRecord,
} from '../utils/models'

// a constant that affects how the number of data points shown on the
// busyness area chart will change between screen sizes. Higher means that
// each data point occupies a greater portion of the screen, so fewer will
// be shown on smaller screens.
const MIN_DATAPOINT_WIDTH = 2

export enum DisplayType {
  COUNTS = 'count',
  PERCENTS = 'percent',
}

// return a simple formatted timestamp, with day of week name, month, day,
// hour, and minute--used for ticks on the charts below
const formatTimestampSimple = (epochTimestampMillis: number) => {
  const when = new Date(epochTimestampMillis)
  const dayOfWeekName = when.toLocaleString('default', { weekday: 'short' })
  return `${dayOfWeekName} ${when.getMonth() + 1}/${when.getDate()} ${padOneZero(when.getHours())}:${padOneZero(when.getMinutes())}`
}

// return a more complete formatted timestamp, including year, month, day,
// hour, minutes, and seconds--used for the tooltip
const formatTimestampFull = (epochTimestampMillis: number) => {
  const when = new Date(epochTimestampMillis)
  return when.toLocaleString()
}

// colors for the "counts" version of the chart
const graphColorsCounts = [
  '#589dd6', // blues:
  '#87CEEB',
  '#1E90FF',
  '#1ca9d9',
]

const getGraphColorCounts = (idx: number): string => {
  return graphColorsCounts[idx % graphColorsCounts.length]
}

// colors for the "percents" version of the chart
const graphColorsPercent = [
  '#e3a02d', // soft orange
]

const getGraphColorPercent = (idx: number): string => {
  return graphColorsPercent[idx % graphColorsPercent.length]
}

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length > 0) {
    payload = reverse(payload)
    return (
      <div className="bg-bg-dark rounded-md p-2 bg-opacity-75">
        <h2 className="font-semibold">{formatTimestampFull(label)}</h2>
        {payload.map((series, idx) => {
          const color = series.color ? `text-[${series.color}]` : 'text-text-light'

          const name = series.name?.toString() ?? ''

          return (
            <div className={color} key={idx}>
              <span className="font-light">{name}:</span>{' '}
              <span className="font-medium">
                {name.includes('percent') ? formatPercent(series.value as number) : series.value}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return null
}

// the chart to display for each library on the main page--includes historical records
// and forecasts
interface BusynessAreaChartProps {
  library: Library
  historicalRecords: HistoricalRecord[]
  forecastRecords: ForecastRecord[]
  displayType: DisplayType
  now: Date
}

export const BusynessAreaChart: React.FC<BusynessAreaChartProps> = ({
  library,
  historicalRecords,
  forecastRecords,
  displayType,
  now,
}) => {
  const numSelectedHistoricalRecords = Math.min(
    // this intentionally does not re-render on window size change--
    // this will be set once when the page loads, and then whenever the
    // data is re-fetched in the background
    window.innerWidth / MIN_DATAPOINT_WIDTH,
    historicalRecords.length
  )

  const selectedHistoricalRecords = historicalRecords.slice(-numSelectedHistoricalRecords)

  const data = [...selectedHistoricalRecords, ...forecastRecords]

  const areas = libraryAreas[library]

  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* margin is so that rotated ticks don't get cut off */}
      <ComposedChart data={data} margin={{ bottom: 70, left: -8 }}>
        <Tooltip content={<CustomTooltip />} animationDuration={200} />
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="record_datetime"
          tick={{ fill: '#d4d4d4' }}
          tickFormatter={formatTimestampSimple}
          tickMargin={15}
          angle={-55}
          dx={-30}
          dy={25}
          minTickGap={35}
          fontSize={15}
          // this ensures that spacing between data points is proportional
          // to the duration between those data points
          scale={scaleTime()}
        />
        <YAxis
          tick={{ fill: '#d4d4d4' }}
          domain={displayType === DisplayType.PERCENTS ? [0, 1] : undefined}
          tickFormatter={
            displayType === DisplayType.PERCENTS
              ? (tick) => {
                  return formatPercent(tick)
                }
              : undefined
          }
        />
        {/* this transparent total line is just here so that the tooltip shows total count */}
        {displayType === DisplayType.COUNTS ? (
          <Line
            type="monotone"
            name="total count"
            dataKey="total.count"
            stroke="#ffffff"
            strokeOpacity={0}
            dot={false}
            animationDuration={500}
          />
        ) : (
          <Area
            type="monotone"
            name="total percent"
            dataKey="total.percent"
            fill={getGraphColorPercent(1)}
            stroke={getGraphColorPercent(1)}
            fillOpacity={0.7}
            animationDuration={500}
          />
        )}

        {displayType === DisplayType.COUNTS ? (
          areas.map((area, idx) => {
            return (
              <Area
                type="monotone"
                name={`${area} ${displayType}`}
                dataKey={`areas.${area}.${displayType}`}
                key={idx}
                fill={getGraphColorCounts(idx + 1)}
                stroke={getGraphColorCounts(idx + 1)}
                fillOpacity={0.7}
                stackId="1"
                animationDuration={500}
              />
            )
          })
        ) : (
          <div></div>
        )}

        <Area
          type="monotone"
          name={`forecasted total ${displayType}`}
          dataKey={`forecasted_total.${displayType}`}
          fill={
            displayType === DisplayType.COUNTS ? getGraphColorCounts(0) : getGraphColorPercent(1)
          }
          stroke={
            displayType === DisplayType.COUNTS ? getGraphColorCounts(0) : getGraphColorPercent(1)
          }
          animationDuration={500}
          fillOpacity={0.3}
        />

        <ReferenceLine
          // place the reference line just ahead of the current time (10 mins)
          // to fill the gap between last record and first forecast
          x={nMinutesAfter(now, 10).valueOf()}
          stroke="#fc0303"
          // 1024px is the breakpoint for tailwind lg
          strokeWidth={window.innerWidth > 1024 ? 1 : 0.5}
        />
        {/* <Brush startIndex={100} /> */}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

// the chart to display for each library on the metrics page--shows actual
// total count and predicted total count
export const ForecastMetricsChart: React.FC<{ records: MetricsRecord[] }> = ({ records }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* margin is so that rotated ticks don't get cut off */}
      <ComposedChart data={records} margin={{ left: -8 }}>
        <Tooltip content={<CustomTooltip />} animationDuration={200} />
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="record_datetime"
          tick={{ fill: '#d4d4d4' }}
          tickFormatter={formatTimestampSimple}
          tickMargin={15}
          angle={-55}
          dx={-30}
          dy={25}
          minTickGap={35}
          fontSize={15}
          // this ensures that spacing between data points is proportional
          // to the duration between those data points
          scale={scaleTime()}
          height={110}
        />
        <YAxis tick={{ fill: '#d4d4d4' }} />
        <Area
          name="actual total count"
          dataKey="total.count.actual"
          animationDuration={500}
          fill="#589dd6"
          stroke="#589dd6"
          strokeWidth={0}
        />
        <Line
          name="predicted total count"
          dataKey="total.count.predicted"
          animationDuration={500}
          dot={false}
          stroke="#ffffff"
          strokeWidth={1}
        />
        <Brush travellerWidth={10} gap={5} height={25} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
