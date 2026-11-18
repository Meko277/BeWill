import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import { ErrorBox } from "../components/ui";

export default function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [info, setInfo] = useState("");
  const submit = async (e: FormEvent) => { e.preventDefault(); setBusy(true); setErr(""); setInfo("");
    try { await signInWithEmailAndPassword(auth, email, password); } catch { setErr("Invalid email or password."); } finally { setBusy(false); } };
  const reset = async () => { if (!email) return setErr("Enter your email first."); try { await sendPasswordResetEmail(auth, email); setInfo("Password reset email sent."); setErr(""); } catch { setErr("Could not send reset email."); } };
  return <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-50 to-white p-4 dark:from-slate-900 dark:to-slate-800">
    <form onSubmit={submit} className="card fade-in w-full max-w-sm space-y-4">
      <div className="text-center"><div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-2xl text-white">♥</div>
        <h1 className="text-xl font-semibold">BeWill Admin</h1><p className="text-sm text-slate-500">Sign in with your administrator account</p></div>
      <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
      <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      {err && <ErrorBox text={err} />}{info && <div className="text-sm text-emerald-600">{info}</div>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      <button type="button" className="w-full text-sm text-brand-600" onClick={reset}>Forgot password?</button></form></div>;
}
