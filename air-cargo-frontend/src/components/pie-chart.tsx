import { Pie, PieChart, Cell, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { ChartSkeleton } from "./chart-skeleton";
import { objectMapper } from "@/utils";

type PiechartProps = {
  data: { [key: string]: number };
  label: string;
  value: string;
  className?: string;
  colors?: string[];
};

export function Piechart({
  data,
  label,
  value,
  className,
  colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-4)",
    "var(--chart-5)",
  ],
}: PiechartProps) {
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
          chrome: {
            label: "Chrome",
            color: "hsl(var(--chart-2))",
          },
        }}
        className="min-h-[300px] w-full"
      >
        <PieChart accessibilityLayer>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />

          <Pie
            data={transformedData}
            dataKey={value}
            nameKey={label}
            outerRadius={100}
          >
            {transformedData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`hsl(${colors[index % colors.length]})`}
              />
            ))}
          </Pie>
          <Legend style={{ borderRadius: 50 }} />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
