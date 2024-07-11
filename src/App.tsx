import { useEffect, useState } from "react";
import { HillData, HuntData } from "./models";
import { BusynessAreaChart } from "./Charts";
import {
  capitalize,
  formatPercent,
  getClosestTo,
  maxByFn,
  oneDayBefore,
  oneHourBefore,
  oneWeekBefore,
} from "./utils";
import { Toggle } from "./Toggle";

const API_URL = process.env.REACT_APP_API_URL;

const getUrl = (library: "hill" | "hunt", since?: number): string => {
  if (!API_URL) {
    console.error("REACT_APP_API_URL environment variable is not defined");
  }

  return `${API_URL}/?library=${library}${since ? `&since=${since}` : ""}`;
};

type BusynessDataResponse<T extends HillData | HuntData> =
  | {
      status: "loading";
    }
  | {
      status: "loaded-error";
      error: unknown;
    }
  | {
      status: "loaded-found";
      records: T[];
      mostRecentRecord: T;
      fetchedAt: Date;
    }
  | {
      status: "loaded-notfound";
    };

type HillDataResponse = BusynessDataResponse<HillData>;

type HuntDataResponse = BusynessDataResponse<HuntData>;

const LibraryComponent: React.FC<{
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
}> = ({ data, className, now }) => {
  const { library, dataResponse } = data;
  const formattedLibrary = capitalize(library);

  // disabled/false => counts
  // enabled/true => percents
  const [displayType, setDisplayType] = useState<boolean>(false);

  switch (dataResponse.status) {
    case "loading": {
      return (
        <div className={className}>
          <h1 className="text-center">Fetching {formattedLibrary} data...</h1>
        </div>
      );
    }
    case "loaded-error": {
      return (
        <div className={className}>
          <h1 className="text-center">
            Error fetching {formattedLibrary} data - if you are using an
            adblocker, try disabling it
          </h1>
        </div>
      );
    }
    case "loaded-found": {
      const { records, mostRecentRecord, fetchedAt } = dataResponse;
      const oneHourAgo = oneHourBefore(now);
      const oneDayAgo = oneDayBefore(now);

      const hourAgoRecord = getClosestTo<{
        record_datetime: number;
        total_count: number;
      }>(records, (item) => item.record_datetime, oneHourAgo.valueOf());

      const lastHourPercentChange =
        hourAgoRecord !== undefined
          ? (mostRecentRecord.total_count - hourAgoRecord.total_count) /
            hourAgoRecord.total_count
          : undefined;

      const dayAgoRecord = getClosestTo<{
        record_datetime: number;
        total_count: number;
      }>(records, (item) => item.record_datetime, oneDayAgo.valueOf());

      const lastDayPercentChange =
        dayAgoRecord !== undefined
          ? (mostRecentRecord.total_count - dayAgoRecord.total_count) /
            dayAgoRecord.total_count
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
                  <span className="font-semibold">
                    {mostRecentRecord.total_count}
                  </span>{" "}
                  people
                </h3>
                <h3 className="text-3xl md:text-4xl lg:text-2xl xl:text-2xl 2xl:text-3xl">
                  <span className="font-semibold">
                    {formatPercent(mostRecentRecord.total_percent)}
                  </span>{" "}
                  full
                </h3>
              </div>
              <div className="lg:text-right">
                {lastHourPercentChange === undefined ||
                Math.abs(Math.round(lastHourPercentChange * 100)) === 0 ? (
                  <div className="text-lg md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl">
                    no change in busyness over the past hour
                  </div>
                ) : (
                  <div className="text-lg md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl">
                    busyness {lastHourPercentChange > 0 ? "up" : "down"} by{" "}
                    <span
                      className={`${lastHourPercentChange > 0 ? "text-red-500" : "text-green-500"} font-semibold`}
                    >
                      {formatPercent(lastHourPercentChange, true)}
                    </span>{" "}
                    over the past hour
                  </div>
                )}
                {lastDayPercentChange === undefined ||
                Math.abs(Math.round(lastDayPercentChange * 100)) === 0 ? (
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
          {/* 98vw is a hack because responsive container seems to always make its parent
          element overflow */}
          <div className="flex justify-center w-[98vw] h-[40vh]">
            <BusynessAreaChart
              // type assertion is valid because of LibraryComponent props
              recordOptions={
                { library, records } as
                  | { library: "hill"; records: HillData[] }
                  | { library: "hunt"; records: HuntData[] }
              }
              displayType={displayType ? "percent" : "count"}
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
            <div className="text-right">
              Last checked for {formattedLibrary} updates at{" "}
              {fetchedAt.toLocaleString()}
            </div>
          </div>
          {/* TODO: option to show areas */}
        </div>
      );
    }
    case "loaded-notfound": {
      return (
        <div className={className}>
          <h1 className="text-center">No {formattedLibrary} data found</h1>
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
      try {
        const result = await fetch(
          getUrl("hill", oneWeekBefore(now).valueOf())
        );
        const parsed = await result.json();
        const records = parsed.busynessRecords as HillData[];

        if (records.length > 0) {
          // must exist because there is at least one record
          const mostRecentRecord = maxByFn(
            records,
            (item) => item.record_datetime
          ) as HillData;

          setHillDataResponse({
            status: "loaded-found",
            records,
            mostRecentRecord,
            fetchedAt: now,
          });
        } else {
          setHillDataResponse({
            status: "loaded-notfound",
          });
        }
      } catch (e) {
        setHillDataResponse({
          status: "loaded-error",
          error: e,
        });
      }
    })();
  }, [now]);

  const [huntDataResponse, setHuntDataResponse] = useState<HuntDataResponse>({
    status: "loading",
  });

  useEffect(() => {
    (async () => {
      try {
        const result = await fetch(
          getUrl("hunt", oneWeekBefore(now).valueOf())
        );
        const parsed = await result.json();
        const records = parsed.busynessRecords as HuntData[];

        if (records.length > 0) {
          // must exist because there is at least one record
          const mostRecentRecord = maxByFn(
            records,
            (item) => item.record_datetime
          ) as HuntData;

          setHuntDataResponse({
            status: "loaded-found",
            records,
            mostRecentRecord,
            fetchedAt: now,
          });
        } else {
          setHuntDataResponse({
            status: "loaded-notfound",
          });
        }
      } catch (e) {
        setHuntDataResponse({
          status: "loaded-error",
          error: e,
        });
      }
    })();
  }, [now]);

  return (
    <>
      <div className="min-h-[10vh] max-w-[100vw] flex justify-center items-center bg-bg-darkest text-text-light">
        <h1 className="p-5 text-4xl md:text-6xl lg:text-6xl xl:text-6xl 2xl:text-7xl text-center">
          NCSU Library Busyness
        </h1>
      </div>
      <LibraryComponent
        data={{ library: "hill", dataResponse: hillDataResponse }}
        now={now}
        className="max-w-[100vw] min-h-[55vh] bg-bg-darkest text-text-light"
      />
      <LibraryComponent
        data={{ library: "hunt", dataResponse: huntDataResponse }}
        now={now}
        className="max-w-[100vw] min-h-[55vh] bg-bg-darkest text-text-light"
      />
      <div className="h-[5vh] bg-bg-darkest"></div>
    </>
  );
};

export default App;
