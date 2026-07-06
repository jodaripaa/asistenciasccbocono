import { useState } from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Select } from "@components/ui/select";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

export function ReportGenerator() {
  const [type, setType] = useState("monthly");
  const [memberId, setMemberId] = useState("");
  const [eventId, setEventId] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [role, setRole] = useState("LEADER");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  function buildUrl(format: string) {
    const params = new URLSearchParams({ type, format });
    if (type === "person") params.set("memberId", memberId);
    if (type === "event") params.set("eventId", eventId);
    if (type === "monthly" || type === "annual") {
      params.set("year", year);
      if (type === "monthly") params.set("month", month);
    }
    if (type === "by-type") params.set("role", role);
    return `/api/reports?${params}`;
  }

  async function handlePreview() {
    setLoading(true);
    const res = await fetch(buildUrl("json"));
    const json = await res.json();
    if (json.ok) setResult(json.data);
    setLoading(false);
  }

  function handleDownloadExcel() {
    window.open(buildUrl("xlsx"), "_blank");
  }

  function handlePrint() {
    window.open(buildUrl("html"), "_blank");
  }

  const typeOptions = [
    { value: "person", label: "Por Persona" },
    { value: "event", label: "Por Evento" },
    { value: "monthly", label: "Mensual" },
    { value: "annual", label: "Anual" },
    { value: "by-type", label: "Por Tipo de Miembro" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generar Reporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de reporte</Label>
            <Select id="type" options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} />
          </div>

          {type === "person" && (
            <div className="space-y-2">
              <Label htmlFor="memberId">ID del miembro</Label>
              <Input id="memberId" placeholder="UUID del miembro" value={memberId} onChange={(e) => setMemberId(e.target.value)} />
              <p className="text-xs text-muted-foreground">Busca el miembro en la sección Miembros y copia su ID</p>
            </div>
          )}

          {type === "event" && (
            <div className="space-y-2">
              <Label htmlFor="eventId">ID del evento</Label>
              <Input id="eventId" placeholder="UUID del evento" value={eventId} onChange={(e) => setEventId(e.target.value)} />
            </div>
          )}

          {(type === "monthly" || type === "annual") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
              {type === "monthly" && (
                <div className="space-y-2">
                  <Label htmlFor="month">Mes (1-12)</Label>
                  <Input id="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                </div>
              )}
            </div>
          )}

          {type === "by-type" && (
            <div className="space-y-2">
              <Label htmlFor="role">Tipo</Label>
              <Select id="role" options={[{ value: "LEADER", label: "Líderes" }, { value: "STUDENT", label: "Estudiantes" }]} value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={handlePreview} disabled={loading}>
              {loading ? "Generando..." : "Vista Previa"}
            </Button>
            <Button variant="outline" onClick={handleDownloadExcel} disabled={!result}>
              Descargar Excel
            </Button>
            <Button variant="outline" onClick={handlePrint} disabled={!result}>
              Ver para Imprimir (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{result.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{result.subtitle}</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    {result.headers.map((h: string, i: number) => (
                      <th key={i} className="pb-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.slice(0, 50).map((row: string[], i: number) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                      {row.map((cell, j) => (
                        <td key={j} className="py-2">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.rows.length > 50 && (
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Mostrando 50 de {result.rows.length} registros
              </p>
            )}
            <p className="mt-4 text-sm font-medium">
              Total: {result.summary.total}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
