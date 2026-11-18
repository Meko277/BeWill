import { useState } from "react";
import { query, where, limit, collection, getDocs } from "firebase/firestore";
import { useEffect } from "react";
import { db, call } from "../lib/firebase";
import { Row, fmt } from "../lib/hooks";
import { PageHeader, Skeleton, Empty, ErrorBox, Badge, ConfirmDialog } from "../components/ui";

export default function Patients() {
  const [rows, setRows] = useState<Row[]>([]); const [loading, setLoading] = useState(true); const [err, setErr] = useState("");
  const [q, setQ] = useState(""); const [idf, setIdf] = useState("all"); const [tick, setTick] = useState(0);
  const [act, setAct] = useState<{ kind: string; p: Row } | null>(null);
  useEffect(() => { getDocs(query(collection(db, "users"), where("role", "==", "patient"), limit(500)))
    .then((s) => setRows(s.docs.map((d) => ({ id: d.id, ...d.data() })))).catch((e) => setErr(e.message)).finally(() => setLoading(false)); }, [tick]);
  const shown = rows.filter((r) => (idf === "all" || r.idVerificationStatus === idf) && `${r.fullName} ${r.email} ${r.phone}`.toLowerCase().includes(q.toLowerCase()));
  const run = async (reason: string) => { if (!act) return; const { kind, p } = act;
    if (kind === "suspend" || kind === "reactivate") await call("setAccountStatus", { uid: p.id, status: kind === "suspend" ? "suspended" : "active", reason: reason || "reactivated" });
    else await call("reviewPatientIdentity", { uid: p.id, decision: kind === "verify" ? "verified" : "rejected", reason });
    setAct(null); setTick(tick + 1); };
  return <div><PageHeader title="Patients" subtitle="Accounts and identity verification" />
    <div className="mb-4 flex flex-wrap gap-2"><input className="input max-w-xs" placeholder="Search name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} />
      <select className="input w-auto" value={idf} onChange={(e) => setIdf(e.target.value)}>{["all", "unverified", "pending", "verified", "rejected"].map((s) => <option key={s}>{s}</option>)}</select></div>
    {err && <ErrorBox text={err} />}{loading ? <Skeleton /> : shown.length === 0 ? <Empty text="No patients match." /> :
      <div className="card overflow-x-auto p-0"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="p-3">Name</th><th>Email</th><th>Phone</th><th>Identity</th><th>Account</th><th>Joined</th><th></th></tr></thead>
        <tbody>{shown.map((p) => <tr key={p.id} className="border-t border-slate-100 dark:border-slate-700"><td className="p-3 font-medium">{p.fullName}</td><td>{p.email}</td><td>{p.phone}</td>
          <td><Badge status={p.idVerificationStatus} /></td><td><Badge status={p.accountStatus} /></td><td>{fmt(p.createdAt)}</td>
          <td className="space-x-1 p-2 text-right whitespace-nowrap">{p.idVerificationStatus === "pending" && <><button className="btn-primary" onClick={() => setAct({ kind: "verify", p })}>Verify ID</button><button className="btn-danger" onClick={() => setAct({ kind: "rejectid", p })}>Reject ID</button></>}
            {p.accountStatus === "suspended" ? <button className="btn-ghost" onClick={() => setAct({ kind: "reactivate", p })}>Reactivate</button> : <button className="btn-danger" onClick={() => setAct({ kind: "suspend", p })}>Suspend</button>}</td></tr>)}</tbody></table></div>}
    {act && <ConfirmDialog title={`${act.kind} — ${act.p.fullName}`} needReason={act.kind === "suspend" || act.kind === "rejectid"} danger={act.kind !== "verify" && act.kind !== "reactivate"} onCancel={() => setAct(null)} onConfirm={run} />}</div>;
}
