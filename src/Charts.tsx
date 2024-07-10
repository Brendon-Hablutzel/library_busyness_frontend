import { HillData, HuntData } from "./models";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { capitalize, formatPercent, padOneZero } from "./utils";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { scaleTime } from "d3-scale";

const formatTimestampFull = (epochTimestampMillis: number) => {
  const when = new Date(epochTimestampMillis);
  return when.toLocaleString();
};

const formatTimestampSimple = (epochTimestampMillis: number) => {
  const when = new Date(epochTimestampMillis);
  return `${when.getMonth() + 1}/${when.getDate()} ${padOneZero(when.getHours())}:${padOneZero(when.getMinutes())}`;
};

const graphColors = ["#82acca", "#82ca9d", "#8884d8", "#ffc658", "#ca8282"];

const getGraphColor = (idx: number): string => {
  return graphColors[idx % graphColors.length];
};

const formatSeriesName = (s: string) => {
  const components = s.split("_");
  return capitalize(components[0]);
};

const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-bg-dark rounded-md p-2 bg-opacity-75">
        <h2 className="font-semibold">{formatTimestampFull(label)}</h2>
        {payload.map((series, idx) => {
          const color = series.color
            ? `text-[${series.color}]`
            : "text-text-light";

          const name = series.name?.toString() ?? "";

          return (
            <div className={color} key={idx}>
              <span className="font-light">{formatSeriesName(name)}:</span>{" "}
              <span className="font-medium">
                {name.includes("percent")
                  ? formatPercent(series.value as number)
                  : series.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

interface BusynessAreaChartProps {
  recordOptions:
    | {
        library: "hill";
        records: HillData[];
      }
    | {
        library: "hunt";
        records: HuntData[];
      };
  displayType: "count" | "percent";
}

export const BusynessAreaChart: React.FC<BusynessAreaChartProps> = ({
  recordOptions,
  displayType,
}) => {
  const records = recordOptions.records.map((record) => {
    const { record_datetime, ...rest } = record;
    return {
      ...rest,
      record_datetime: new Date(record_datetime),
    };
  });
  const library = recordOptions.library;

  const hillFields = ["east", "tower", "west"];
  const huntFields = ["level2", "level3", "level4", "level5"];

  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* margin is so that rotated ticks don't get cut off */}
      <ComposedChart data={records} margin={{ bottom: 40 }}>
        <Tooltip content={<CustomTooltip />} animationDuration={200} />
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="record_datetime"
          tick={{ fill: "#d4d4d4" }}
          tickFormatter={formatTimestampSimple}
          angle={-35}
          dx={-18}
          dy={20}
          minTickGap={30}
          // this ensures that spacing between data points is proportional
          // to the duration between those data points
          scale={scaleTime()}
        />
        <YAxis
          tick={{ fill: "#d4d4d4" }}
          domain={displayType === "percent" ? [0, 1] : undefined}
          tickFormatter={
            displayType === "percent"
              ? (tick) => {
                  return formatPercent(tick);
                }
              : undefined
          }
        />
        {displayType === "count" ? (
          library === "hill" ? (
            hillFields.map((area, idx) => {
              return (
                <Area
                  type="monotone"
                  dataKey={`${area}_count`}
                  key={idx}
                  // save idx = 0 graph color for total percent
                  fill={getGraphColor(idx + 1)}
                  stroke={getGraphColor(idx + 1)}
                  stackId="1"
                  animationDuration={500}
                />
              );
            })
          ) : (
            huntFields.map((area, idx) => {
              return (
                <Area
                  type="monotone"
                  dataKey={`${area}_count`}
                  key={idx}
                  fill={getGraphColor(idx + 1)}
                  stroke={getGraphColor(idx + 1)}
                  stackId="1"
                  animationDuration={500}
                />
              );
            })
          )
        ) : (
          <div></div>
        )}
        {displayType === "percent" ? (
          <Area
            type="monotone"
            dataKey={`total_percent`}
            fill={getGraphColor(0)}
            stroke={getGraphColor(0)}
            animationDuration={500}
          />
        ) : (
          <Line
            type="monotone"
            dataKey={`total_count`}
            stroke="#ffffff"
            strokeOpacity={0}
            dot={false}
            animationDuration={500}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
