import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMemberSchema, type CreateMemberInput } from "../schemas/members.schema";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select } from "@components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

interface MemberFormProps {
  defaultValues?: Partial<CreateMemberInput>;
  memberId?: string;
  onSuccess?: () => void;
}

export function MemberForm({ defaultValues, memberId, onSuccess }: MemberFormProps) {
  const isEditing = !!memberId;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateMemberInput>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: defaultValues ?? { role: "STUDENT" },
  });

  async function onSubmit(data: CreateMemberInput) {
    const url = isEditing ? `/api/members/${memberId}` : "/api/members";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!json.ok) {
      if (json.error?.details) {
        Object.entries(json.error.details).forEach(([field, messages]) => {
          setError(field as keyof CreateMemberInput, { message: (messages as string[])[0] });
        });
      } else {
        setError("root", { message: json.error?.message ?? "Error al guardar" });
      }
      return;
    }

    onSuccess?.();
    window.location.href = "/members";
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Miembro" : "Nuevo Miembro"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.root.message}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentId">Documento de identidad</Label>
              <Input id="documentId" {...register("documentId")} />
              {errors.documentId && <p className="text-xs text-destructive">{errors.documentId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select
                id="role"
                options={[
                  { value: "LEADER", label: "Líder" },
                  { value: "STUDENT", label: "Estudiante" },
                ]}
                {...register("role")}
              />
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => window.location.href = "/members"}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear Miembro"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
