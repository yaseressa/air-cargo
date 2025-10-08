import { cn } from "../lib/utils";
import { objectMapper, transformIfMonth } from "../utils";
import { ChartSkeleton } from "./chart-skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
type LinechartProps = {
  data: { [key: string]: number };
  label: string;
  value: string;
  className?: string;
};
export function Linechart({ data, label, value, className }: LinechartProps) {
  if (!data) return <ChartSkeleton />;
  const transformedData = objectMapper(data, label, value);
  return (
    <div>
      <ChartContainer
        config={{
          desktop: {
            label: value,
            color: "hsl(var(--chart-1))",
          },
        }}
        className={cn("min-h-[300px] w-full", className)}
      >
        <LineChart
          accessibilityLayer
          data={transformedData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={label}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => transformIfMonth(value)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey={value}
            type="natural"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            animationBegin={0}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
