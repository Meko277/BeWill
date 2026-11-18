import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";

interface Ctx { user: User | null; isAdmin: boolean; loading: boolean }
const AuthCtx = createContext<Ctx>({ user: null, isAdmin: false, loading: true });
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Ctx>({ user: null, isAdmin: false, loading: true });
  useEffect(() => onAuthStateChanged(auth, async (user) => {
    // The admin flag comes ONLY from the server-issued custom claim. The server re-checks it on every call.
    const isAdmin = user ? (await user.getIdTokenResult(true)).claims.admin === true : false;
    setState({ user, isAdmin, loading: false });
  }), []);
  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}
