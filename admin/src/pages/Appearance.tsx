import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { PageHeader, ErrorBox, ConfirmDialog } from "../components/ui";

interface Banner { imageUrl: string; title: string; link: string }
interface Cfg { primaryColor: string; logoUrl: string; splashUrl: string; backgroundUrl: string; banners: Banner[] }
const empty: Cfg = { primaryColor: "#0F9D8F", logoUrl: "", splashUrl: "", backgroundUrl: "", banners: [] };

export default function Appearance() {
  const [cfg, setCfg] = useState<Cfg>(empty); const [err, setErr] = useState(""); const [ok, setOk] = useState(""); const [confirm, setConfirm] = useState(false); const [busy, setBusy] = useState(false);
  useEffect(() => { getDoc(doc(db, "appConfig", "branding")).then((s) => setCfg({ ...empty, ...(s.data() as Partial<Cfg>) })); }, []);
  const upload = async (key: "logoUrl" | "splashUrl" | "backgroundUrl" | "banner", file?: File) => {
    if (!file) return; setBusy(true); setErr("");
    try { const r = ref(storage, `branding/${key}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`); await uploadBytes(r, file, { contentType: file.type }); const url = await getDownloadURL(r);
      setCfg((c) => key === "banner" ? { ...c, banners: [...c.banners, { imageUrl: url, title: "", link: "" }] } : { ...c, [key]: url }); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } };
  const save = async () => { await setDoc(doc(db, "appConfig", "branding"), cfg, { merge: true }); setConfirm(false); setOk("Published. The mobile app picks this up on next launch."); };
  const Pick = ({ label, k }: { label: string; k: "logoUrl" | "splashUrl" | "backgroundUrl" }) => <div className="card"><div className="mb-2 text-sm font-medium">{label}</div>
    {cfg[k] ? <img src={cfg[k]} alt={label} className="mb-2 h-24 rounded-xl object-contain" /> : <div className="mb-2 text-sm text-slate-500">Not set (app uses built-in default)</div>}
    <input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={(e) => upload(k, e.target.files?.[0])} />{cfg[k] && <button className="btn-ghost ml-2" onClick={() => setCfg({ ...cfg, [k]: "" })}>Reset</button>}</div>;
  return <div><PageHeader title="Appearance" subtitle="Remote configuration for the mobile app" action={<button className="btn-primary" onClick={() => setConfirm(true)} disabled={busy}>Publish changes</button>} />
    {err && <ErrorBox text={err} />}{ok && <div className="mb-3 text-sm text-emerald-600">{ok}</div>}
    <div className="grid gap-4 md:grid-cols-2"><Pick label="Application logo" k="logoUrl" /><Pick label="Splash screen artwork" k="splashUrl" /><Pick label="Background image" k="backgroundUrl" />
      <div className="card"><div className="mb-2 text-sm font-medium">Primary theme color</div><input type="color" value={cfg.primaryColor} onChange={(e) => setCfg({ ...cfg, primaryColor: e.target.value })} /> <code className="ml-2 text-sm">{cfg.primaryColor}</code></div></div>
    <h2 className="mb-2 mt-8 text-lg font-semibold">Promotional banners</h2>
    <div className="grid gap-3 md:grid-cols-2">{cfg.banners.map((b, i) => <div key={i} className="card space-y-2"><img src={b.imageUrl} alt="" className="h-28 w-full rounded-xl object-cover" />
      <input className="input" placeholder="Title" value={b.title} onChange={(e) => setCfg({ ...cfg, banners: cfg.banners.map((x, j) => j === i ? { ...x, title: e.target.value } : x) })} />
      <input className="input" placeholder="Link (optional, https://…)" value={b.link} onChange={(e) => setCfg({ ...cfg, banners: cfg.banners.map((x, j) => j === i ? { ...x, link: e.target.value } : x) })} />
      <button className="btn-danger" onClick={() => setCfg({ ...cfg, banners: cfg.banners.filter((_, j) => j !== i) })}>Remove</button></div>)}</div>
    <div className="mt-3"><label className="btn-ghost cursor-pointer">Add banner image<input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => upload("banner", e.target.files?.[0])} /></label></div>
    {confirm && <ConfirmDialog title="Publish appearance changes?" body="All app users will see these changes." onCancel={() => setConfirm(false)} onConfirm={save} />}</div>;
}
