export interface HillData {
  library: "hill";
  record_datetime: number;
  active: boolean;
  total_count: number;
  total_percent: number;
  east_count: number;
  east_percent: number;
  tower_count: number;
  tower_percent: number;
  west_count: number;
  west_percent: number;
}

export interface HuntData {
  library: "hunt";
  record_datetime: number;
  active: boolean;
  total_count: number;
  total_percent: number;
  level2_count: number;
  level2_percent: number;
  level3_count: number;
  level3_percent: number;
  level4_count: number;
  level4_percent: number;
  level5_count: number;
  level5_percent: number;
}

export interface HillForecast {
  library: "hill#prediction";
  record_datetime: number;
  total_count: number;
  total_percent: number;
}

export interface HuntForecast {
  library: "hunt#prediction";
  record_datetime: number;
  total_count: number;
  total_percent: number;
}

export type BasicMetrics = {
  numForecastRecords: number;
  averagePercentError: number;
  meanAbsoluteError: number;
};

export type LibraryForecastMetrics = {
  library: "hill" | "hunt";
  overall: BasicMetrics;
  daytime: BasicMetrics;
  records: {
    record_datetime: number;
    total_count_actual: number;
    total_count_predicted: number;
  }[];
};
