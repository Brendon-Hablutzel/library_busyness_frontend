import { useEffect, useState } from 'react'
import { BusynessData, fetchHillRecords, fetchHuntRecords, ResponseStatus } from '../utils/backend'
import { BusynessAreaChart, DisplayType } from './Charts'
import { capitalize, getNearestItemByFn, maxByFn, nDaysBefore, nHoursAfter } from '../utils'
import { Toggle } from './Toggle'
import { ForecastRecord, HistoricalRecord, Library } from '../utils/models'
import { Link } from 'react-router-dom'

// component for the main page to display while data is being fetched
const LoadingLibraryComponent: React.FC = () => {
  return (
    <div className="flex gap-2 items-center text-2xl">
      <h2 className="">Loading data, please wait</h2>
      <div className="flex">
        <div className="justify-between gap-2 inline-flex">
          <span className="block relative box-border animate-[grow-shrink_1s_ease-in-out_infinite_0ms]">
            .
          </span>
          <span className="block relative box-border animate-[grow-shrink_1s_ease-in-out_infinite_200ms]">
            .
          </span>
          <span className="block relative box-border animate-[grow-shrink_1s_ease-in-out_infinite_400ms]">
            .
          </span>
        </div>
      </div>
    </div>
  )
}

// component that displays fetched data, including charts,
// for a library
const LoadedLibraryComponent: React.FC<{
  mostRecentHistoricalRecord: HistoricalRecord
  historicalRecords: HistoricalRecord[]
  forecastRecords: ForecastRecord[]
  now: Date
  library: Library
}> = ({ mostRecentHistoricalRecord, historicalRecords, forecastRecords, now, library }) => {
  // display type for the chart--whether to show counts or percents
  const [displayType, setDisplayType] = useState<DisplayType>(DisplayType.COUNTS)

  const mostRecentCount = mostRecentHistoricalRecord.total.count

  // find the forecast record nearest to one hour in the future to compute
  // the expected change over the next hour
  const nextHourRecord = getNearestItemByFn(
    forecastRecords,
    (forecast) => forecast.record_datetime.valueOf(),
    nHoursAfter(now, 1).valueOf()
  )

  const nextHourCount =
    nextHourRecord !== undefined ? nextHourRecord.forecasted_total.count : undefined

  const nextHourPercentChange =
    nextHourCount !== undefined
      ? Math.round((100 * (nextHourCount - mostRecentCount)) / mostRecentCount)
      : undefined

  // find the historical record nearest to one day in the past to compute
  // the change from then to now
  const dayAgoRecord = getNearestItemByFn(
    historicalRecords,
    (record) => record.record_datetime.valueOf(),
    nDaysBefore(now, 1).valueOf()
  )

  const dayAgoCount = dayAgoRecord !== undefined ? dayAgoRecord.total.count : undefined

  const lastDayPercentChange =
    dayAgoCount !== undefined
      ? Math.round((100 * (mostRecentCount - dayAgoCount)) / dayAgoCount)
      : undefined

  return (
    <div>
      <div className="lg:flex lg:justify-between pb-4">
        <div className="flex justify-between items-center flex-row lg:gap-5 xl:gap-10 2xl:gap-15 mb-4 lg:mb-0">
          <h3 className="text-3xl md:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl">
            <span className="font-medium">{mostRecentCount}</span> people
          </h3>
          <h3 className="text-3xl md:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl">
            <span className="font-medium">
              {Math.round(100 * mostRecentHistoricalRecord.total.percent)}%
            </span>{' '}
            full
          </h3>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-4">
          <div
            className={`bg-bg-medium p-1 lg:p-2 rounded-md shadow-lg border-l-8 ${nextHourPercentChange === undefined || nextHourPercentChange === 0 ? 'border-l-yellow-500' : nextHourPercentChange > 0 ? 'border-l-red-500' : 'border-l-green-500'}`}
          >
            <div className="text-lg md:text-3xl lg:text-xl xl:text-2xl 2xl:text-3xl lg:px-1 xl:px-2">
              <span
                className={`font-medium ${nextHourPercentChange === undefined || nextHourPercentChange === 0 ? 'text-yellow-500' : nextHourPercentChange > 0 ? 'text-red-500' : 'text-green-500'}`}
              >
                {nextHourPercentChange === undefined || nextHourPercentChange === 0
                  ? 'no change'
                  : `${nextHourPercentChange > 0 ? '↑' : '↓'} ${Math.abs(nextHourPercentChange)}%`}
              </span>{' '}
              over the next hour
            </div>
          </div>
          <div
            className={`bg-bg-medium p-1 lg:p-2 rounded-md shadow-lg border-l-8 ${lastDayPercentChange === undefined || lastDayPercentChange === 0 ? 'border-l-yellow-500' : lastDayPercentChange > 0 ? 'border-l-red-500' : 'border-l-green-500'}`}
          >
            <div className="text-lg md:text-3xl lg:text-xl xl:text-2xl 2xl:text-3xl lg:px-1 xl:px-2">
              <span
                className={`font-medium ${lastDayPercentChange === undefined || lastDayPercentChange === 0 ? 'text-yellow-500' : lastDayPercentChange > 0 ? 'text-red-500' : 'text-green-500'}`}
              >
                {lastDayPercentChange === undefined || lastDayPercentChange === 0
                  ? 'no change'
                  : `${lastDayPercentChange > 0 ? '↑' : '↓'} ${Math.abs(lastDayPercentChange)}%`}
              </span>{' '}
              from yesterday at this time
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center h-[20rem] lg:h-[30rem] max-h-[80vh] mb-4">
        <BusynessAreaChart
          library={library}
          historicalRecords={historicalRecords}
          forecastRecords={forecastRecords}
          displayType={displayType}
          now={now}
        />
      </div>
      <div className="mt-5 mb-1 flex justify-between">
        <Toggle
          // disabled/false => counts
          // enabled/true => percents
          disabledText={DisplayType.COUNTS}
          enabledText={DisplayType.PERCENTS}
          state={displayType === DisplayType.PERCENTS}
          setState={(newState) => {
            setDisplayType(newState ? DisplayType.PERCENTS : DisplayType.COUNTS)
          }}
        />
      </div>
    </div>
  )
}

// component for displaying data for a single library
const LibraryComponent: React.FC<{
  library: Library
  data: BusynessData
  className: string
  now: Date
}> = ({ library, data, className, now }) => {
  const { status } = data
  const formattedLibrary = capitalize(library)

  // default to the loading component, change it when the status changes
  // to either error or loaded
  let component: React.ReactElement = <LoadingLibraryComponent />

  switch (status) {
    case ResponseStatus.ERROR: {
      console.error(data.error)

      component = (
        <h2 className="text-2xl text-red-500">
          Sorry, there was an error loading occupancy data. Please try again.
        </h2>
      )
      break
    }
    case ResponseStatus.LOADED: {
      const { historicalRecords, forecastRecords } = data

      const mostRecentHistoricalRecord = maxByFn(historicalRecords, (record) =>
        record.record_datetime.valueOf()
      )

      if (historicalRecords.length === 0 || mostRecentHistoricalRecord === undefined) {
        // if there are no historical records, don't display anything--trying to render with
        // no historical records will cause issues with the graph and the change over time stats
        component = <h2 className="text-2xl">No data found, try again later.</h2>
        break
      }

      // displays a successfully loaded library (e.g., historical records were found, and
      // probably forecast too, but this it not required--it will display fine without
      // forecasts)
      component = (
        <LoadedLibraryComponent
          historicalRecords={historicalRecords}
          forecastRecords={forecastRecords}
          mostRecentHistoricalRecord={mostRecentHistoricalRecord}
          library={library}
          now={now}
        />
      )
    }
  }

  // display the header with the corresponding component--loading, loaded, or error
  return (
    <div className={className}>
      <div className="bg-bg-dark rounded-lg shadow-maincard p-2 md:p-4 lg:p-5">
        <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-bold mb-1">
          {formattedLibrary}
        </h1>
        {component}
      </div>
    </div>
  )
}

const Home: React.FC = () => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(
      () => {
        // setting now causes data to be re-fetched and library
        // components to be re-rendered
        setNow(new Date())
      },
      // every 5 minutes
      1000 * 60 * 5
    )

    return () => clearInterval(interval)
  }, [now])

  // fetch hill data on component render and whenever 'now' updates
  const [hillDataResponse, setHillDataResponse] = useState<BusynessData>({
    status: ResponseStatus.LOADING,
  })

  useEffect(() => {
    ;(async () => {
      const hillDataResponse = await fetchHillRecords(nDaysBefore(now, 7))

      setHillDataResponse(hillDataResponse)
    })()
  }, [now])

  // fetch hunt data on component render and whenever 'now' updates
  const [huntDataResponse, setHuntDataResponse] = useState<BusynessData>({
    status: ResponseStatus.LOADING,
  })

  useEffect(() => {
    ;(async () => {
      const huntDataResponse = await fetchHuntRecords(nDaysBefore(now, 7))

      setHuntDataResponse(huntDataResponse)
    })()
  }, [now])

  return (
    <div className="min-h-[100vh] bg-bg-darkest text-text-light">
      <div className="flex flex-col justify-between gap-4 lg:gap-6 p-4 lg:p-6">
        <div className="flex flex-col items-center text-center text-text-light">
          <h1 className="sm:py-2 lg:p-0 font-bold filter drop-shadow-header text-2xl sm:text-4xl 2xl:text-5xl text-center">
            NC State Library Busyness
          </h1>
          <p className="mt-2 max-w-4xl text-sm sm:text-base md:text-lg text-text-light/85">
            view recent, current, and forecasted busyness for NC State's libraries — updated every
            15 minutes
          </p>
        </div>
        <LibraryComponent
          library="hill"
          data={hillDataResponse}
          now={now}
          className="max-w-[100vw]"
        />
        <LibraryComponent
          library="hunt"
          data={huntDataResponse}
          now={now}
          className="max-w-[100vw]"
        />
        <div className="flex items-center gap-2 justify-center text-center py-8 px-2 text-sm sm:text-lg md:text-xl">
          <span>data from {now.toLocaleString()}</span> <span>•</span>{' '}
          <span>
            <Link to="/about" target="_blank" className="hover:underline underline-offset-2">
              learn more
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Home
