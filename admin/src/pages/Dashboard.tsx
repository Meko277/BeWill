import { useEffect, useState } from "react";
import { call } from "../lib/firebase";
import { PageHeader, Skeleton, ErrorBox } from "../components/ui";
import { fmt } from "../lib/hooks";

interface Stats { patients: number; doctors: number; verifiedDoctors: number; pendingApplications: number; activeConsultations: number; premiumSubscribers: number; revenue: number | null;
  recentActivity: { id: string; action: string; target: string; actorId: string; at: number | null }[] }

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null); const [err, setErr] = useState("");
  useEffect(() => { call<Stats>("adminDashboardStats").then(setS).catch((e) => setErr(e.message)); }, []);
  const cards: [string, string | number][] = s ? [["Patients", s.patients], ["Doctors", s.doctors], ["Verified doctors", s.verifiedDoctors], ["Pending applications", s.pendingApplications],
    ["Active consultations", s.activeConsultations], ["Premium subscribers", s.premiumSubscribers], ["Revenue", s.revenue === null ? "No payment data yet" : s.revenue]] : [];
  return <div><PageHeader title="Dashboard" subtitle="Platform overview" />
    {err && <ErrorBox text={err} />}{!s && !err && <Skeleton rows={4} />}
    {s && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([k, v]) => <div key={k} className="card fade-in"><div className="text-sm text-slate-500">{k}</div><div className="mt-1 text-2xl font-semibold">{v}</div></div>)}</div>
      <h2 className="mb-2 mt-8 text-lg font-semibold">Recent activity</h2>
      <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-700">{s.recentActivity.length === 0 && <div className="p-4 text-sm text-slate-500">No activity yet.</div>}
        {s.recentActivity.map((a) => <div key={a.id} className="flex justify-between gap-3 p-3 text-sm"><span><b>{a.action}</b> · <span className="text-slate-500">{a.target}</span></span><span className="text-slate-500">{fmt(a.at)}</span></div>)}</div></>}</div>;
}
