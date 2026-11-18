import { useState } from "react";
import { orderBy, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useCollection } from "../lib/hooks";
import { PageHeader, Skeleton, Empty, ErrorBox } from "../components/ui";

export default function Specializations() {
  const { rows, loading, error } = useCollection("specializations", orderBy("order"));
  const [f, setF] = useState({ id: "", nameEn: "", nameAr: "", icon: "medical_services" }); const [err, setErr] = useState("");
  const add = async () => { try { await setDoc(doc(db, "specializations", f.id), { nameEn: f.nameEn, nameAr: f.nameAr, icon: f.icon, enabled: true, order: rows.length }); setF({ id: "", nameEn: "", nameAr: "", icon: "medical_services" }); setErr(""); } catch (e) { setErr((e as Error).message); } };
  return <div><PageHeader title="Specializations" subtitle="Categories shown in the mobile app" />
    <div className="card mb-6 grid gap-2 sm:grid-cols-5"><input className="input" placeholder="id (cardiology)" value={f.id} onChange={(e) => setF({ ...f, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })} />
      <input className="input" placeholder="Name (EN)" value={f.nameEn} onChange={(e) => setF({ ...f, nameEn: e.target.value })} /><input className="input" dir="rtl" placeholder="الاسم" value={f.nameAr} onChange={(e) => setF({ ...f, nameAr: e.target.value })} />
      <input className="input" placeholder="Material icon name" value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value })} /><button className="btn-primary" disabled={!f.id || !f.nameEn || !f.nameAr} onClick={add}>Add</button></div>
    {(error || err) && <ErrorBox text={error ?? err} />}{loading ? <Skeleton /> : rows.length === 0 ? <Empty text="No specializations. Run scripts/seed.mjs or add one above." /> :
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rows.map((s) => <div key={s.id} className="card flex items-center justify-between"><div><div className="font-medium">{s.nameEn}</div><div className="text-sm text-slate-500" dir="rtl">{s.nameAr}</div></div>
        <button className="btn-ghost" onClick={() => setDoc(doc(db, "specializations", s.id), { enabled: !s.enabled }, { merge: true })}>{s.enabled ? "Disable" : "Enable"}</button></div>)}</div>}</div>;
}
