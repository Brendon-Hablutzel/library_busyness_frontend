import { useEffect, useState } from "react";
import { HillData, HillForecast, HuntData, HuntForecast } from "./utils/models";
import {
  fetchHillRecords,
  fetchHuntRecords,
  HillDataResponse,
  HuntDataResponse,
} from "./utils/backend";
import { BusynessAreaChart } from "./Charts";
import {
  capitalize,
  formatPercent,
  getNearestItemByFn,
  nDaysBefore,
  nHoursAfter,
} from "./utils";
import { Toggle } from "./Toggle";

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
          <h1 className="text-center p-5">
            Fetching {formattedLibrary} data...
          </h1>
        </div>
      );
    }
    case "loaded-error": {
      return (
        <div className={className}>
          <h1 className="text-center p-5">
            Error fetching {formattedLibrary} data - if you are using an
            adblocker, try disabling it
          </h1>
        </div>
      );
    }
    case "loaded-found": {
      const { records, mostRecentRecord, forecasts } = dataResponse;

      const mostRecentCount = mostRecentRecord.total_count;
      const mostRecentPercent = mostRecentRecord.total_percent;

      const hourAheadRecord = getNearestItemByFn<HillForecast | HuntForecast>(
        forecasts,
        (item) => item.record_datetime,
        nHoursAfter(now, 1).valueOf()
      );
      const hourAheadCount =
        hourAheadRecord !== undefined ? hourAheadRecord.total_count : undefined;

      const nextHourPercentChange =
        hourAheadCount !== undefined
          ? (hourAheadCount - mostRecentCount) / mostRecentCount
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
          ? (mostRecentCount - dayAgoCount) / dayAgoCount
          : undefined;

      return (
        <div className={className}>
          <div className="min-h-[10vh] p-5 xl:px-10">
            <h2 className="text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-bold">
              {formattedLibrary}
            </h2>
            <div className="lg:flex lg:justify-between">
              <div className="flex justify-between lg:block">
                <h3 className="text-3xl md:text-4xl lg:text-3xl xl:text-3xl 2xl:text-4xl">
                  <span className="font-semibold">{mostRecentCount}</span>{" "}
                  people
                </h3>
                <h3 className="text-3xl md:text-4xl lg:text-2xl xl:text-2xl 2xl:text-3xl">
                  <span className="font-semibold">
                    {formatPercent(mostRecentPercent)}
                  </span>{" "}
                  full
                </h3>
              </div>
              <div className="lg:text-right">
                {nextHourPercentChange === undefined ||
                Math.round(nextHourPercentChange * 100) === 0 ? (
                  <div className="text-lg md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl">
                    busyness not expected to change over the next hour
                  </div>
                ) : (
                  <div className="text-lg md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl">
                    busyness expected to go{" "}
                    {nextHourPercentChange > 0 ? "up" : "down"} by{" "}
                    <span
                      className={`${nextHourPercentChange > 0 ? "text-red-500" : "text-green-500"} font-semibold`}
                    >
                      {formatPercent(nextHourPercentChange, true)}
                    </span>{" "}
                    over the next hour
                  </div>
                )}
                {lastDayPercentChange === undefined ||
                Math.round(lastDayPercentChange * 100) === 0 ? (
                  <div className="text-md md:text-xl lg:text-2xl xl:text-2xl 2xl:text-3xl">
                    no change in busyness compared to this time yesterday
                  </div>
                ) : (
                  <div className="text-md md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-3xl">
                    busyness{" "}
                    <span
                      className={`${lastDayPercentChange > 0 ? "text-red-500" : "text-green-500"} font-semibold`}
                    >
                      {formatPercent(lastDayPercentChange, true)}
                    </span>{" "}
                    {lastDayPercentChange > 0 ? "higher" : "lower"} than this
                    time yesterday
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 98vw is a hack because responsive container at 100vw makes its parent
          element overflow */}
          <div className="flex justify-center w-[98vw] h-[35vh] lg:h-[50vh]">
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
          <div className="min-h-[3vh] p-5 xl:px-10 flex justify-between">
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
            {/* <div className="text-right">
              Last checked {formattedLibrary} busyness at {at.toLocaleString()}
            </div> */}
          </div>
          {/* TODO: option to show areas? */}
        </div>
      );
    }
    case "loaded-notfound": {
      return (
        <div className={className}>
          <h1 className="text-center p-5">No {formattedLibrary} data found</h1>
        </div>
      );
    }
  }
};

export const ComparisonComponent: React.FC = () => {
  return <div></div>;
};

export const App: React.FC = () => {
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
      <div className="min-h-[10vh] max-w-[100vw] flex justify-center items-center bg-bg-darkest text-text-light">
        <h1 className="p-5 pb-0 text-3xl md:text-6xl lg:text-6xl xl:text-6xl 2xl:text-7xl text-center">
          NCSU Library Busyness
        </h1>
      </div>
      <LibraryComponent
        data={{
          library: "hill",
          dataResponse: hillDataResponse,
        }}
        now={now}
        className="max-w-[100vw] min-h-[55vh] bg-bg-darkest text-text-light"
      />
      <LibraryComponent
        data={{
          library: "hunt",
          dataResponse: huntDataResponse,
        }}
        now={now}
        className="max-w-[100vw] min-h-[55vh] bg-bg-darkest text-text-light"
      />
      <div className="h-[10vh] bg-bg-darkest text-text-light text-center text-sm sm:text-lg md:text-xl">
        Last checked for new data at {now.toLocaleString()}
      </div>
    </>
  );
};

export default App;
