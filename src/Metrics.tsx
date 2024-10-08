import { useEffect, useState } from "react";
import { fetchMetrics, MetricsApiResponse } from "./utils/backend";
import { capitalize, /*formatPercent*/ nWeeksBefore } from "./utils";
import { ForecastMetricsChart } from "./Charts";

export const Metrics: React.FC = () => {
  const [metricsResponse, setMetricsResponse] = useState<MetricsApiResponse>({
    status: "loading",
  });

  const priorWeeks = 4;

  useEffect(() => {
    (async () => {
      setMetricsResponse(
        await fetchMetrics(nWeeksBefore(new Date(), priorWeeks))
      );
    })();
  }, []);

  const now = new Date();

  switch (metricsResponse.status) {
    case "loading":
      return (
        <div className="min-h-[100vh] max-w-[100vw] bg-bg-darkest text-text-light">
          <div className="p-5 flex flex-col gap-5">
            <div className="flex justify-center items-center">
              <h1 className="font-bold filter drop-shadow-header text-3xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl 2xl:text-7xl text-center">
                NCSU Library Busyness
              </h1>
            </div>
            <div className="flex justify-center items-center">
              <h1 className="font-bold filter drop-shadow-header text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-3xl 2xl:text-4xl text-center">
                Forecast Metrics
              </h1>
            </div>
          </div>
          <div className="text-center">
            Loading metrics, this will take a few seconds...
          </div>
        </div>
      );
    case "error":
      console.error(metricsResponse.error);
      return (
        <div className="min-h-[100vh] max-w-[100vw] bg-bg-darkest text-text-light">
          <div className="p-5 flex flex-col gap-5">
            <div className="flex justify-center items-center">
              <h1 className="font-bold filter drop-shadow-header text-3xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl 2xl:text-7xl text-center">
                NCSU Library Busyness
              </h1>
            </div>
            <div className="flex justify-center items-center">
              <h1 className="font-bold filter drop-shadow-header text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-3xl 2xl:text-4xl text-center">
                Forecast Metrics
              </h1>
            </div>
          </div>
          <div className="text-center">
            Error loading metrics, please try again
          </div>
        </div>
      );
    case "success":
      return (
        <div className="min-h-[100vh] max-w-[100vw] bg-bg-darkest text-text-light">
          <div className="p-5 flex flex-col gap-5">
            <div className="flex justify-center items-center">
              <h1 className="font-bold filter drop-shadow-header text-3xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl 2xl:text-7xl text-center">
                NCSU Library Busyness
              </h1>
            </div>
            <div className="flex justify-center items-center">
              <h1 className="font-bold filter drop-shadow-header text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-3xl 2xl:text-4xl text-center">
                Forecast Metrics
              </h1>
            </div>
          </div>
          <div>
            {metricsResponse.metrics.map((libraryMetrics) => {
              return (
                <div className="max-w-[100vw] p-2 lg:p-5">
                  <div className="bg-bg-dark rounded-lg shadow-maincard p-2 md:p-4 lg:p-5">
                    <div className="mb-2 lg:flex lg:justify-between lg:items-center">
                      <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-bold">
                        {capitalize(libraryMetrics.library)}
                      </h2>
                      <h2 className="py-1 lg:py-0 text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
                        <span className="font-bold">
                          {libraryMetrics.overall.numForecastRecords}
                        </span>{" "}
                        forecast data points generated over the past{" "}
                        <span className="font-bold">{priorWeeks} weeks</span>
                      </h2>
                    </div>
                    <div className="flex flex-col gap-2 lg:flex-row lg:justify-start mb-5">
                      <div
                        className={`bg-bg-medium py-1 px-2 lg:py-2 rounded-md shadow-lg`}
                      >
                        <div className="text-lg sm:text-2xl md:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl lg:px-1 xl:px-2">
                          <span className="italic">overall</span> mean absolute
                          error of{" "}
                          <span className={`font-semibold`}>
                            {Math.round(
                              libraryMetrics.overall.meanAbsoluteError
                            )}{" "}
                            people
                          </span>{" "}
                        </div>
                      </div>
                      <div
                        className={`bg-bg-medium py-1 px-2 lg:py-2 rounded-md shadow-lg`}
                      >
                        <div className="text-lg sm:text-2xl md:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl lg:px-1 xl:px-2">
                          <span className="italic">daytime</span> mean absolute
                          error of{" "}
                          <span className={`font-semibold`}>
                            {Math.round(
                              libraryMetrics.daytime.meanAbsoluteError
                            )}{" "}
                            people
                          </span>{" "}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center h-[40vh] lg:h-[60vh] mb-4">
                      <ForecastMetricsChart records={libraryMetrics.records} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col justify-center text-center py-8 px-2 text-sm sm:text-lg md:text-xl">
            <div>Metrics fetched at {now.toLocaleString()}</div>
          </div>
        </div>
      );
  }
};
