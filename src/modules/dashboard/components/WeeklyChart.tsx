import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

interface DayData {
  date: string;
  dayLabel: string;
  count: number;
}

interface WeeklyChartProps {
  currentWeek: DayData[];
  previousWeek: DayData[];
}

export function WeeklyChart({ currentWeek, previousWeek }: WeeklyChartProps) {
  const chartData = currentWeek.map((day, i) => ({
    day: day.dayLabel,
    "Esta semana": day.count,
    "Semana anterior": previousWeek[i]?.count ?? 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparativa Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="day" className="text-xs" />
            <YAxis className="text-xs" allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Esta semana" fill="hsl(221.2 83.2% 53.3%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Semana anterior" fill="hsl(210 40% 90%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
