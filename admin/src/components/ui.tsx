import { ReactNode, useState } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-3 fade-in"><div><h1 className="text-2xl font-semibold">{title}</h1>
    {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}</div>{action}</div>;
}
export function Skeleton({ rows = 5 }: { rows?: number }) {
  return <div className="space-y-2">{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />)}</div>;
}
export function Empty({ text }: { text: string }) { return <div className="card text-center text-sm text-slate-500">{text}</div>; }
export function ErrorBox({ text }: { text: string }) { return <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{text}</div>; }
export const Badge = ({ status }: { status: string }) => {
  const c: Record<string, string> = { approved: "bg-emerald-100 text-emerald-700", verified: "bg-emerald-100 text-emerald-700", active: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700", rejected: "bg-red-100 text-red-700", suspended: "bg-red-100 text-red-700", unverified: "bg-slate-100 text-slate-600" };
  return <span className={`badge ${c[status] ?? "bg-slate-100 text-slate-600"}`}>{status}</span>;
};

/** Confirmation dialog for sensitive actions; optionally collects a required reason (audited server-side). */
export function ConfirmDialog({ title, body, needReason, confirmLabel = "Confirm", danger, onConfirm, onCancel }:
  { title: string; body?: string; needReason?: boolean; confirmLabel?: string; danger?: boolean; onConfirm: (reason: string) => Promise<void>; onCancel: () => void }) {
  const [reason, setReason] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const go = async () => { setBusy(true); setErr(""); try { await onConfirm(reason); } catch (e) { setErr((e as Error).message); setBusy(false); } };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"><div className="card fade-in w-full max-w-md">
    <h3 className="text-lg font-semibold">{title}</h3>{body && <p className="mt-1 text-sm text-slate-500">{body}</p>}
    {needReason && <textarea className="input mt-3" rows={3} placeholder="Reason (required, saved in the audit log)" value={reason} onChange={(e) => setReason(e.target.value)} />}
    {err && <div className="mt-2"><ErrorBox text={err} /></div>}
    <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
      <button className={danger ? "btn-danger" : "btn-primary"} disabled={busy || (needReason && reason.trim().length < 5)} onClick={go}>{busy ? "Working…" : confirmLabel}</button></div></div></div>;
}
