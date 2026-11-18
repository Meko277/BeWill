import { useState } from "react";
import { orderBy, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useCollection, Row } from "../lib/hooks";
import { PageHeader, Skeleton, Empty, ErrorBox, ConfirmDialog } from "../components/ui";

const blank = { id: "", nameEn: "", nameAr: "", price: 0, currency: "EGP", durationDays: 30, enabled: true, order: 9, benefits: { consultationRequestsPerMonth: 5, aiMessagesPerDay: 50, premiumAi: false } };
export default function Plans() {
  const { rows, loading, error } = useCollection("subscriptionPlans", orderBy("order"));
  const [edit, setEdit] = useState<Row | typeof blank | null>(null); const [confirm, setConfirm] = useState(false);
  const e = edit as typeof blank | null;
  const set = (k: string, v: unknown) => setEdit({ ...(edit as object), [k]: v } as typeof blank);
  const setB = (k: string, v: unknown) => setEdit({ ...(edit as typeof blank), benefits: { ...(edit as typeof blank).benefits, [k]: v } });
  const save = async () => { const { id, ...rest } = e!; await setDoc(doc(db, "subscriptionPlans", id), rest, { merge: true }); setConfirm(false); setEdit(null); };
  const toggle = async (p: Row) => setDoc(doc(db, "subscriptionPlans", p.id), { enabled: !p.enabled }, { merge: true });
  return <div><PageHeader title="Subscription plans" subtitle="Prices and benefits are enforced by the backend. Use -1 for unlimited."
    action={<button className="btn-primary" onClick={() => setEdit({ ...blank })}>New plan</button>} />
    {error && <ErrorBox text={error} />}{loading ? <Skeleton rows={3} /> : rows.length === 0 ? <Empty text="No plans yet. Run scripts/seed.mjs or create one." /> :
      <div className="grid gap-4 md:grid-cols-2">{rows.map((p) => <div key={p.id} className="card"><div className="flex justify-between"><h3 className="font-semibold">{p.nameEn} <span className="text-slate-500">/ {p.nameAr}</span></h3>
        <span className={`badge ${p.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{p.enabled ? "enabled" : "disabled"}</span></div>
        <div className="mt-1 text-2xl font-semibold">{p.price} <span className="text-sm text-slate-500">{p.currency} / {p.durationDays || "∞"} days</span></div>
        <ul className="mt-2 text-sm text-slate-500"><li>Consultation requests / month: {p.benefits?.consultationRequestsPerMonth}</li><li>AI messages / day: {p.benefits?.aiMessagesPerDay}</li><li>Premium AI: {p.benefits?.premiumAi ? "yes" : "no"}</li></ul>
        <div className="mt-3 flex gap-2"><button className="btn-ghost" onClick={() => setEdit(p)}>Edit</button><button className="btn-ghost" onClick={() => toggle(p)}>{p.enabled ? "Disable" : "Enable"}</button></div></div>)}</div>}
    {e && <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4"><div className="card fade-in max-h-[90vh] w-full max-w-lg space-y-3 overflow-auto">
      <h3 className="text-lg font-semibold">{e.id ? "Edit plan" : "New plan"}</h3>
      <input className="input" placeholder="Plan id (e.g. premium)" value={e.id} disabled={rows.some((r) => r.id === e.id)} onChange={(x) => set("id", x.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))} />
      <div className="grid grid-cols-2 gap-2"><input className="input" placeholder="Name (EN)" value={e.nameEn} onChange={(x) => set("nameEn", x.target.value)} /><input className="input" dir="rtl" placeholder="الاسم" value={e.nameAr} onChange={(x) => set("nameAr", x.target.value)} />
        <input className="input" type="number" min="0" placeholder="Price" value={e.price} onChange={(x) => set("price", Number(x.target.value))} /><input className="input" placeholder="Currency" value={e.currency} onChange={(x) => set("currency", x.target.value)} />
        <input className="input" type="number" min="0" placeholder="Duration days" value={e.durationDays} onChange={(x) => set("durationDays", Number(x.target.value))} />
        <input className="input" type="number" placeholder="Sort order" value={e.order} onChange={(x) => set("order", Number(x.target.value))} /></div>
      <div className="grid grid-cols-2 gap-2"><label className="text-xs text-slate-500">Consultation requests / month<input className="input mt-1" type="number" value={e.benefits.consultationRequestsPerMonth} onChange={(x) => setB("consultationRequestsPerMonth", Number(x.target.value))} /></label>
        <label className="text-xs text-slate-500">AI messages / day<input className="input mt-1" type="number" value={e.benefits.aiMessagesPerDay} onChange={(x) => setB("aiMessagesPerDay", Number(x.target.value))} /></label></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={e.benefits.premiumAi} onChange={(x) => setB("premiumAi", x.target.checked)} />Premium AI features</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={e.enabled} onChange={(x) => set("enabled", x.target.checked)} />Enabled</label>
      <div className="flex justify-end gap-2"><button className="btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary" disabled={!e.id || !e.nameEn} onClick={() => setConfirm(true)}>Save</button></div></div></div>}
    {confirm && <ConfirmDialog title="Save plan changes?" body="Price and benefit changes affect users immediately." onCancel={() => setConfirm(false)} onConfirm={save} />}</div>;
}
