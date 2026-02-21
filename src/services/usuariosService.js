import { 
    getDoc,
    doc,
    setDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

// Crear usuario en Firestore (cuando se registra)
export const crearUsuario = async (uid, email, nombre) => {
    try {
        const usuarioRef = doc(db, 'usuarios', uid);
        
        await setDoc(usuarioRef, {
            uid,
            email,
            nombre: nombre || email.split('@')[0],
            role: 'usuario',
            cupones: [],
            createdAt: serverTimestamp(),
            photoURL: null
        });

        console.log(` Usuario ${email} creado`);
        return { success: true };
    } catch (error) {
        console.error('Error creando usuario:', error);
        throw error;
    }
};

// Obtener datos del usuario actual
export const obtenerPerfilActual = async () => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No hay usuario autenticado');

        const usuarioRef = doc(db, 'usuarios', user.uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (!usuarioSnap.exists()) {
            throw new Error('Perfil de usuario no encontrado');
        }

        return {
            id: usuarioSnap.id,
            ...usuarioSnap.data()
        };
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        throw error;
    }
};

// Obtener usuario por ID
export const obtenerUsuarioPorId = async (uid) => {
    try {
        const usuarioRef = doc(db, 'usuarios', uid);
        const usuarioSnap = await getDoc(usuarioRef);

        if (!usuarioSnap.exists()) {
            throw new Error('Usuario no encontrado');
        }

        return {
            id: usuarioSnap.id,
            ...usuarioSnap.data()
        };
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        throw error;
    }
};

// Actualizar perfil
export const actualizarPerfil = async (datos) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No hay usuario autenticado');

        const usuarioRef = doc(db, 'usuarios', user.uid);
        
        await updateDoc(usuarioRef, {
            ...datos,
            updatedAt: serverTimestamp()
        });

        console.log(' Perfil actualizado');
        return { success: true };
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        throw error;
    }
};
