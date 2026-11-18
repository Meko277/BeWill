import { useState } from "react";
import { orderBy, limit } from "firebase/firestore";
import { call } from "../lib/firebase";
import { useCollection, fmt } from "../lib/hooks";
import { PageHeader, Skeleton, Empty, ErrorBox, Badge, ConfirmDialog } from "../components/ui";

interface Msg { id: string; senderId: string; text: string; createdAt: number | null }
export default function Consultations() {
  const { rows, loading, error } = useCollection("consultations", orderBy("createdAt", "desc"), limit(200));
  const [status, setStatus] = useState("all"); const [ask, setAsk] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<{ id: string; list: Msg[] } | null>(null);
  const shown = rows.filter((r) => status === "all" || r.status === status);
  return <div><PageHeader title="Consultations" subtitle="Status oversight. Message content is private; opening it requires a reason and is audited." />
    <select className="input mb-4 w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>{["all", "pending", "accepted", "rejected", "completed"].map((s) => <option key={s}>{s}</option>)}</select>
    {error && <ErrorBox text={error} />}{loading ? <Skeleton /> : shown.length === 0 ? <Empty text="No consultations." /> :
      <div className="card overflow-x-auto p-0"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="p-3">Patient</th><th>Doctor</th><th>Status</th><th>Price</th><th>Created</th><th></th></tr></thead>
        <tbody>{shown.map((c) => <tr key={c.id} className="border-t border-slate-100 dark:border-slate-700"><td className="p-3">{c.patientName}</td><td>{c.doctorName}</td><td><Badge status={c.status} /></td><td>{c.price ?? "—"}</td><td>{fmt(c.createdAt)}</td>
          <td className="p-2 text-right">{(c.status === "accepted" || c.status === "completed") && <button className="btn-ghost" onClick={() => setAsk(c.id)}>Open messages</button>}</td></tr>)}</tbody></table></div>}
    {ask && <ConfirmDialog title="Access private conversation" body="Provide a justification (e.g. an abuse report). This access is permanently logged." needReason confirmLabel="Open"
      onCancel={() => setAsk(null)} onConfirm={async (reason) => { const r = await call<{ messages: Msg[] }>("adminReadConsultationMessages", { consultationId: ask, reason }); setMsgs({ id: ask, list: r.messages }); setAsk(null); }} />}
    {msgs && <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4"><div className="card fade-in max-h-[85vh] w-full max-w-lg overflow-auto"><div className="mb-3 flex justify-between"><b>Conversation</b><button className="btn-ghost" onClick={() => setMsgs(null)}>Close</button></div>
      {msgs.list.length === 0 && <p className="text-sm text-slate-500">No messages.</p>}{msgs.list.map((m) => <div key={m.id} className="mb-2 rounded-xl bg-slate-50 p-2 text-sm dark:bg-slate-700"><div className="text-xs text-slate-500">{m.senderId.slice(0, 6)} · {fmt(m.createdAt)}</div>{m.text}</div>)}</div></div>}</div>;
}
