import { z } from 'zod'
import { ForecastRecord, HistoricalRecord, Library, LibraryMetrics, SummaryMetrics } from './models'

// currently, each API endpoint is located at a different URL,
// and these URLs can be configured via environment variables.
// these should be provided on the deployment platform

const API_URL = process.env.REACT_APP_API_URL

// below are functions that encapsulate logic for retrieving and generating
// backend URLs for various APIs. in case of future changes to the API route
// structure, these should be all that needs to be changed

export const getApiUrl = (): string => {
  if (!API_URL) {
    throw new Error('REACT_APP_API_URL environment variable is not defined')
  }

  return API_URL
}

// possible states that a request for data can be in
export enum ResponseStatus {
  LOADING = 'loading',
  ERROR = 'error',
  LOADED = 'loaded',
}

// when fetching historical or forecast data from the backend, this is the body
const generateBackendResponse = <T extends z.ZodRawShape>(successSchema: T) => {
  return z.discriminatedUnion('success', [
    z.object({
      success: z.literal(true),
      ...successSchema,
    }),
    z.object({
      success: z.literal(false),
      message: z.string(),
    }),
  ])
}

// backend records--not to be used by any UI components

// these `*DataRecord`s are taken from the backend and must be kept in sync

// note that the area count values may be null in the database, but the backend will transform
// any null values into 0
const HillDataRecord = z.object({
  library: z.literal('hill'),
  record_datetime: z.number(),
  active: z.boolean(),
  total_count: z.number(),
  total_percent: z.number(),
  east_count: z.number(),
  east_percent: z.number(),
  tower_count: z.number(),
  tower_percent: z.number(),
  west_count: z.number(),
  west_percent: z.number(),
})

const HuntDataRecord = z.object({
  library: z.literal('hunt'),
  record_datetime: z.number(),
  active: z.boolean(),
  total_count: z.number(),
  total_percent: z.number(),
  level2_count: z.number(),
  level2_percent: z.number(),
  level3_count: z.number(),
  level3_percent: z.number(),
  level4_count: z.number(),
  level4_percent: z.number(),
  level5_count: z.number(),
  level5_percent: z.number(),
})

const HillHistoricalBackendResponse = generateBackendResponse({
  busynessRecords: z.array(HillDataRecord),
})

const HuntHistoricalBackendResponse = generateBackendResponse({
  busynessRecords: z.array(HuntDataRecord),
})

// backend records--not to be used in any UI components

// these `*ForecastDataRecord`s are taken from the backend and must be kept in sync

const HillForecastRecord = z.object({
  library: z.literal('hill#prediction'),
  record_datetime: z.number(),
  total_count: z.number(),
  total_percent: z.number(),
})

const HuntForecastRecord = z.object({
  library: z.literal('hunt#prediction'),
  record_datetime: z.number(),
  total_count: z.number(),
  total_percent: z.number(),
})

const HillForecastBackendResponse = generateBackendResponse({
  busynessForecastRecords: z.array(HillForecastRecord),
})

const HuntForecastBackendResponse = generateBackendResponse({
  busynessForecastRecords: z.array(HuntForecastRecord),
})

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
    const historicalResponse = await fetch(
      `${getApiUrl()}/historical/hill?since=${since.getTime()}`,
    )
    const rawHistoricalData = await historicalResponse.json()
    const historicalBody = HillHistoricalBackendResponse.parse(rawHistoricalData)

    if (!historicalBody.success) {
      throw new Error('server was unable to process the request for historical records')
    }

    // reformat historical records and convert milliseconds epoch timestamps to
    // native Date
    const historicalRecords = (historicalBody.busynessRecords ?? []).map((record) => {
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
    })

    const forecastResponse = await fetch(
      `${getApiUrl()}/forecast/hill?since=${new Date().getTime()}`,
    )
    const rawForecastData = await forecastResponse.json()
    const forecastBody = HillForecastBackendResponse.parse(rawForecastData)

    if (!forecastBody.success) {
      throw new Error('server was unable to process the request for forecast records')
    }

    // reformat forecast records, convert millisecond epoch timestamps to native
    // Date, and ensure that all predictions are at least 0
    const forecastRecords = (forecastBody.busynessForecastRecords ?? []).map((forecast) => {
      return {
        ...forecast,
        record_datetime: new Date(forecast.record_datetime),
        forecasted_total: {
          count: Math.max(0, forecast.total_count),
          percent: Math.max(0, forecast.total_percent),
        },
      }
    })

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
    const historicalResponse = await fetch(
      `${getApiUrl()}/historical/hunt?since=${since.getTime()}`,
    )
    const rawHistoricalData = await historicalResponse.json()
    const historicalBody = HuntHistoricalBackendResponse.parse(rawHistoricalData)

    if (!historicalBody.success) {
      throw new Error('server was unable to process the request for historical records')
    }

    const historicalRecords = (historicalBody.busynessRecords ?? []).map((record) => {
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
    })

    const forecastResponse = await fetch(
      `${getApiUrl()}/forecast/hunt?since=${new Date().getTime()}`,
    )
    const rawForecastData = await forecastResponse.json()
    const forecastBody = HuntForecastBackendResponse.parse(rawForecastData)

    if (!forecastBody.success) {
      throw new Error('server was unable to process the request for forecast records')
    }

    const forecastRecords = (forecastBody.busynessForecastRecords ?? []).map((forecast) => {
      return {
        ...forecast,
        record_datetime: new Date(forecast.record_datetime),
        forecasted_total: {
          count: Math.max(0, forecast.total_count),
          percent: Math.max(0, forecast.total_percent),
        },
      }
    })

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
    const metricsResponse = await fetch(`${getApiUrl()}/metrics?since=${since.getTime()}`)
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
