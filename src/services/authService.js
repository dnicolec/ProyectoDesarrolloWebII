import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export const authService = {
  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  async register({ nombre, apellido, telefono, correo, direccion, dui, password }) {
    const cred = await createUserWithEmailAndPassword(auth, correo, password);

    await setDoc(doc(db, "usuarios", cred.user.uid), {
      uid: cred.user.uid,
      nombre,
      apellido,
      telefono,
      correo,
      direccion,
      dui,
      role: 'usuario',
      cupones: [],
      createdAt: serverTimestamp(),
      photoURL: null
    });

    await sendEmailVerification(cred.user);
    return cred.user;
  },

  async login(correo, password) {
    const cred = await signInWithEmailAndPassword(auth, correo, password);
    return cred.user;
  },

  async logout() {
    await signOut(auth);
  },

  async resendVerificationEmail() {
    if (!auth.currentUser) throw new Error("No hay usuario autenticado.");
    await sendEmailVerification(auth.currentUser);
  },

  async resetPassword(correo) {
    await sendPasswordResetEmail(auth, correo);
  },

  async changePassword(newPassword) {
    if (!auth.currentUser) throw new Error("No hay usuario autenticado.");
    await updatePassword(auth.currentUser, newPassword);
  },
};