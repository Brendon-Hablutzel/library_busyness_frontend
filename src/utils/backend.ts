import { maxByFn } from ".";
import { HillData, HillForecast, HuntData, HuntForecast } from "./models";

const HISTORICAL_RECORDS_API_URL =
  process.env.REACT_APP_HISTORICAL_RECORDS_API_URL;

const FORECASTS_API_URL = process.env.REACT_APP_FORECASTS_API_URL;

export const getHistoricalRecordsUrl = (
  library: "hill" | "hunt",
  since?: Date
): string => {
  if (!HISTORICAL_RECORDS_API_URL) {
    console.error(
      "REACT_APP_HISTORICAL_RECORDS_API_URL environment variable is not defined"
    );
  }

  return `${HISTORICAL_RECORDS_API_URL}/?library=${library}${since ? `&since=${since.valueOf()}` : ""}`;
};

export const getForecastsUrl = (
  library: "hill" | "hunt",
  since?: Date
): string => {
  if (!FORECASTS_API_URL) {
    console.error(
      "REACT_APP_FORECASTS_API_URL environment variable is not defined"
    );
  }

  return `${FORECASTS_API_URL}/?library=${library}${since ? `&since=${since.valueOf()}` : ""}`;
};

type ApiResponse<
  T extends HillData | HuntData,
  U extends HillForecast | HuntForecast,
> =
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
      forecasts: U[];
      //   fetchedAt: Date;
    }
  | {
      status: "loaded-notfound";
    };

export type HillDataResponse = ApiResponse<HillData, HillForecast>;

export type HuntDataResponse = ApiResponse<HuntData, HuntForecast>;

export const fetchHillRecords = async (
  since: Date
): Promise<HillDataResponse> => {
  try {
    const result = await fetch(getHistoricalRecordsUrl("hill", since));
    const parsed = await result.json();
    const records = parsed.busynessRecords as HillData[];

    const forecastsResult = await fetch(getForecastsUrl("hill", new Date()));
    const parsedForecasts = await forecastsResult.json();
    const forecasts =
      (await parsedForecasts.busynessForecastRecords) as HillForecast[];

    if (records.length > 0) {
      // cannot be undefined because there is at least one record
      const mostRecentRecord = maxByFn(
        records,
        (record) => record.record_datetime
      ) as HillData;

      return {
        status: "loaded-found",
        records,
        mostRecentRecord,
        forecasts,
      };
    } else {
      return {
        status: "loaded-notfound",
      };
    }
  } catch (e) {
    return {
      status: "loaded-error",
      error: e,
    };
  }
};

export const fetchHuntRecords = async (
  since: Date
): Promise<HuntDataResponse> => {
  try {
    const recordsResult = await fetch(getHistoricalRecordsUrl("hunt", since));
    const parsedRecords = await recordsResult.json();
    const records = parsedRecords.busynessRecords as HuntData[];

    const forecastsResult = await fetch(getForecastsUrl("hunt", new Date()));
    const parsedForecasts = await forecastsResult.json();
    const forecasts =
      (await parsedForecasts.busynessForecastRecords) as HuntForecast[];

    if (records.length > 0) {
      // cannot be undefined because there is at least one record
      const mostRecentRecord = maxByFn(
        records,
        (record) => record.record_datetime
      ) as HuntData;

      return {
        status: "loaded-found",
        records,
        mostRecentRecord,
        forecasts,
      };
    } else {
      return {
        status: "loaded-notfound",
      };
    }
  } catch (e) {
    return {
      status: "loaded-error",
      error: e,
    };
  }
};
