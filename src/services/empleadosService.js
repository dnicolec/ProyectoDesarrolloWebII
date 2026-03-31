import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Crear un nuevo empleado vinculado a una empresa
export const crearEmpleado = async (empresaId, { nombre, apellido, correo }) => {
    try {
        // Validar campos requeridos
        if (!empresaId) throw new Error('El empresaId es requerido');
        if (!nombre) throw new Error('El nombre es requerido');
        if (!apellido) throw new Error('El apellido es requerido');
        if (!correo) throw new Error('El correo es requerido');

        const empleadosRef = collection(db, 'empleados');

        const nuevoEmpleado = await addDoc(empleadosRef, {
            nombre,
            apellido,
            correo,
            empresaId,
            estado: 'activo',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        console.log(`Empleado ${nombre} ${apellido} creado con ID: ${nuevoEmpleado.id}`);
        return { success: true, empleadoId: nuevoEmpleado.id };
    } catch (error) {
        console.error('Error creando empleado:', error);
        throw error;
    }
};

// Obtener todos los empleados de una empresa, ordenados por apellido
export const obtenerEmpleadosPorEmpresa = async (empresaId) => {
    try {
        const empleadosRef = collection(db, 'empleados');

        // Filtrar por empresa y ordenar alfabéticamente por apellido
        const consulta = query(
            empleadosRef,
            where('empresaId', '==', empresaId),
            orderBy('apellido', 'asc')
        );

        const snapshot = await getDocs(consulta);

        const empleados = snapshot.docs.map((empleadoDoc) => ({
            id: empleadoDoc.id,
            ...empleadoDoc.data()
        }));

        return empleados;
    } catch (error) {
        console.error('Error obteniendo empleados:', error);
        throw error;
    }
};

// Obtener un empleado por su ID
export const obtenerEmpleado = async (empleadoId) => {
    try {
        const empleadoRef = doc(db, 'empleados', empleadoId);
        const empleadoSnap = await getDoc(empleadoRef);

        // Lanzar error si el documento no existe
        if (!empleadoSnap.exists()) {
            throw new Error(`Empleado con ID ${empleadoId} no encontrado`);
        }

        return {
            id: empleadoSnap.id,
            ...empleadoSnap.data()
        };
    } catch (error) {
        console.error('Error obteniendo empleado:', error);
        throw error;
    }
};

// Actualizar datos de un empleado
export const actualizarEmpleado = async (empleadoId, updates) => {
    try {
        const empleadoRef = doc(db, 'empleados', empleadoId);

        // Campos permitidos para actualizar
        const camposPermitidos = ['nombre', 'apellido', 'correo', 'estado'];
        const datosActualizados = {};

        camposPermitidos.forEach((campo) => {
            if (updates[campo] !== undefined) {
                datosActualizados[campo] = updates[campo];
            }
        });

        await updateDoc(empleadoRef, {
            ...datosActualizados,
            updatedAt: serverTimestamp()
        });

        console.log(`Empleado ${empleadoId} actualizado`);
        return { success: true };
    } catch (error) {
        console.error('Error actualizando empleado:', error);
        throw error;
    }
};

// Eliminar un empleado por su ID
export const eliminarEmpleado = async (empleadoId) => {
    try {
        const empleadoRef = doc(db, 'empleados', empleadoId);

        await deleteDoc(empleadoRef);

        console.log(`Empleado ${empleadoId} eliminado`);
        return { success: true };
    } catch (error) {
        console.error('Error eliminando empleado:', error);
        throw error;
    }
};
