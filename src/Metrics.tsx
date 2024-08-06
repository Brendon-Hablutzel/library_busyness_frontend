import { useState } from "react";
import { fetchMetrics, MetricsApiResponse } from "./utils/backend";
import { capitalize, formatPercent, nWeeksBefore } from "./utils";
import { ForecastMetricsChart } from "./Charts";

export const MetricsComponent: React.FC<{ className: string }> = ({
  className,
}) => {
  const [metricsResponse, setMetricsResponse] = useState<MetricsApiResponse>({
    status: "loading",
  });

  const [hidden, setHidden] = useState<boolean>(true);

  if (hidden) {
    return (
      <div
        className={className}
        onClick={async () => {
          setHidden(false);
          setMetricsResponse(await fetchMetrics(nWeeksBefore(new Date(), 4)));
        }}
      >
        <div className="flex justify-center">
          <div className="hover:cursor-pointer select-none text-center">
            Click here to see forecast accuracy metrics
          </div>
        </div>
      </div>
    );
  }

  switch (metricsResponse.status) {
    case "loading":
      return (
        <div className={className}>
          <div className="text-center">
            Loading metrics, this will take a few seconds...
          </div>
        </div>
      );
    case "error":
      return (
        <div className={className}>
          <div className="text-center">Error loading metrics</div>
        </div>
      );
    case "success":
      return (
        <div className={className}>
          <div className="min-h-[10vh]">
            <div className="p-5 xl:px-10">
              <h2 className="text-3xl md:text-4xl lg:text-4xl xl:text-4xl 2xl:text-5xl font-bold">
                Forecast Metrics
              </h2>
              <div className="pt-5">
                Below are metrics for evaluating the accuracy of the busyness
                forecasting model. They have been computed over prediction
                records from the past 4 weeks. Note that the aggregate stats are
                split into overall and daytime variants. Overall aggregate stats
                are computed across all forecast records, while daytime stats
                are only computed over records between TODO and TODO.
                {/* TODO: more description */}
              </div>
            </div>
            <div>
              {metricsResponse.metrics.map((libraryMetrics) => {
                return (
                  <div>
                    <div className="p-5 xl:px-10">
                      <h3 className="text-2xl md:text-3xl lg:text-3xl xl:text-3xl 2xl:text-4xl font-bold">
                        {capitalize(libraryMetrics.library)}
                      </h3>
                      <div>Over the past 4 weeks:</div>
                      <div title="the number of past forecast records with corresponding history records">
                        <span className="font-bold">
                          {libraryMetrics.overall.numForecastRecords}
                        </span>{" "}
                        forecast records were found
                      </div>
                      {/* TODO: keep average percent error? it's a bit confusing since we record percent busyness */}
                      {/* <div title="the average percent error of forecasted vs actual values, across all forecast records">
                        The overall average percent error was{" "}
                        {formatPercent(
                          libraryMetrics.overall.averagePercentError
                        )}
                      </div> */}
                      {/* TODO: configurable daytime hours */}
                      {/* <div title="the average percent error of forecasted vs actual values, across only records from TODO to TODO">
                        Average daytime percent error:{" "}
                        {formatPercent(
                          libraryMetrics.daytime.averagePercentError
                        )}
                      </div> */}
                      <div>
                        Busyness forecasts were off by an average of{" "}
                        <span className="font-bold">
                          {Math.round(libraryMetrics.overall.meanAbsoluteError)}
                        </span>{" "}
                        people over all records and off by an average of{" "}
                        <span className="font-bold">
                          {Math.round(libraryMetrics.daytime.meanAbsoluteError)}
                        </span>{" "}
                        over daytime records
                      </div>
                    </div>
                    <div className="flex justify-center w-[98vw] h-[40vh] lg:h-[60vh]">
                      <ForecastMetricsChart records={libraryMetrics.records} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="h-[5vh]"></div>
        </div>
      );
  }
};

// NOTE: use `title` attribute for details on hover
// METRICS:
// for each library:
// - total prediction records
// - average percent error (NOT percentage point error)
// - average occupancy count error (the average amount that the forecast total count is away from the actual total count)
// - daytime average percent error (what times?)
// - daytime average occupancy count error
