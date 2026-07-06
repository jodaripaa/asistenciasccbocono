import { useState, useEffect, useCallback } from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Select } from "@components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  documentId: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface PaginatedResponse {
  ok: boolean;
  data: {
    items: Member[];
    meta: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (roleFilter) params.set("role", roleFilter);
    params.set("page", String(page));

    const res = await fetch(`/api/members?${params}`);
    const json: PaginatedResponse = await res.json();

    if (json.ok) {
      setMembers(json.data.items);
      setMeta(json.data.meta);
    }
    setLoading(false);
  }, [search, roleFilter]);

  useEffect(() => {
    fetchMembers(1);
  }, [fetchMembers]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Miembros ({meta.total})</CardTitle>
          <Button onClick={() => window.location.href = "/members/new"}>
            Nuevo Miembro
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Buscar por nombre o documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select
            options={[
              { value: "LEADER", label: "Líder" },
              { value: "STUDENT", label: "Estudiante" },
            ]}
            placeholder="Todos los roles"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Cargando...</p>
        ) : members.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No se encontraron miembros</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Nombre</th>
                  <th className="pb-3 font-medium">Documento</th>
                  <th className="pb-3 font-medium">Rol</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Registrado</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3">{m.firstName} {m.lastName}</td>
                    <td className="py-3 text-muted-foreground">{m.documentId ?? "—"}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.role === "LEADER" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>
                        {m.role === "LEADER" ? "Líder" : "Estudiante"}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {m.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString("es-CO")}
                    </td>
                    <td className="py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/members/${m.id}`}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => fetchMembers(meta.page - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {meta.page} de {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => fetchMembers(meta.page + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
