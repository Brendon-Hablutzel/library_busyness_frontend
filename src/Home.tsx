import { useEffect, useState } from "react";
import { HillData, HillForecast, HuntData, HuntForecast } from "./utils/models";
import {
  fetchHillRecords,
  fetchHuntRecords,
  HillDataResponse,
  HuntDataResponse,
} from "./utils/backend";
import { BusynessAreaChart /*ForecastMetricsChart*/ } from "./Charts";
import {
  capitalize,
  getNearestItemByFn,
  nDaysBefore,
  nHoursAfter,
} from "./utils";
import { Toggle } from "./Toggle";
// import { MetricsComponent } from "./Metrics";

interface LibraryComponentProps {
  data:
    | {
        library: "hill";
        dataResponse: HillDataResponse;
      }
    | {
        library: "hunt";
        dataResponse: HuntDataResponse;
      };
  className: string;
  now: Date;
}

const LibraryComponent: React.FC<LibraryComponentProps> = ({
  data,
  className,
  now,
}) => {
  const { library, dataResponse } = data;
  const formattedLibrary = capitalize(library);

  // disabled/false => counts
  // enabled/true => percents
  const [displayType, setDisplayType] = useState<boolean>(false);

  switch (dataResponse.status) {
    case "loading": {
      return (
        <div className={className}>
          <div className="bg-bg-dark rounded-lg shadow-maincard p-2 md:p-4 lg:p-5">
            <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-bold mb-1">
              {formattedLibrary}
            </h1>
            <div className="flex gap-2 items-center text-2xl">
              <h2 className="">Loading data, please wait</h2>
              <div className="flex">
                <div className="justify-between gap-2 inline-flex">
                  <span className="block relative box-border animate-[grow-shrink_1.5s_ease-in-out_infinite_0ms]">
                    .
                  </span>
                  <span className="block relative box-border animate-[grow-shrink_1.5s_ease-in-out_infinite_200ms]">
                    .
                  </span>
                  <span className="block relative box-border animate-[grow-shrink_1.5s_ease-in-out_infinite_400ms]">
                    .
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    case "loaded-error": {
      return (
        <div className={className}>
          <div className="bg-bg-dark rounded-lg shadow-maincard p-2 md:p-4 lg:p-5">
            <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-bold mb-1">
              {formattedLibrary}
            </h1>
            <h2 className="text-2xl text-red-500">
              Sorry, there was an error loading occupancy data. Please try
              again.
            </h2>
          </div>
        </div>
      );
    }
    case "loaded-found": {
      const { records, mostRecentRecord, forecasts } = dataResponse;

      const mostRecentCount = mostRecentRecord.total_count;
      const mostRecentPercent = Math.round(
        100 * mostRecentRecord.total_percent
      );

      const hourAheadRecord = getNearestItemByFn<HillForecast | HuntForecast>(
        forecasts,
        (item) => item.record_datetime,
        nHoursAfter(now, 1).valueOf()
      );
      const hourAheadCount =
        hourAheadRecord !== undefined ? hourAheadRecord.total_count : undefined;

      const nextHourPercentChange =
        hourAheadCount !== undefined
          ? Math.round(
              (100 * (hourAheadCount - mostRecentCount)) / mostRecentCount
            )
          : undefined;

      const oneDayAgo = nDaysBefore(now, 1);
      const dayAgoRecord = getNearestItemByFn<HillData | HuntData>(
        records,
        (item) => item.record_datetime,
        oneDayAgo.valueOf()
      );
      const dayAgoCount =
        dayAgoRecord !== undefined ? dayAgoRecord.total_count : undefined;

      const lastDayPercentChange =
        dayAgoCount !== undefined
          ? Math.round((100 * (mostRecentCount - dayAgoCount)) / dayAgoCount)
          : undefined;

      return (
        <div className={className}>
          <div className="bg-bg-dark rounded-lg shadow-maincard p-2 md:p-4 lg:p-5">
            <div className="mb-2">
              <h2 className="text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-bold mb-1">
                {formattedLibrary}
              </h2>
              <div className="lg:flex lg:justify-between pb-4">
                <div className="flex justify-between items-center flex-row lg:gap-5 xl:gap-10 2xl:gap-15 mb-4 lg:mb-0">
                  <h3 className="text-3xl md:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl">
                    <span className="font-semibold">{mostRecentCount}</span>{" "}
                    people
                  </h3>
                  <h3 className="text-3xl md:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl">
                    <span className="font-semibold">{mostRecentPercent}%</span>{" "}
                    full
                  </h3>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-4">
                  <div
                    className={`bg-bg-medium p-1 lg:p-2 rounded-md shadow-lg border-l-8 ${nextHourPercentChange === undefined || nextHourPercentChange === 0 ? "border-l-yellow-500" : nextHourPercentChange > 0 ? "border-l-red-500" : "border-l-green-500"}`}
                  >
                    <div className="text-lg md:text-3xl lg:text-xl xl:text-2xl 2xl:text-3xl lg:px-1 xl:px-2">
                      <span
                        className={`font-semibold ${nextHourPercentChange === undefined || nextHourPercentChange === 0 ? "text-yellow-500" : nextHourPercentChange > 0 ? "text-red-500" : "text-green-500"}`}
                      >
                        {nextHourPercentChange === undefined ||
                        nextHourPercentChange === 0
                          ? "no change"
                          : `${nextHourPercentChange > 0 ? "⇧" : "⇩"} ${Math.abs(nextHourPercentChange)}%`}
                      </span>{" "}
                      over the next hour
                    </div>
                  </div>
                  <div
                    className={`bg-bg-medium p-1 lg:p-2 rounded-md shadow-lg border-l-8 ${lastDayPercentChange === undefined || lastDayPercentChange === 0 ? "border-l-yellow-500" : lastDayPercentChange > 0 ? "border-l-red-500" : "border-l-green-500"}`}
                  >
                    <div className="text-lg md:text-3xl lg:text-xl xl:text-2xl 2xl:text-3xl lg:px-1 xl:px-2">
                      <span
                        className={`font-semibold ${lastDayPercentChange === undefined || lastDayPercentChange === 0 ? "text-yellow-500" : lastDayPercentChange > 0 ? "text-red-500" : "text-green-500"}`}
                      >
                        {lastDayPercentChange === undefined ||
                        lastDayPercentChange === 0
                          ? "no change"
                          : `${lastDayPercentChange > 0 ? "⇧" : "⇩"} ${Math.abs(lastDayPercentChange)}%`}
                      </span>{" "}
                      from yesterday at this time
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center h-[35vh] lg:h-[50vh] mb-4">
              <BusynessAreaChart
                // type assertion is valid because of LibraryComponent props
                recordOptions={
                  { library, records, forecasts } as
                    | {
                        library: "hill";
                        records: HillData[];
                        forecasts: HillForecast[];
                      }
                    | {
                        library: "hunt";
                        records: HuntData[];
                        forecasts: HuntForecast[];
                      }
                }
                displayType={displayType ? "percent" : "count"}
                now={now}
              />
            </div>
            <div className="mt-5 mb-1 flex justify-between">
              <div>
                {/* this is wrapped in a div to prevent Toggle from taking up 
              the full flex div's height */}
                <Toggle
                  disabledText="counts"
                  enabledText="percent"
                  state={displayType}
                  setState={setDisplayType}
                />
              </div>
            </div>
          </div>
          {/* TODO: option to show areas? */}
        </div>
      );
    }
    case "loaded-notfound": {
      return (
        <div className={className}>
          <div className="bg-bg-dark rounded-lg shadow-maincard p-2 md:p-4 lg:p-5">
            <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-bold mb-1">
              {formattedLibrary}
            </h1>
            <h2 className="text-2xl">No data found, try again later.</h2>
          </div>
        </div>
      );
    }
  }
};

export const ComparisonComponent: React.FC = () => {
  return <div></div>;
};

export const Home: React.FC = () => {
  // not using state causes glitches
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(
      () => {
        // setting now causes data to be re-fetched and library
        // components to be re-rendered
        setNow(new Date());
      },
      // every 5 minutes
      1000 * 60 * 5
    );

    return () => clearInterval(interval);
  }, [now]);

  const [hillDataResponse, setHillDataResponse] = useState<HillDataResponse>({
    status: "loading",
  });

  useEffect(() => {
    (async () => {
      const hillDataResponse = await fetchHillRecords(nDaysBefore(now, 4));

      setHillDataResponse(hillDataResponse);
    })();
  }, [now]);

  const [huntDataResponse, setHuntDataResponse] = useState<HuntDataResponse>({
    status: "loading",
  });

  useEffect(() => {
    (async () => {
      const huntDataResponse = await fetchHuntRecords(nDaysBefore(now, 4));

      setHuntDataResponse(huntDataResponse);
    })();
  }, [now]);

  return (
    <>
      <div className="min-h-[100vh] bg-bg-darkest text-text-light">
        <div className="flex justify-center items-center">
          <h1 className="p-5 font-bold filter drop-shadow-header text-3xl md:text-6xl lg:text-6xl xl:text-6xl 2xl:text-7xl text-center">
            NCSU Library Busyness
          </h1>
        </div>
        <LibraryComponent
          data={{
            library: "hill",
            dataResponse: hillDataResponse,
          }}
          now={now}
          className="max-w-[100vw] p-2 lg:p-5"
        />
        <LibraryComponent
          data={{
            library: "hunt",
            dataResponse: huntDataResponse,
          }}
          now={now}
          className="max-w-[100vw] p-2 lg:p-5"
        />
        <div className="flex flex-col justify-center text-center py-8 px-2 text-sm sm:text-lg md:text-xl">
          <div>Last checked for new data at {now.toLocaleString()}</div>
        </div>
      </div>
    </>
  );
};

export default Home;
