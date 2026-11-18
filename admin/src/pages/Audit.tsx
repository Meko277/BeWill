import { orderBy, limit } from "firebase/firestore";
import { useCollection, fmt } from "../lib/hooks";
import { PageHeader, Skeleton, Empty, ErrorBox } from "../components/ui";

export default function Audit() {
  const { rows, loading, error } = useCollection("auditLogs", orderBy("createdAt", "desc"), limit(300));
  return <div><PageHeader title="Audit log" subtitle="Append-only record of sensitive administrative actions" />
    {error && <ErrorBox text={error} />}{loading ? <Skeleton /> : rows.length === 0 ? <Empty text="No audit entries yet." /> :
      <div className="card overflow-x-auto p-0"><table className="w-full text-left text-sm"><thead className="text-slate-500"><tr><th className="p-3">When</th><th>Action</th><th>Target</th><th>Actor</th><th>Details</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className="border-t border-slate-100 align-top dark:border-slate-700"><td className="p-3 whitespace-nowrap">{fmt(r.createdAt)}</td><td>{r.action}</td><td>{r.target}</td><td>{String(r.actorId).slice(0, 8)}</td>
          <td className="max-w-xs break-words text-slate-500">{JSON.stringify(r.details ?? {})}</td></tr>)}</tbody></table></div>}</div>;
}
