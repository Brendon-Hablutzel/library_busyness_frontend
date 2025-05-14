// contains models used in UI components

// possible libraries
export type Library = 'hill' | 'hunt'

// a map from library name -> areas
export const libraryAreas: {
  [key in Library]: string[]
} = {
  hill: ['east', 'tower', 'west'],
  hunt: ['level2', 'level3', 'level4', 'level5'],
}

// busyness data for a library area
export interface AreaBusyness {
  count: number
  percent: number
}

// a record of library busyness at a past moment
export interface HistoricalRecord {
  record_datetime: Date
  total: AreaBusyness
  active: boolean
  areas: {
    [area: string]: AreaBusyness
  }
}

// a record of a forecast for library busyness at a point in the future
export interface ForecastRecord {
  record_datetime: Date
  forecasted_total: AreaBusyness
}

// summary metrics for forecasts over some duration
export interface SummaryMetrics {
  numForecastRecords: number
  averagePercentError: number
  meanAbsoluteError: number
}

// a record that contains the actual and forecasted total busyness
// of a library at a moment in the past
export interface MetricsRecord {
  total: {
    count: {
      actual: number
      predicted: number
    }
  }
  record_datetime: Date
}

// metrics for the forecasts for a library
export interface LibraryMetrics {
  library: Library
  records: MetricsRecord[]
  overall: SummaryMetrics
  daytime: SummaryMetrics
}
