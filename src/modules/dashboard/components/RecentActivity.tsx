import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

dayjs.extend(relativeTime);
dayjs.locale("es");

interface ActivityItem {
  id: string;
  scannedAt: string;
  status: string;
  member: { firstName: string; lastName: string; role: string };
  event: { name: string };
}

export function RecentActivity({ data }: { data: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Sin actividad reciente
          </p>
        ) : (
          <div className="space-y-3">
            {data.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {a.member.firstName} {a.member.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{a.event.name}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.status === "LATE"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {a.status === "LATE" ? "Tardanza" : "A tiempo"}
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dayjs(a.scannedAt).fromNow()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
