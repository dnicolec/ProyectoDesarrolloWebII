import {
  collection,
  updateDoc,
  increment,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";

// Solicitar un cupón de una oferta (crea 1 cupón asignado directo al usuario)
export const solicitarCupon = async (ofertaId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Debes iniciar sesión para obtener cupones");

    const ofertaRef = doc(db, "ofertas", ofertaId);
    const usuarioRef = doc(db, "usuarios", user.uid);
    const cuponesRef = collection(db, "cupones");

    // Verificar que el usuario no tenga ya un cupón de esta oferta
    const qExistente = query(
      cuponesRef,
      where("oferta_id", "==", ofertaId),
      where("usuario_id", "==", user.uid),
    );
    const existenteSnap = await getDocs(qExistente);
    if (!existenteSnap.empty) {
      throw new Error("Ya tienes un cupón para esta oferta");
    }

    // Transacción atómica: verificar capacidad + crear cupón + actualizar contadores
    const cuponId = await runTransaction(db, async (transaction) => {
      const ofertaSnap = await transaction.get(ofertaRef);
      if (!ofertaSnap.exists()) throw new Error("La oferta no existe");

      const oferta = ofertaSnap.data();

      // Verificar que queden cupones disponibles
      const generados = oferta.cuponesGenerados ?? 0;
      if (generados >= oferta.cantidadCupones) {
        throw new Error("No quedan cupones disponibles para esta oferta");
      }

      const usuarioSnap = await transaction.get(usuarioRef);
      const cuponesList = usuarioSnap.exists()
        ? usuarioSnap.data()?.cupones || []
        : [];

      // Generar código único
      const codigo = `CUPON-${ofertaId}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Crear el documento del cupón
      const nuevoCuponRef = doc(cuponesRef);
      transaction.set(nuevoCuponRef, {
        codigo,
        oferta_id: ofertaId,
        usuario_id: user.uid,
        estado: "asignado",
        createdAt: serverTimestamp(),
        asignadoEn: serverTimestamp(),
        canjeadoEn: null,
      });

      // Incrementar cuponesGenerados en la oferta
      transaction.update(ofertaRef, {
        cuponesGenerados: increment(1),
      });

      // Agregar el cupón al array del usuario
      transaction.set(
        usuarioRef,
        {
          cupones: [...cuponesList, nuevoCuponRef.id],
        },
        { merge: true },
      );

      return nuevoCuponRef.id;
    });

    return { success: true, cuponId, mensaje: "Cupón agregado a tu cuenta" };
  } catch (error) {
    console.error("Error solicitando cupón:", error);
    throw error;
  }
};

// Canjear cupón (marcar como usado)
export const canjearCupon = async (cuponId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Debes estar autenticado");

    const cuponRef = doc(db, "cupones", cuponId);
    const cuponSnap = await getDoc(cuponRef);

    if (!cuponSnap.exists()) throw new Error("Cupón no encontrado");

    const cuponData = cuponSnap.data();

    if (cuponData.usuario_id !== user.uid)
      throw new Error("Este cupón no te pertenece");
    if (cuponData.estado === "canjeado")
      throw new Error("Este cupón ya fue canjeado");
    if (cuponData.estado !== "asignado")
      throw new Error("Este cupón no puede ser canjeado");

    await updateDoc(cuponRef, {
      estado: "canjeado",
      canjeadoEn: serverTimestamp(),
    });

    return { success: true, mensaje: "Cupón canjeado exitosamente" };
  } catch (error) {
    console.error("Error canjeando cupón:", error);
    throw error;
  }
};

// Obtener todos los cupones del usuario (con datos de oferta y empresa)
export const obtenerCuponesUsuario = async (uid) => {
  try {
    if (!uid) throw new Error("No hay UID (usuario no autenticado)");

    const cuponesRef = collection(db, "cupones");
    const q = query(cuponesRef, where("usuario_id", "==", uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return [];

    const cupones = await Promise.all(
      querySnapshot.docs.map(async (cuponDoc) => {
        const cuponData = cuponDoc.data();

        const ofertaRef = doc(db, "ofertas", cuponData.oferta_id);
        const ofertaSnap = await getDoc(ofertaRef);

        let ofertaConEmpresa = null;
        if (ofertaSnap.exists()) {
          const ofertaData = ofertaSnap.data();
          let empresa = null;

          if (ofertaData.empresa_id) {
            const empresaSnap = await getDoc(
              doc(db, "empresas", ofertaData.empresa_id),
            );
            empresa = empresaSnap.exists() ? empresaSnap.data() : null;
          }

          ofertaConEmpresa = { ...ofertaData, empresa };
        }

        return { id: cuponDoc.id, ...cuponData, oferta: ofertaConEmpresa };
      }),
    );

    return cupones;
  } catch (error) {
    console.error("Error obteniendo cupones del usuario:", error);
    throw error;
  }
};
// Obtener un cupón por ID (con datos de oferta y empresa)
export const obtenerCuponPorId = async (cuponId) => {
  try {
    const cuponRef = doc(db, "cupones", cuponId);
    const cuponSnap = await getDoc(cuponRef);
    if (!cuponSnap.exists()) throw new Error("Cupón no encontrado");

    const cuponData = cuponSnap.data();
    const ofertaRef = doc(db, "ofertas", cuponData.oferta_id);
    const ofertaSnap = await getDoc(ofertaRef);

    let ofertaConEmpresa = null;
    if (ofertaSnap.exists()) {
      const ofertaData = ofertaSnap.data();
      let empresa = null;
      if (ofertaData.empresa_id) {
        const empresaSnap = await getDoc(
          doc(db, "empresas", ofertaData.empresa_id),
        );
        empresa = empresaSnap.exists() ? empresaSnap.data() : null;
      }
      ofertaConEmpresa = { ...ofertaData, empresa };
    }

    return { id: cuponSnap.id, ...cuponData, oferta: ofertaConEmpresa };
  } catch (error) {
    console.error("Error obteniendo cupón:", error);
    throw error;
  }
};

// Validar cupón por código (para negocios)
export const validarCupon = async (codigoCupon) => {
  try {
    const cuponesRef = collection(db, "cupones");
    const q = query(cuponesRef, where("codigo", "==", codigoCupon));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) throw new Error("Cupón no encontrado");

    const cuponData = querySnapshot.docs[0].data();
    return {
      valido: cuponData.estado === "asignado",
      estado: cuponData.estado,
      oferta_id: cuponData.oferta_id,
      usuario_id: cuponData.usuario_id,
    };
  } catch (error) {
    console.error("Error validando cupón:", error);
    throw error;
  }
};

// --- Funciones legacy (se mantienen por compatibilidad) -

/** @deprecated Usar solicitarCupon() en su lugar */
export const generarCupones = async () => {
  console.warn(
    "generarCupones() está deprecada. Usa solicitarCupon() en su lugar.",
  );
  return { success: false, mensaje: "Función deprecada" };
};

/** @deprecated Usar solicitarCupon() en su lugar */
export const asignarCuponPorOferta = async (ofertaId) => {
  console.warn(
    "asignarCuponPorOferta() está deprecada. Usa solicitarCupon() en su lugar.",
  );
  return solicitarCupon(ofertaId);
};
