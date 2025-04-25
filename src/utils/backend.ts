import { ForecastRecord, HistoricalRecord, Library, LibraryMetrics, SummaryMetrics } from './models'

// currently, each API endpoint is located at a different URL,
// and these URLs can be configured via environment variables.
// these should be provided on the deployment platform

const HISTORICAL_RECORDS_API_URL = process.env.REACT_APP_HISTORICAL_RECORDS_API_URL

const FORECASTS_API_URL = process.env.REACT_APP_FORECASTS_API_URL

const METRICS_API_URL = process.env.REACT_APP_METRICS_API_URL

// below are functions that encapsulate logic for retrieving and generating
// backend URLs for various APIs. in case of future changes to the API route
// structure, these should be all that needs to be changed

export const getHistoricalRecordsUrl = (library: 'hill' | 'hunt', since?: Date): string => {
  if (!HISTORICAL_RECORDS_API_URL) {
    console.error('REACT_APP_HISTORICAL_RECORDS_API_URL environment variable is not defined')
  }

  return `${HISTORICAL_RECORDS_API_URL}/?library=${library}${since ? `&since=${since.valueOf()}` : ''}`
}

export const getForecastsUrl = (library: 'hill' | 'hunt', since?: Date): string => {
  if (!FORECASTS_API_URL) {
    console.error('REACT_APP_FORECASTS_API_URL environment variable is not defined')
  }

  return `${FORECASTS_API_URL}/?library=${library}${since ? `&since=${since.valueOf()}` : ''}`
}

export const getMetricsUrl = (since: Date) => {
  if (!METRICS_API_URL) {
    console.error('REACT_APP_METRICS_API_URL environment variable is not defined')
  }

  return `${METRICS_API_URL}/?since=${since.valueOf()}`
}

// possible states that a request for data can be in
export enum ResponseStatus {
  LOADING = 'loading',
  ERROR = 'error',
  LOADED = 'loaded',
}

// when fetching historical data from the backend, this is the body
// that should be returned
interface HistoricalBackendResponse<
  T extends BackendHillHistoricalRecord | BackendHuntHistoricalRecord,
> {
  success?: boolean
  busynessRecords?: T[]
}

// backend records--not to be used by any UI components

interface BackendHillHistoricalRecord {
  library: 'hill'
  record_datetime: number
  active: boolean
  total_count: number
  total_percent: number
  east_count: number
  east_percent: number
  tower_count: number
  tower_percent: number
  west_count: number
  west_percent: number
}

interface BackendHuntHistoricalRecord {
  library: 'hunt'
  record_datetime: number
  active: boolean
  total_count: number
  total_percent: number
  level2_count: number
  level2_percent: number
  level3_count: number
  level3_percent: number
  level4_count: number
  level4_percent: number
  level5_count: number
  level5_percent: number
}

// when fetching forecast data from the backend, this is the body that
// should be returned
interface ForecastBackendResponse<T extends BackendHillForecastRecord | BackendHuntForecastRecord> {
  success?: boolean
  busynessForecastRecords?: T[]
}

// backend records--not to be used in any UI components

interface BackendHillForecastRecord {
  library: 'hill#prediction'
  record_datetime: number
  total_count: number
  total_percent: number
}

interface BackendHuntForecastRecord {
  library: 'hunt#prediction'
  record_datetime: number
  total_count: number
  total_percent: number
}

// busyness data that will be returned for use in components
export type BusynessData =
  | {
      status: ResponseStatus.LOADING
    }
  | {
      status: ResponseStatus.LOADED
      historicalRecords: HistoricalRecord[]
      forecastRecords: ForecastRecord[]
    }
  | {
      status: ResponseStatus.ERROR
      error: unknown
    }

// fetches historical and forecast records for hill from the backend
export const fetchHillRecords = async (since: Date): Promise<BusynessData> => {
  try {
    const historicalResponse = await fetch(getHistoricalRecordsUrl('hill', since))
    // unchecked cast
    const historicalBody =
      (await historicalResponse.json()) as HistoricalBackendResponse<BackendHillHistoricalRecord>

    if (!historicalBody.success) {
      throw new Error('server was unable to process the request for historical records')
    }

    // reformat historical records and convert milliseconds epoch timestamps to
    // native Date
    const historicalRecords: HistoricalRecord[] = (historicalBody.busynessRecords ?? []).map(
      (record) => {
        return {
          active: record.active,
          record_datetime: new Date(record.record_datetime),
          total: {
            count: record.total_count,
            percent: record.total_percent,
          },
          areas: {
            east: {
              count: record.east_count,
              percent: record.east_percent,
            },
            tower: {
              count: record.tower_count,
              percent: record.tower_percent,
            },
            west: {
              count: record.west_count,
              percent: record.west_percent,
            },
          },
        }
      }
    )

    const forecastResponse = await fetch(getForecastsUrl('hill', new Date()))
    // unchecked cast
    const forecastBody =
      (await forecastResponse.json()) as ForecastBackendResponse<BackendHillForecastRecord>

    if (!forecastBody.success) {
      throw new Error('server was unable to process the request for forecast records')
    }

    // reformat forecast records, convert millisecond epoch timestamps to native
    // Date, and ensure that all predictions are at least 0
    const forecastRecords: ForecastRecord[] = (forecastBody.busynessForecastRecords ?? []).map(
      (forecast) => {
        return {
          ...forecast,
          record_datetime: new Date(forecast.record_datetime),
          forecasted_total: {
            count: Math.max(0, forecast.total_count),
            percent: Math.max(0, forecast.total_percent),
          },
        }
      }
    )

    return {
      status: ResponseStatus.LOADED,
      historicalRecords,
      forecastRecords,
    }
  } catch (e) {
    return {
      status: ResponseStatus.ERROR,
      error: e,
    }
  }
}

// fetches historical and forecast records for hunt from the backend
export const fetchHuntRecords = async (since: Date): Promise<BusynessData> => {
  try {
    const historicalResponse = await fetch(getHistoricalRecordsUrl('hunt', since))
    // unchecked cast
    const historicalBody =
      (await historicalResponse.json()) as HistoricalBackendResponse<BackendHuntHistoricalRecord>

    if (!historicalBody.success) {
      throw new Error('server was unable to process the request for historical records')
    }

    const historicalRecords: HistoricalRecord[] = (historicalBody.busynessRecords ?? []).map(
      (record) => {
        return {
          active: record.active,
          record_datetime: new Date(record.record_datetime),
          total: {
            count: record.total_count,
            percent: record.total_percent,
          },
          areas: {
            level2: {
              count: record.level2_count,
              percent: record.level2_percent,
            },
            level3: {
              count: record.level3_count,
              percent: record.level3_percent,
            },
            level4: {
              count: record.level4_count,
              percent: record.level4_percent,
            },
            level5: {
              count: record.level5_count,
              percent: record.level5_percent,
            },
          },
        }
      }
    )

    const forecastResponse = await fetch(getForecastsUrl('hunt', new Date()))
    // unchecked cast
    const forecastBody =
      (await forecastResponse.json()) as ForecastBackendResponse<BackendHuntForecastRecord>

    if (!forecastBody.success) {
      throw new Error('server was unable to process the request for forecast records')
    }

    const forecastRecords: ForecastRecord[] = (forecastBody.busynessForecastRecords ?? []).map(
      (forecast) => {
        return {
          ...forecast,
          record_datetime: new Date(forecast.record_datetime),
          forecasted_total: {
            count: Math.max(0, forecast.total_count),
            percent: Math.max(0, forecast.total_percent),
          },
        }
      }
    )

    return {
      status: ResponseStatus.LOADED,
      historicalRecords,
      forecastRecords,
    }
  } catch (e) {
    return {
      status: ResponseStatus.ERROR,
      error: e,
    }
  }
}

// when fetching metrics data from the backend, this is what should
// be returned (NOTE: includes all libraries). this should be used by
// any UI component
interface MetricsBackendResponse {
  success?: boolean
  metrics?: {
    library: Library
    records: {
      total_count_actual: number
      total_count_predicted: number
      record_datetime: number
    }[]
    overall: SummaryMetrics
    daytime: SummaryMetrics
  }[]
}

// metrics data that will be returned for use in components
export type MetricsData =
  | {
      status: ResponseStatus.LOADING
    }
  | {
      status: ResponseStatus.ERROR
      error: unknown
    }
  | {
      status: ResponseStatus.LOADED
      metrics: LibraryMetrics[]
    }

// fetches forecast metrics from the backend (NOTE: this includes both libraries)
export const fetchMetrics = async (since: Date): Promise<MetricsData> => {
  try {
    const metricsResponse = await fetch(getMetricsUrl(since))
    // unchecked cast
    const metricsBody = (await metricsResponse.json()) as MetricsBackendResponse

    if (!metricsBody.success || metricsBody.metrics === undefined) {
      throw new Error('server was unable to process the request for metrics')
    }

    // reformat the metrics records and convert millisecond epoch timestamps
    // to native Date
    const metrics: LibraryMetrics[] = metricsBody.metrics.map((metric) => {
      return {
        ...metric,
        records: metric.records.map((record) => {
          const { record_datetime, total_count_actual, total_count_predicted } = record
          return {
            total: {
              count: {
                actual: total_count_actual,
                predicted: total_count_predicted,
              },
            },
            record_datetime: new Date(record_datetime),
          }
        }),
      }
    })

    return {
      status: ResponseStatus.LOADED,
      metrics,
    }
  } catch (e) {
    return {
      status: ResponseStatus.ERROR,
      error: e,
    }
  }
}
