import { useEffect, useState } from "react";
import { onSnapshot, query, collection, QueryConstraint, DocumentData } from "firebase/firestore";
import { db } from "./firebase";

export type Row = DocumentData & { id: string };
export function useCollection(path: string, ...constraints: QueryConstraint[]) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, path), ...constraints),
      (s) => { setRows(s.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
      (e) => { setError(e.message); setLoading(false); });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  return { rows, loading, error };
}
export const fmt = (t: unknown): string => {
  const ms = typeof t === "object" && t && "toMillis" in t ? (t as { toMillis(): number }).toMillis() : typeof t === "number" ? t : null;
  return ms ? new Date(ms).toLocaleString() : "—";
};
