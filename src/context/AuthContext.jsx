/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { authService } from "../services/authService";
import { db } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    const unsub = authService.onAuthChange(async (u) => {
      setLoading(true);
      setUser(u);

      if (!u) {
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "usuarios", u.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const profileData = userSnap.data();
          setProfile(profileData);
          setRole(profileData.role || null);
        } else {
          setProfile(null);
          setRole(null);
        }
      } catch (error) {
        console.error("Error cargando perfil del usuario:", error);
        setProfile(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
