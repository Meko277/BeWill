import { Routes, Route, Navigate, NavLink, Outlet } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { auth, firebaseConfigured } from "./lib/firebase";
import { useAuth } from "./lib/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients";
import Consultations from "./pages/Consultations";
import Plans from "./pages/Plans";
import Specializations from "./pages/Specializations";
import Pricing from "./pages/Pricing";
import Appearance from "./pages/Appearance";
import Audit from "./pages/Audit";

const nav = [["/", "Dashboard"], ["/doctors", "Doctors"], ["/patients", "Patients"], ["/consultations", "Consultations"], ["/pricing", "Price requests"],
  ["/plans", "Subscriptions"], ["/specializations", "Specializations"], ["/appearance", "Appearance"], ["/audit", "Audit log"]];

function Layout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return <div className="min-h-screen md:flex">
    <aside className={`${open ? "block" : "hidden"} w-full shrink-0 border-r border-slate-200 bg-white p-4 md:block md:w-60 dark:border-slate-700 dark:bg-slate-800`}>
      <div className="mb-6 flex items-center gap-2 text-xl font-bold text-brand-600"><span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-500 text-white">♥</span>BeWill</div>
      <nav className="space-y-1">{nav.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)}
        className={({ isActive }) => `block rounded-xl px-3 py-2 text-sm transition ${isActive ? "bg-brand-50 font-medium text-brand-700" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"}`}>{label}</NavLink>)}</nav>
      <div className="mt-6 border-t pt-4 text-xs text-slate-500 dark:border-slate-700"><div className="truncate">{user?.email}</div>
        <button className="btn-ghost mt-2 w-full" onClick={() => signOut(auth)}>Sign out</button></div>
    </aside>
    <main className="flex-1 p-4 md:p-8">
      <button className="btn-ghost mb-4 md:hidden" onClick={() => setOpen(!open)}>☰ Menu</button>
      <Outlet />
    </main></div>;
}

export default function App() {
  const { user, isAdmin, loading } = useAuth();
  if (!firebaseConfigured) return <div className="grid min-h-screen place-items-center p-6"><div className="card max-w-lg">
    <h1 className="text-xl font-semibold">Firebase is not configured</h1>
    <p className="mt-2 text-sm text-slate-500">Copy <code>.env.example</code> to <code>admin/.env.local</code> and fill in the Firebase web app values for project bewill-666e7, then restart <code>npm run dev</code>.</p></div></div>;
  if (loading) return <div className="grid min-h-screen place-items-center text-slate-500">Loading…</div>;
  if (!user) return <Login />;
  if (!isAdmin) return <div className="grid min-h-screen place-items-center p-6"><div className="card max-w-md text-center"><h1 className="text-xl font-semibold">Access denied</h1>
    <p className="mt-2 text-sm text-slate-500">This account does not have administrator access. Admin access can only be granted by the project owner (see README).</p>
    <button className="btn-ghost mt-4" onClick={() => signOut(auth)}>Sign out</button></div></div>;
  return <Routes><Route element={<Layout />}>
    <Route index element={<Dashboard />} /><Route path="doctors" element={<Doctors />} /><Route path="patients" element={<Patients />} />
    <Route path="consultations" element={<Consultations />} /><Route path="pricing" element={<Pricing />} /><Route path="plans" element={<Plans />} />
    <Route path="specializations" element={<Specializations />} /><Route path="appearance" element={<Appearance />} /><Route path="audit" element={<Audit />} />
    <Route path="*" element={<Navigate to="/" replace />} /></Route></Routes>;
}
