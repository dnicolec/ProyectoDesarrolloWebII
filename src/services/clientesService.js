import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { obtenerCuponesUsuario } from "./cuponesService";

// Obtener todos los clientes (para admin)
export const obtenerClientes = async () => {
  try {
    const q = query(
      collection(db, "usuarios"),
      where("role", "==", "cliente")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error("Error obteniendo clientes:", error);
    throw error;
  }
};

// Obtener cliente por ID con sus cupones categorizados
export const obtenerClientePorId = async (uid) => {
  try {
    const usuarioRef = doc(db, "usuarios", uid);
    const usuarioSnap = await getDoc(usuarioRef);

    if (!usuarioSnap.exists()) throw new Error("Cliente no encontrado");

    const clienteData = { id: usuarioSnap.id, ...usuarioSnap.data() };

    // Obtener cupones del cliente con info de oferta
    const cupones = await obtenerCuponesUsuario(uid);

    const ahora = new Date();

    const cuponesDisponibles = [];
    const cuponesCanjeados = [];
    const cuponesVencidos = [];

    cupones.forEach((cupon) => {
      if (cupon.estado === "canjeado") {
        cuponesCanjeados.push(cupon);
      } else {
        // Verificar si la fecha límite de uso venció
        const fechaLimite = cupon.oferta?.fecha_limite_uso?.toDate?.() ||
          (cupon.oferta?.fecha_limite_uso ? new Date(cupon.oferta.fecha_limite_uso) : null);

        if (fechaLimite && fechaLimite < ahora) {
          cuponesVencidos.push(cupon);
        } else {
          cuponesDisponibles.push(cupon);
        }
      }
    });

    return {
      ...clienteData,
      cuponesDisponibles,
      cuponesCanjeados,
      cuponesVencidos,
    };
  } catch (error) {
    console.error("Error obteniendo cliente por ID:", error);
    throw error;
  }
};