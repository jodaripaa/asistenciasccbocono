import { useEffect, useState } from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";

interface CredentialData {
  id: string;
  qrToken: string;
  fullName: string;
  documentId: string | null;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  role: string;
  roleLabel: string;
  churchName: string;
}

interface QrCredentialProps {
  memberId: string;
}

export function QrCredential({ memberId }: QrCredentialProps) {
  const [credential, setCredential] = useState<CredentialData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sendStatus, setSendStatus] = useState<string>("");

  useEffect(() => {
    async function load() {
      const [credRes, qrRes] = await Promise.all([
        fetch(`/api/qr/${memberId}/credential`),
        fetch(`/api/qr/${memberId}`),
      ]);

      if (credRes.ok) {
        const json = await credRes.json();
        setCredential(json.data);
      }

      if (qrRes.ok) {
        const blob = await qrRes.blob();
        setQrDataUrl(URL.createObjectURL(blob));
      }

      setLoading(false);
    }

    load();
    return () => { if (qrDataUrl) URL.revokeObjectURL(qrDataUrl); };
  }, [memberId]);

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Cargando credencial...</p>;
  }

  if (!credential) {
    return <p className="text-center text-destructive py-8">No se pudo cargar la credencial</p>;
  }

  const cred = credential as CredentialData;

  async function handleSend(method: "email" | "whatsapp") {
    setSendStatus("Enviando...");
    const res = await fetch("/api/notifications/send-credential", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, method }),
    });
    const json = await res.json();
    setSendStatus(json.ok ? "¡Enviado!" : json.error?.message ?? "Error al enviar");
    setTimeout(() => setSendStatus(""), 4000);
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Credencial - ${cred.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .credential { width: 320px; border: 2px solid #1a1a2e; border-radius: 12px; padding: 20px; text-align: center; }
            .church { font-size: 14px; color: #1a1a2e; font-weight: bold; margin-bottom: 8px; }
            .role { font-size: 12px; color: #666; margin-bottom: 12px; }
            .name { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
            .qr { margin: 12px 0; }
            .qr img { width: 180px; height: 180px; }
            .footer { font-size: 10px; color: #999; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="credential">
            <div class="church">${cred.churchName}</div>
            <div class="role">${cred.roleLabel}</div>
            <div class="name">${cred.fullName}</div>
            ${cred.documentId ? `<div style="font-size:12px;color:#666;">Doc: ${cred.documentId}</div>` : ""}
            <div class="qr"><img src="${qrDataUrl}" alt="QR" /></div>
            <div class="footer">Escanea para registrar asistencia</div>
          </div>
          <script>window.print();window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className="space-y-6">
      <Card className="mx-auto max-w-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              {cred.churchName}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{cred.roleLabel}</p>

            <div className="mx-auto mt-3 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
              {cred.photoUrl ? (
                <img src={cred.photoUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                cred.fullName.charAt(0)
              )}
            </div>

            <h2 className="mt-3 text-lg font-bold">{cred.fullName}</h2>
            {cred.documentId && (
              <p className="text-sm text-muted-foreground">Doc: {cred.documentId}</p>
            )}

            <div className="mx-auto mt-4 w-44">
              {qrDataUrl && <img src={qrDataUrl} alt="Código QR" className="h-full w-full" />}
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Escanea para registrar asistencia
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={handlePrint}>
          Imprimir / Descargar
        </Button>
        <Button onClick={() => handleSend("email")} disabled={!cred.email}>
          Enviar por Correo
        </Button>
        <Button onClick={() => handleSend("whatsapp")} disabled={!cred.phone}>
          Enviar por WhatsApp
        </Button>
      </div>

      {sendStatus && (
        <p className="text-center text-sm text-muted-foreground">{sendStatus}</p>
      )}

      {!cred.email && !cred.phone && (
        <p className="text-center text-xs text-muted-foreground">
          Agrega correo o teléfono al miembro para poder enviar la credencial
        </p>
      )}
    </div>
  );
}
