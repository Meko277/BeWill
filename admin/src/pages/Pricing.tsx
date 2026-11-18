import { useState } from "react";
import { orderBy, doc, setDoc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { db, call } from "../lib/firebase";
import { useCollection, fmt } from "../lib/hooks";
import { PageHeader, Skeleton, Empty, ErrorBox, Badge, ConfirmDialog } from "../components/ui";

export default function Pricing() {
  const { rows, loading, error } = useCollection("priceRequests", orderBy("createdAt", "desc"));
  const [fixed, setFixed] = useState(""); const [saved, setSaved] = useState("");
  const [act, setAct] = useState<{ id: string; decision: "approved" | "rejected"; amount: number } | null>(null);
  const [ai, setAi] = useState<Record<string, string>>({}); const [aiErr, setAiErr] = useState("");
  useEffect(() => { getDoc(doc(db, "appConfig", "pricing")).then((s) => setFixed(String(s.data()?.fixedConsultationPrice ?? ""))); }, []);
  const saveFixed = async () => { await setDoc(doc(db, "appConfig", "pricing"), { fixedConsultationPrice: Number(fixed) }, { merge: true }); setSaved("Saved"); };
  const suggest = async (id: string) => { setAiErr(""); try { const r = await call<{ suggestion: string }>("suggestConsultationPrice", { requestId: id }); setAi({ ...ai, [id]: r.suggestion }); } catch (e) { setAiErr((e as Error).message); } };
  return <div><PageHeader title="Consultation pricing" subtitle="Platform price and doctor-proposed prices. AI only suggests; you decide." />
    <div className="card mb-6 flex flex-wrap items-end gap-3"><div><label className="text-sm text-slate-500">Platform fixed consultation price</label><input className="input mt-1" type="number" min="0" value={fixed} onChange={(e) => setFixed(e.target.value)} /></div>
      <button className="btn-primary" onClick={saveFixed} disabled={!(Number(fixed) > 0)}>Save</button>{saved && <span className="text-sm text-emerald-600">{saved}</span>}</div>
    {error && <ErrorBox text={error} />}{aiErr && <ErrorBox text={aiErr} />}
    {loading ? <Skeleton /> : rows.length === 0 ? <Empty text="No price requests." /> : <div className="space-y-3">{rows.map((r) => <div key={r.id} className="card">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><b>{r.doctorName ?? r.doctorId}</b> <span className="text-sm text-slate-500">· {r.mode} · {fmt(r.createdAt)}</span></div><Badge status={r.status} /></div>
      <div className="mt-1 text-sm">Amount: <b>{r.amount}</b>{r.finalAmount != null && <> → final <b>{r.finalAmount}</b></>}</div>{r.justification && <p className="text-sm text-slate-500">{r.justification}</p>}
      {ai[r.id] && <p className="mt-2 rounded-xl bg-brand-50 p-2 text-sm text-brand-700">{ai[r.id]}</p>}
      {r.status === "pending" && <div className="mt-3 flex gap-2"><button className="btn-ghost" onClick={() => suggest(r.id)}>AI suggestion</button>
        <button className="btn-primary" onClick={() => setAct({ id: r.id, decision: "approved", amount: r.amount })}>Approve</button><button className="btn-danger" onClick={() => setAct({ id: r.id, decision: "rejected", amount: r.amount })}>Reject</button></div>}</div>)}</div>}
    {act && <ConfirmDialog title={`${act.decision === "approved" ? "Approve" : "Reject"} price`} needReason={act.decision === "rejected"} danger={act.decision === "rejected"} onCancel={() => setAct(null)}
      onConfirm={async (note) => { await call("decidePriceRequest", { requestId: act.id, decision: act.decision, note, amount: act.amount }); setAct(null); }} />}</div>;
}
