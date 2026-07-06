import { useState, useEffect, useCallback } from "react";
import { Button } from "@components/ui/button";
import { Select } from "@components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { eventTypeLabels } from "../schemas/events.schema";

interface EventItem {
  id: string;
  name: string;
  description: string | null;
  date: string;
  type: string;
  isActive: boolean;
  _count: { attendances: number };
}

export function EventList() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    params.set("page", String(page));

    const res = await fetch(`/api/events?${params}`);
    const json = await res.json();

    if (json.ok) {
      setEvents(json.data.items);
      setMeta(json.data.meta);
    }
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { fetchEvents(1); }, [fetchEvents]);

  async function handleSetActive(id: string) {
    const res = await fetch(`/api/events/${id}/activate`, { method: "POST" });
    if (res.ok) fetchEvents(meta.page);
  }

  const typeOptions = Object.entries(eventTypeLabels).map(([value, label]) => ({ value, label }));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Eventos ({meta.total})</CardTitle>
          <Button onClick={() => window.location.href = "/events/new"}>Nuevo Evento</Button>
        </div>
        <div>
          <Select
            options={typeOptions}
            placeholder="Todos los tipos"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Cargando...</p>
        ) : events.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No se encontraron eventos</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Nombre</th>
                  <th className="pb-3 font-medium">Tipo</th>
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Asistencia</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 font-medium">{e.name}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        {eventTypeLabels[e.type] ?? e.type}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(e.date).toLocaleDateString("es-CO", {
                        day: "numeric", month: "long", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3">{e._count.attendances}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        e.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {e.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => window.location.href = `/events/${e.id}`}>
                          Editar
                        </Button>
                        {!e.isActive && (
                          <Button variant="outline" size="sm" onClick={() => handleSetActive(e.id)}>
                            Activar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => fetchEvents(meta.page - 1)}>
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">Página {meta.page} de {meta.totalPages}</span>
            <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => fetchEvents(meta.page + 1)}>
              Siguiente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
