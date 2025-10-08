import { CartesianGrid, XAxis, Bar, BarChart } from "recharts";
import { ChartTooltipContent, ChartTooltip, ChartContainer } from "./ui/chart";
import { objectMapper, transformIfMonth } from "../utils";
import { ChartSkeleton } from "./chart-skeleton";
type BarchartProps = {
  data: { [key: string]: number };
  label: string;
  value: string;
  className?: string;
};
export function Barchart({ data, label, value, className }: BarchartProps) {
  if (!data) return <ChartSkeleton />;
  const transformedData = objectMapper(data, label, value);
  return (
    <div className={className}>
      <ChartContainer
        config={{
          desktop: {
            label: value,
            color: "hsl(var(--chart-1))",
          },
        }}
        className="min-h-[300px] w-full"
      >
        <BarChart accessibilityLayer data={transformedData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={label}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => transformIfMonth(value)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey={value} fill="hsl(var(--primary))" radius={15} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
