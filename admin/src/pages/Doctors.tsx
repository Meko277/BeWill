import { useState } from "react";
import { orderBy } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { db, call } from "../lib/firebase";
import { useCollection, Row, fmt } from "../lib/hooks";
import { PageHeader, Skeleton, Empty, ErrorBox, Badge, ConfirmDialog } from "../components/ui";

type Action = { kind: "approve" | "reject" | "suspend" | "reactivate"; doctor: Row } | null;

function Application({ doctor, onClose }: { doctor: Row; onClose: () => void }) {
  const [app, setApp] = useState<Row | null>(null); const [msg, setMsg] = useState("");
  const [ask, setAsk] = useState<string | null>(null);
  useEffect(() => { getDoc(doc(db, "doctorApplications", doctor.id)).then((s) => setApp(s.exists() ? { id: s.id, ...s.data() } : null)); }, [doctor.id]);
  const files: { fileName: string; label: string }[] = [...(app?.idFileName ? [{ fileName: app.idFileName, label: "National ID" }] : []), ...((app?.certificates as { fileName: string; label: string }[]) ?? [])];
  const open = async (fileName: string, reason: string) => { const r = await call<{ url: string }>("getVerificationDocumentUrl", { uid: doctor.id, fileName, reason }); window.open(r.url, "_blank", "noopener"); setAsk(null); };
  return <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4"><div className="card fade-in max-h-[90vh] w-full max-w-2xl overflow-auto">
    <div className="flex justify-between"><h2 className="text-lg font-semibold">{doctor.fullName}</h2><button className="btn-ghost" onClick={onClose}>Close</button></div>
    {!app ? <p className="mt-3 text-sm text-slate-500">No application data.</p> : <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
      {[["University", app.university], ["Degree", app.degree], ["Specialization", doctor.specializationId], ["Professional info", app.professionalInfo], ["Submitted", fmt(app.submittedAt)], ["Status", app.status]]
        .map(([k, v]) => <div key={String(k)}><dt className="text-slate-500">{k}</dt><dd>{String(v ?? "—")}</dd></div>)}</dl>}
    <h3 className="mb-2 mt-5 font-medium">Documents (private; each view is audited)</h3>
    {files.length === 0 && <p className="text-sm text-slate-500">No documents uploaded.</p>}
    <div className="space-y-2">{files.map((f) => <div key={f.fileName} className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-sm dark:bg-slate-700"><span>{f.label} · {f.fileName}</span>
      <button className="btn-ghost" onClick={() => setAsk(f.fileName)}>View</button></div>)}</div>
    {msg && <ErrorBox text={msg} />}
    {ask && <ConfirmDialog title="View private document" body="Access is recorded in the audit log." needReason confirmLabel="Open" onCancel={() => setAsk(null)} onConfirm={(r) => open(ask, r).catch((e) => { setMsg(e.message); setAsk(null); })} />}
  </div></div>;
}

export default function Doctors() {
  const { rows, loading, error } = useCollection("doctors", orderBy("fullName"));
  const [filter, setFilter] = useState("all"); const [q, setQ] = useState("");
  const [action, setAction] = useState<Action>(null); const [review, setReview] = useState<Row | null>(null);
  const shown = rows.filter((r) => (filter === "all" || r.verificationStatus === filter) && (r.fullName ?? "").toLowerCase().includes(q.toLowerCase()));
  const run = async (reason: string) => { if (!action) return; const id = action.doctor.id;
    if (action.kind === "approve") await call("reviewDoctorApplication", { doctorId: id, decision: "approved" });
    else if (action.kind === "reject") await call("reviewDoctorApplication", { doctorId: id, decision: "rejected", reason });
    else await call("setAccountStatus", { uid: id, status: action.kind === "suspend" ? "suspended" : "active", reason: reason || "reactivated by admin" });
    setAction(null); };
  return <div><PageHeader title="Doctors" subtitle="Review applications and manage accounts" />
    <div className="mb-4 flex flex-wrap gap-2"><input className="input max-w-xs" placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} />
      <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>{["all", "pending", "approved", "rejected"].map((s) => <option key={s}>{s}</option>)}</select></div>
    {error && <ErrorBox text={error} />}{loading ? <Skeleton /> : shown.length === 0 ? <Empty text="No doctors match." /> :
      <div className="card overflow-x-auto p-0"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="p-3">Name</th><th>Specialization</th><th>Verification</th><th>Account</th><th>Price</th><th></th></tr></thead>
        <tbody>{shown.map((d) => <tr key={d.id} className="border-t border-slate-100 dark:border-slate-700"><td className="p-3 font-medium">{d.fullName}</td><td>{d.specializationId}</td>
          <td><Badge status={d.verificationStatus} /></td><td><Badge status={d.accountStatus ?? "active"} /></td><td>{d.activePrice ?? "—"}</td>
          <td className="space-x-1 p-2 text-right whitespace-nowrap"><button className="btn-ghost" onClick={() => setReview(d)}>Review</button>
            {d.verificationStatus === "pending" && <><button className="btn-primary" onClick={() => setAction({ kind: "approve", doctor: d })}>Approve</button><button className="btn-danger" onClick={() => setAction({ kind: "reject", doctor: d })}>Reject</button></>}
            {d.verificationStatus === "approved" && (d.accountStatus === "suspended" ? <button className="btn-ghost" onClick={() => setAction({ kind: "reactivate", doctor: d })}>Reactivate</button> : <button className="btn-danger" onClick={() => setAction({ kind: "suspend", doctor: d })}>Suspend</button>)}</td></tr>)}</tbody></table></div>}
    {review && <Application doctor={review} onClose={() => setReview(null)} />}
    {action && <ConfirmDialog title={`${action.kind[0].toUpperCase()}${action.kind.slice(1)} ${action.doctor.fullName}?`} needReason={action.kind === "reject" || action.kind === "suspend"}
      danger={action.kind === "reject" || action.kind === "suspend"} confirmLabel={action.kind} body={action.kind === "reject" ? "The doctor will see this reason." : undefined} onCancel={() => setAction(null)} onConfirm={run} />}</div>;
}
