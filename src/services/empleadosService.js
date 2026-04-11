import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Obtener todos los empleados de una empresa, ordenados por apellido
export const obtenerEmpleadosPorEmpresa = async (empresaId) => {
    try {
        const usuariosRef = collection(db, 'usuarios');

        const consulta = query(
            usuariosRef,
            where('role', '==', 'empleado'),
            where('empresaId', '==', empresaId),
            orderBy('apellido', 'asc')
        );

        const snapshot = await getDocs(consulta);

        return snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data()
        }));
    } catch (error) {
        console.error('Error obteniendo empleados:', error);
        throw error;
    }
};

// Obtener un empleado por su UID
export const obtenerEmpleado = async (uid) => {
    try {
        const usuarioRef = doc(db, 'usuarios', uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (!usuarioSnap.exists()) {
            throw new Error(`Empleado con UID ${uid} no encontrado`);
        }

        return {
            id: usuarioSnap.id,
            ...usuarioSnap.data()
        };
    } catch (error) {
        console.error('Error obteniendo empleado:', error);
        throw error;
    }
};

// Actualizar datos de un empleado (nombre, apellido, correo)
export const actualizarEmpleado = async (uid, updates) => {
    try {
        const usuarioRef = doc(db, 'usuarios', uid);

        const camposPermitidos = ['nombre', 'apellido', 'correo'];
        const datosActualizados = {};

        camposPermitidos.forEach((campo) => {
            if (updates[campo] !== undefined) {
                datosActualizados[campo] = updates[campo];
            }
        });

        await updateDoc(usuarioRef, {
            ...datosActualizados,
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error actualizando empleado:', error);
        throw error;
    }
};

// Desactivar un empleado (soft delete - cambia role a empleado_inactivo)
export const eliminarEmpleado = async (uid) => {
    try {
        const usuarioRef = doc(db, 'usuarios', uid);

        await updateDoc(usuarioRef, {
            activo: false,
            role: 'empleado_inactivo',
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error desactivando empleado:', error);
        throw error;
    }
};
