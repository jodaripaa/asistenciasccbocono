import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

interface ScanResult {
  ok: boolean;
  memberName?: string;
  eventName?: string;
  status?: string;
  scannedAt?: string;
  error?: string;
}

interface ScannerProps {
  eventId: string;
  onScan?: (result: ScanResult) => void;
}

export function Scanner({ eventId, onScan }: ScannerProps) {
  const readerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (cancelled || !readerRef.current) return;

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          () => {}
        );
        if (!cancelled) setScanning(true);
      } catch (err) {
        if (!cancelled) {
          setCameraError("No se pudo acceder a la cámara. Verifica los permisos.");
        }
      }
    }

    async function onScanSuccess(decodedText: string) {
      if (cancelled) return;

      scannerRef.current?.pause();

      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken: decodedText, eventId }),
      });

      const json = await res.json();

      const result: ScanResult = json.ok
        ? {
            ok: true,
            memberName: `${json.data.member.firstName} ${json.data.member.lastName}`,
            eventName: json.data.event.name,
            status: json.data.status,
            scannedAt: json.data.scannedAt,
          }
        : {
            ok: false,
            error: json.error?.message ?? "Error al registrar asistencia",
          };

      setLastResult(result);
      onScan?.(result);

      setTimeout(() => {
        setLastResult(null);
        if (!cancelled) scannerRef.current?.resume();
      }, 3000);
    }

    startScanner();

    return () => {
      cancelled = true;
      scannerRef.current?.stop().catch(() => {});
    };
  }, [eventId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escáner QR</CardTitle>
      </CardHeader>
      <CardContent>
        {cameraError ? (
          <div className="rounded-md bg-destructive/10 p-4 text-center text-destructive">
            <p>{cameraError}</p>
            <p className="mt-2 text-sm">Asegúrate de permitir el acceso a la cámara.</p>
          </div>
        ) : (
          <>
            <div
              id="qr-reader"
              ref={readerRef}
              className="mx-auto max-w-sm overflow-hidden rounded-lg"
            />

            {!scanning && !cameraError && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Iniciando cámara...
              </p>
            )}

            {lastResult && (
              <div
                className={`mt-4 rounded-md p-4 text-center text-sm font-medium ${
                  lastResult.ok
                    ? "bg-green-100 text-green-800"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {lastResult.ok ? (
                  <>
                    <p className="text-lg font-bold">✓ {lastResult.memberName}</p>
                    <p className="mt-1">{lastResult.eventName}</p>
                    <p className="mt-1 text-xs opacity-75">
                      {lastResult.status === "LATE" ? "Tardanza" : "A tiempo"} —{" "}
                      {new Date(lastResult.scannedAt!).toLocaleTimeString("es-CO")}
                    </p>
                  </>
                ) : (
                  <>
                    <p>✗ {lastResult.error}</p>
                  </>
                )}
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Coloca el código QR frente a la cámara para registrar la asistencia
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
