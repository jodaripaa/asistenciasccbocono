import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

interface StatsData {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  todayAttendances: number;
  attendancePercentage: number;
}

export function StatsCards({ data }: { data: StatsData }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Miembros Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{data.activeMembers}</p>
          <p className="text-xs text-muted-foreground">
            de {data.totalMembers} registrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Asistencias Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{data.todayAttendances}</p>
          <p className="text-xs text-muted-foreground">
            en todos los eventos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Asistencia %
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{data.attendancePercentage}%</p>
          <p className="text-xs text-muted-foreground">
            del evento activo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Eventos Totales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{data.totalEvents}</p>
          <p className="text-xs text-muted-foreground">
            registrados en el sistema
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
