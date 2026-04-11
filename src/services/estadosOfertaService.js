import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Estados posibles de una oferta
export const ESTADOS_OFERTA = {
    EN_ESPERA: 'en_espera',
    APROBADA: 'aprobada',
    ACTIVA: 'activa',
    PASADA: 'pasada',
    RECHAZADA: 'rechazada',
    DESCARTADA: 'descartada',
};

// Registrar un cambio de estado en el historial
export const registrarCambioEstado = async (ofertaId, estadoAnterior, estadoNuevo, userId, razonRechazo = null) => {
    try {
        const historialRef = collection(db, 'historial_estados_oferta');

        const transicion = await addDoc(historialRef, {
            ofertaId,
            estadoAnterior,
            estadoNuevo,
            razonRechazo,
            cambiado_por: userId,
            timestamp: serverTimestamp()
        });

        console.log(`Cambio de estado registrado: ${estadoAnterior} -> ${estadoNuevo} (oferta: ${ofertaId})`);
        return { success: true, transicionId: transicion.id };
    } catch (error) {
        console.error('Error registrando cambio de estado:', error);
        throw error;
    }
};

// Aprobar una oferta: actualiza estado y registra en historial dentro de una transacción
export const aprobarOferta = async (ofertaId, userId) => {
    try {
        const ofertaRef = doc(db, 'ofertas', ofertaId);

        await runTransaction(db, async (transaccion) => {
            const ofertaSnap = await transaccion.get(ofertaRef);

            if (!ofertaSnap.exists()) {
                throw new Error(`Oferta con ID ${ofertaId} no encontrada`);
            }

            const estadoAnterior = ofertaSnap.data().estado;

            // Actualizar estado de la oferta a 'aprobada'
            transaccion.update(ofertaRef, {
                estado: ESTADOS_OFERTA.APROBADA,
                updatedAt: serverTimestamp()
            });

            // Registrar en historial dentro de la misma transacción
            const historialRef = doc(collection(db, 'historial_estados_oferta'));
            transaccion.set(historialRef, {
                ofertaId,
                estadoAnterior,
                estadoNuevo: ESTADOS_OFERTA.APROBADA,
                razonRechazo: null,
                cambiado_por: userId,
                timestamp: serverTimestamp()
            });
        });

        console.log(`Oferta ${ofertaId} aprobada por usuario ${userId}`);
        return { success: true };
    } catch (error) {
        console.error('Error aprobando oferta:', error);
        throw error;
    }
};

// Rechazar una oferta: actualiza estado, guarda razón y registra en historial
export const rechazarOferta = async (ofertaId, userId, razonRechazo) => {
    try {
        if (!razonRechazo) throw new Error('La razón de rechazo es requerida');

        const ofertaRef = doc(db, 'ofertas', ofertaId);

        await runTransaction(db, async (transaccion) => {
            const ofertaSnap = await transaccion.get(ofertaRef);

            if (!ofertaSnap.exists()) {
                throw new Error(`Oferta con ID ${ofertaId} no encontrada`);
            }

            const estadoAnterior = ofertaSnap.data().estado;

            // Actualizar estado de la oferta a 'rechazada' e incluir la razón
            transaccion.update(ofertaRef, {
                estado: ESTADOS_OFERTA.RECHAZADA,
                motivo_rechazo: razonRechazo,
                updatedAt: serverTimestamp()
            });

            // Registrar en historial dentro de la misma transacción
            const historialRef = doc(collection(db, 'historial_estados_oferta'));
            transaccion.set(historialRef, {
                ofertaId,
                estadoAnterior,
                estadoNuevo: ESTADOS_OFERTA.RECHAZADA,
                razonRechazo,
                cambiado_por: userId,
                timestamp: serverTimestamp()
            });
        });

        console.log(`Oferta ${ofertaId} rechazada por usuario ${userId}. Razón: ${razonRechazo}`);
        return { success: true };
    } catch (error) {
        console.error('Error rechazando oferta:', error);
        throw error;
    }
};

// Obtener historial completo de cambios de estado de una oferta
export const obtenerHistorialOferta = async (ofertaId) => {
    try {
        const historialRef = collection(db, 'historial_estados_oferta');

        // Ordenar por timestamp descendente para ver el más reciente primero
        const consulta = query(
            historialRef,
            where('ofertaId', '==', ofertaId),
            orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(consulta);

        const historial = snapshot.docs.map((entrada) => ({
            id: entrada.id,
            ...entrada.data()
        }));

        return historial;
    } catch (error) {
        console.error('Error obteniendo historial de oferta:', error);
        throw error;
    }
};

// Obtener solo el estado actual y la razón de rechazo (si existe) de una oferta
export const obtenerEstadoActual = async (ofertaId) => {
    try {
        const ofertaRef = doc(db, 'ofertas', ofertaId);
        const ofertaSnap = await getDoc(ofertaRef);

        if (!ofertaSnap.exists()) {
            throw new Error(`Oferta con ID ${ofertaId} no encontrada`);
        }

        const { estado, razonRechazo = null } = ofertaSnap.data();

        return { estado, razonRechazo };
    } catch (error) {
        console.error('Error obteniendo estado actual de oferta:', error);
        throw error;
    }
};
