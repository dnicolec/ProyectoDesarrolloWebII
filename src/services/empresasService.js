import { 
    collection, 
    getDocs, 
    getDoc,
    doc,
    query,
    where
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Obtener todas las empresas activas
export const obtenerEmpresas = async () => {
    try {
        const empresasRef = collection(db, 'empresas');
        const q = query(empresasRef, where('status', '==', 'activa'));
        
        const querySnapshot = await getDocs(q);
        
        const empresas = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return empresas;
    } catch (error) {
        console.error('Error obteniendo empresas:', error);
        throw error;
    }
};

// Obtener empresa por ID
export const obtenerEmpresaPorId = async (empresaId) => {
    try {
        const empresaRef = doc(db, 'empresas', empresaId);
        const empresaSnap = await getDoc(empresaRef);

        if (!empresaSnap.exists()) {
            throw new Error('Empresa no encontrada');
        }

        return {
            id: empresaSnap.id,
            ...empresaSnap.data()
        };
    } catch (error) {
        console.error('Error obteniendo empresa:', error);
        throw error;
    }
};

// Obtener empresas por rubro
export const obtenerEmpresasPorRubro = async (rubroId) => {
    try {
        const empresasRef = collection(db, 'empresas');
        const q = query(
            empresasRef,
            where('rubro', '==', rubroId),
            where('status', '==', 'activa')
        );

        const querySnapshot = await getDocs(q);
        
        const empresas = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return empresas;
    } catch (error) {
        console.error('Error obteniendo empresas por rubro:', error);
        throw error;
    }
};
