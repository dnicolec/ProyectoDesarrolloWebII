import { 
    collection, 
    getDocs, 
    getDoc,
    addDoc,
    updateDoc,
    serverTimestamp, 
    doc,
    query,
    where
} from 'firebase/firestore';
import { db } from '../lib/firebase';


//Aprobar una oferta
export async function aprobarOferta(ofertaId) {
  const ofertaRef = doc(db, "ofertas", ofertaId);

  await updateDoc(ofertaRef, {
    estado: "aprobada",
    motivo_rechazo: "",
    updatedAt: serverTimestamp(),
  });
}

//Rechazar una oferta
export async function rechazarOferta(ofertaId, motivo) {
  const ofertaRef = doc(db, "ofertas", ofertaId);

  await updateDoc(ofertaRef, {
    estado: "rechazada",
    motivo_rechazo: motivo,
    updatedAt: serverTimestamp(),
  });
}

// Obtener ofertas pendientes de aprobación (en_espera)
export const obtenerOfertasPendientes = async () => {
    try {
        const ofertasRef = collection(db, 'ofertas');
        const q = query(ofertasRef, where('estado', '==', 'en_espera'));
        const querySnapshot = await getDocs(q);

        const ofertas = await Promise.all(
            querySnapshot.docs.map(async (ofertaDoc) => {
                const ofertaData = ofertaDoc.data();
                const empresaRef = doc(db, 'empresas', ofertaData.empresa_id);
                const empresaSnap = await getDoc(empresaRef);
                return {
                    id: ofertaDoc.id,
                    ...ofertaData,
                    empresa: empresaSnap.exists() ? empresaSnap.data() : null
                };
            })
        );

        return ofertas;
    } catch (error) {
        console.error('Error obteniendo ofertas pendientes:', error);
        throw error;
    }
};

// Obtener todas las ofertas aprobadas
export const obtenerOfertasAprobadas = async () => {
    try {
        const ofertasRef = collection(db, 'ofertas');
        const q = query(ofertasRef, where('estado', '==', 'aprobada'));
        const querySnapshot = await getDocs(q);

        const ofertas = await Promise.all(
            querySnapshot.docs.map(async (ofertaDoc) => {
                const ofertaData = ofertaDoc.data();
                const empresaRef = doc(db, 'empresas', ofertaData.empresa_id);
                const empresaSnap = await getDoc(empresaRef);
                return {
                    id: ofertaDoc.id,
                    ...ofertaData,
                    empresa: empresaSnap.exists() ? empresaSnap.data() : null
                };
            })
        );

        return ofertas;
    } catch (error) {
        console.error('Error obteniendo ofertas:', error);
        throw error;
    }
};

// Obtener oferta por ID
//  de cupones NO necesitamos consultar la colección cupones
// para saber disponibles - basta con cantidadCupones - cuponesGenerados
export const obtenerOfertaPorId = async (ofertaId) => {
    try {
        const ofertaRef = doc(db, 'ofertas', ofertaId);
        const ofertaSnap = await getDoc(ofertaRef);

        if (!ofertaSnap.exists()) throw new Error('Oferta no encontrada');

        const ofertaData = ofertaSnap.data();

        const empresaRef = doc(db, 'empresas', ofertaData.empresa_id);
        const empresaSnap = await getDoc(empresaRef);

        return {
            id: ofertaSnap.id,
            ...ofertaData,
            empresa: empresaSnap.exists() ? empresaSnap.data() : null,
        };
    } catch (error) {
        console.error('Error obteniendo oferta:', error);
        throw error;
    }
};

// Obtener ofertas por rubro
export const obtenerOfertasPorRubro = async (rubroId) => {
    try {
        const ofertasRef = collection(db, 'ofertas');
        const q = query(
            ofertasRef,
            where('rubro', '==', rubroId),
            where('estado', '==', 'aprobada')
        );
        const querySnapshot = await getDocs(q);

        const ofertas = await Promise.all(
            querySnapshot.docs.map(async (ofertaDoc) => {
                const ofertaData = ofertaDoc.data();
                const empresaRef = doc(db, 'empresas', ofertaData.empresa_id);
                const empresaSnap = await getDoc(empresaRef);
                return {
                    id: ofertaDoc.id,
                    ...ofertaData,
                    empresa: empresaSnap.exists() ? empresaSnap.data() : null
                };
            })
        );

        return ofertas;
    } catch (error) {
        console.error('Error obteniendo ofertas por rubro:', error);
        throw error;
    }
};

// Obtener ofertas por empresa
export const obtenerOfertasPorEmpresa = async (empresaId) => {
    try {
        const ofertasRef = collection(db, 'ofertas');
        const q = query(ofertasRef, where('empresa_id', '==', empresaId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error obteniendo ofertas por empresa:', error);
        throw error;
    }
};

// Crear nueva oferta
export const crearOferta = async (empresaId, datos) => {
  const ref = await addDoc(collection(db, 'ofertas'), {
    ...datos,
    empresa_id: empresaId,
    estado: 'en_espera',
    cuponesGenerados: 0,
    creadoEn: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

// Actualizar oferta existente
export const actualizarOferta = async (ofertaId, datos) => {
  await updateDoc(doc(db, 'ofertas', ofertaId), {
    ...datos,
    updatedAt: serverTimestamp(),
  });
};