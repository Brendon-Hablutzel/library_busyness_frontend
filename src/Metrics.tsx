import { useEffect, useState } from "react";
import { fetchMetrics, MetricsData, ResponseStatus } from "./utils/backend";
import { capitalize, nWeeksBefore } from "./utils";
import { ForecastMetricsChart } from "./Charts";
import { LibraryMetrics } from "./utils/models";

// the number of prior weeks to show metrics for
const METRICS_PRIOR_WEEKS = 4;

// component to display while metrics are being fetched
const LoadingMetricsComponent: React.FC = () => {
  return (
    <div className="flex justify-center">
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
  );
};

// will display the metrics that were fetched from the backend. this is library
// specific, e.g. one of these should be displayed per library
const LoadedMetricsComponent: React.FC<{
  metrics: LibraryMetrics;
}> = ({ metrics }) => {
  return (
    <div className="max-w-[100vw] p-2 lg:p-5">
      <div className="bg-bg-dark rounded-lg shadow-maincard p-2 md:p-4 lg:p-5">
        <div className="mb-2 lg:flex lg:justify-between lg:items-center">
          <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-bold">
            {capitalize(metrics.library)}
          </h2>
          <h2 className="py-1 lg:py-0 text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
            <span className="font-bold">
              {metrics.overall.numForecastRecords}
            </span>{" "}
            forecast data points generated over the past{" "}
            <span className="font-bold">{METRICS_PRIOR_WEEKS} weeks</span>
          </h2>
        </div>
        {metrics.records.length > 0 ? (
          <div>
            <div className="flex flex-col gap-2 lg:flex-row lg:justify-start mb-5">
              <div
                className={`bg-bg-medium py-1 px-2 lg:py-2 rounded-md shadow-lg`}
              >
                <div className="text-lg sm:text-2xl md:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl lg:px-1 xl:px-2">
                  <span className="italic">overall</span> mean absolute error of{" "}
                  <span className={`font-semibold`}>
                    {Math.round(metrics.overall.meanAbsoluteError)} people
                  </span>
                </div>
              </div>
              <div
                className={`bg-bg-medium py-1 px-2 lg:py-2 rounded-md shadow-lg`}
              >
                <div className="text-lg sm:text-2xl md:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl lg:px-1 xl:px-2">
                  <span className="italic">daytime</span> mean absolute error of{" "}
                  <span className={`font-semibold`}>
                    {Math.round(metrics.daytime.meanAbsoluteError)} people
                  </span>{" "}
                </div>
              </div>
            </div>
            <div className="flex justify-center h-[40vh] lg:h-[60vh] mb-4">
              <ForecastMetricsChart records={metrics.records} />
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export const Metrics: React.FC = () => {
  // fetch metrics data when the component first loads; do not regularly
  // re-fetch.
  const [metricsResponse, setMetricsResponse] = useState<MetricsData>({
    status: ResponseStatus.LOADING,
  });

  const [now, _] = useState<Date>(new Date());

  useEffect(() => {
    (async () => {
      // NOTE: this typically takes a while--the backend has to fetch
      // and process lots of data
      setMetricsResponse(
        await fetchMetrics(nWeeksBefore(new Date(), METRICS_PRIOR_WEEKS))
      );
    })();
  }, []);

  // the sub-component to display--different depending on the status of the request, e.g.,
  // loading, loaded, or error
  let component: React.ReactElement = <LoadingMetricsComponent />;

  switch (metricsResponse.status) {
    case ResponseStatus.ERROR:
      console.error(metricsResponse.error);

      component = (
        <div className="text-center">
          Error loading metrics, please try again
        </div>
      );
      break;
    case ResponseStatus.LOADED:
      component = (
        <div>
          {metricsResponse.metrics.map((metrics) => {
            return <LoadedMetricsComponent metrics={metrics} />;
          })}
          <div className="flex flex-col justify-center text-center py-8 px-2 text-sm sm:text-lg md:text-xl">
            <div>Metrics fetched at {now.toLocaleString()}</div>
          </div>
        </div>
      );
      break;
  }

  return (
    <div className="min-h-[100vh] max-w-[100vw] bg-bg-darkest text-text-light">
      <div className="p-5 flex flex-col gap-5">
        <div className="flex justify-center items-center">
          <h1 className="font-bold filter drop-shadow-header text-3xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl 2xl:text-7xl text-center">
            NC State Library Busyness Metrics
          </h1>
        </div>
        {/* <div className="flex justify-center items-center">
          <h1 className="font-bold filter drop-shadow-header text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-3xl 2xl:text-4xl text-center">
            Forecast Metrics
          </h1>
        </div> */}
      </div>
      {component}
    </div>
  );
};
