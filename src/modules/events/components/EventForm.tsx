import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEventSchema, eventTypeLabels, type CreateEventInput } from "../schemas/events.schema";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select } from "@components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

interface EventFormProps {
  defaultValues?: Partial<CreateEventInput>;
  eventId?: string;
  onSuccess?: () => void;
}

export function EventForm({ defaultValues, eventId, onSuccess }: EventFormProps) {
  const isEditing = !!eventId;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: defaultValues ?? { type: "SERVICE", isActive: false },
  });

  async function onSubmit(data: CreateEventInput) {
    const url = isEditing ? `/api/events/${eventId}` : "/api/events";
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
          setError(field as keyof CreateEventInput, { message: (messages as string[])[0] });
        });
      } else {
        setError("root", { message: json.error?.message ?? "Error al guardar" });
      }
      return;
    }

    onSuccess?.();
    window.location.href = "/events";
  }

  const typeOptions = Object.entries(eventTypeLabels).map(([value, label]) => ({ value, label }));

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Evento" : "Nuevo Evento"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del evento *</Label>
            <Input id="name" placeholder="Ej: Culto Dominical 15 Jun" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de evento *</Label>
              <Select id="type" options={typeOptions} {...register("type")} />
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha y hora *</Label>
              <Input id="date" type="datetime-local" {...register("date")} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("description")}
            />
          </div>

          <div className="flex items-center gap-2">
            <input id="isActive" type="checkbox" className="h-4 w-4 rounded border-gray-300" {...register("isActive")} />
            <Label htmlFor="isActive" className="text-sm font-normal">
              Marcar como evento activo
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => window.location.href = "/events"}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEditing ? "Actualizar" : "Crear Evento"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
