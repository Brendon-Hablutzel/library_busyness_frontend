import { HillData, HillForecast, HuntData, HuntForecast } from "./utils/models";
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
} from "recharts";
import {
  capitalize,
  formatPercent,
  nMinutesAfter,
  padOneZero,
  reverse,
} from "./utils";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { scaleTime } from "d3-scale";

const formatTimestampFull = (epochTimestampMillis: number) => {
  const when = new Date(epochTimestampMillis);
  return when.toLocaleString();
};

const formatTimestampSimple = (epochTimestampMillis: number) => {
  const when = new Date(epochTimestampMillis);
  const dayOfWeekName = when.toLocaleString("default", { weekday: "short" });
  return `${dayOfWeekName} ${when.getMonth() + 1}/${when.getDate()} ${padOneZero(when.getHours())}:${padOneZero(when.getMinutes())}`;
};

const graphColorsCounts = [
  "#589dd6", // blues:
  "#87CEEB",
  "#1E90FF",
  "#1ca9d9",
];

const graphColorsPercent = [
  "#e3a02d", // soft orange
];

const getGraphColorCounts = (idx: number): string => {
  return graphColorsCounts[idx % graphColorsCounts.length];
};

const getGraphColorPercent = (idx: number): string => {
  return graphColorsPercent[idx % graphColorsPercent.length];
};

const formatSeriesName = (s: string) => {
  const components = s.split("_");
  const capitalizedName = capitalize(components[0]);
  return s.includes("predicted")
    ? `${capitalizedName} (predicted)`
    : s.includes("actual")
      ? `${capitalizedName} (observed)`
      : capitalizedName;
};

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length > 0) {
    payload = reverse(payload);
    return (
      <div className="bg-bg-dark rounded-md p-2 bg-opacity-75">
        <h2 className="font-semibold">{formatTimestampFull(label)}</h2>
        {payload.map((series, idx) => {
          const color = series.color
            ? `text-[${series.color}]`
            : "text-text-light";

          const name = series.name?.toString() ?? "";

          return (
            <div className={color} key={idx}>
              <span className="font-light">{formatSeriesName(name)}:</span>{" "}
              <span className="font-medium">
                {name.includes("percent")
                  ? formatPercent(series.value as number)
                  : series.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

interface BusynessAreaChartProps {
  recordOptions:
    | {
        library: "hill";
        records: HillData[];
        forecasts: HillForecast[];
      }
    | {
        library: "hunt";
        records: HuntData[];
        forecasts: HuntForecast[];
      };
  displayType: "count" | "percent";
  now: Date;
}

export const BusynessAreaChart: React.FC<BusynessAreaChartProps> = ({
  recordOptions,
  displayType,
  now,
}) => {
  const records = recordOptions.records.map((record) => {
    const { record_datetime, ...rest } = record;
    return {
      ...rest,
      record_datetime: new Date(record_datetime),
    };
  });

  const forecasts = recordOptions.forecasts.map((forecast) => {
    const { record_datetime, total_count, total_percent, ...rest } = forecast;
    return {
      ...rest,
      total_count_forecast: total_count,
      total_percent_forecast: total_percent,
      record_datetime: new Date(record_datetime),
    };
  });

  const data: {
    library: string;
    record_datetime: Date;
    total_count?: number;
    total_percent?: number;
    total_count_forecast?: number;
    total_percent_forecast?: number;
  }[] = [...records, ...forecasts];

  const library = recordOptions.library;

  const hillFields = ["east", "tower", "west"];
  const huntFields = ["level2", "level3", "level4", "level5"];

  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* margin is so that rotated ticks don't get cut off */}
      <ComposedChart data={data} margin={{ bottom: 60, left: -8 }}>
        <Tooltip content={<CustomTooltip />} animationDuration={200} />
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="record_datetime"
          tick={{ fill: "#d4d4d4" }}
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
          tick={{ fill: "#d4d4d4" }}
          domain={displayType === "percent" ? [0, 1] : undefined}
          tickFormatter={
            displayType === "percent"
              ? (tick) => {
                  return formatPercent(tick);
                }
              : undefined
          }
        />
        {displayType === "count" ? (
          library === "hill" ? (
            hillFields.map((area, idx) => {
              return (
                <Area
                  type="monotone"
                  dataKey={`${area}_count`}
                  key={idx}
                  fill={getGraphColorCounts(idx + 1)}
                  stroke={getGraphColorCounts(idx + 1)}
                  fillOpacity={0.7}
                  stackId="1"
                  animationDuration={500}
                />
              );
            })
          ) : (
            huntFields.map((area, idx) => {
              return (
                <Area
                  type="monotone"
                  dataKey={`${area}_count`}
                  key={idx}
                  fill={getGraphColorCounts(idx + 1)}
                  stroke={getGraphColorCounts(idx + 1)}
                  fillOpacity={0.7}
                  stackId="1"
                  animationDuration={500}
                />
              );
            })
          )
        ) : (
          <div></div>
        )}
        {displayType === "percent" ? (
          <Area
            type="monotone"
            dataKey="total_percent"
            fill={getGraphColorPercent(1)}
            stroke={getGraphColorPercent(1)}
            fillOpacity={0.7}
            animationDuration={500}
          />
        ) : (
          // this transparent total line is just here so that the
          // tooltip shows total count
          <Line
            type="monotone"
            dataKey="total_count"
            stroke="#ffffff"
            strokeOpacity={0}
            dot={false}
            animationDuration={500}
          />
        )}
        {displayType === "count" ? (
          <Area
            type="monotone"
            dataKey="total_count_forecast"
            fill={getGraphColorCounts(0)}
            stroke={getGraphColorCounts(0)}
            animationDuration={500}
            fillOpacity={0.3}
          />
        ) : (
          <Area
            type="monotone"
            dataKey="total_percent_forecast"
            fill={getGraphColorPercent(0)}
            stroke={getGraphColorPercent(0)}
            animationDuration={500}
            fillOpacity={0.3}
          />
        )}
        <ReferenceLine
          // place the reference line just ahead of the current time (7 mins)
          // to fill the gap between last record and first forecast
          x={nMinutesAfter(now, 7).valueOf()}
          stroke="#fc0303"
          strokeWidth={1.5}
        />
        {/* <Brush startIndex={100} /> */}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export interface ForecastMetricsChartProps {
  records: {
    record_datetime: number;
    total_count_actual: number;
    total_count_predicted: number;
  }[];
}

export const ForecastMetricsChart: React.FC<ForecastMetricsChartProps> = ({
  records,
}) => {
  if (records.length === 0) {
    return <div>loading metrics</div>;
  }

  const parsedRecords = records.map((record) => {
    const { record_datetime, ...rest } = record;
    return {
      ...rest,
      record_datetime: new Date(record_datetime),
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* margin is so that rotated ticks don't get cut off */}
      <ComposedChart data={parsedRecords} margin={{ left: -8 }}>
        <Tooltip content={<CustomTooltip />} animationDuration={200} />
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="record_datetime"
          tick={{ fill: "#d4d4d4" }}
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
        <YAxis tick={{ fill: "#d4d4d4" }} />
        <Area
          dataKey="total_count_actual"
          animationDuration={500}
          fill="#589dd6"
          stroke="#589dd6"
          strokeWidth={0}
        />
        <Line
          dataKey="total_count_predicted"
          animationDuration={500}
          dot={false}
          stroke="#ffffff"
          strokeWidth={1}
        />
        <Brush travellerWidth={10} gap={5} height={25} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
