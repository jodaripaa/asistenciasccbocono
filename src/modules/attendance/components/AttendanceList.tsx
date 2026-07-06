import { useState, useEffect, useCallback } from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

interface AttendanceItem {
  id: string;
  scannedAt: string;
  status: string;
  member: { id: string; firstName: string; lastName: string; photoUrl: string | null; role: string };
  event: { id: string; name: string; date: string };
  registeredBy: { id: string; name: string };
}

interface AttendanceListProps {
  eventId: string;
}

export function AttendanceList({ eventId }: AttendanceListProps) {
  const [attendances, setAttendances] = useState<AttendanceItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAttendances = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ eventId, page: String(page) });
    const res = await fetch(`/api/attendance?${params}`);
    const json = await res.json();

    if (json.ok) {
      setAttendances(json.data.items);
      setMeta(json.data.meta);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => { fetchAttendances(1); }, [fetchAttendances]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asistentes ({meta.total})</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Cargando...</p>
        ) : attendances.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Sin asistencias registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Miembro</th>
                  <th className="pb-3 font-medium">Rol</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Hora</th>
                  <th className="pb-3 font-medium">Registró</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 font-medium">
                      {a.member.firstName} {a.member.lastName}
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.member.role === "LEADER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>
                        {a.member.role === "LEADER" ? "Líder" : "Estudiante"}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.status === "LATE" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                      }`}>
                        {a.status === "LATE" ? "Tardanza" : "A tiempo"}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(a.scannedAt).toLocaleTimeString("es-CO", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 text-muted-foreground">{a.registeredBy.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => fetchAttendances(meta.page - 1)}>
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">Página {meta.page} de {meta.totalPages}</span>
            <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => fetchAttendances(meta.page + 1)}>
              Siguiente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
