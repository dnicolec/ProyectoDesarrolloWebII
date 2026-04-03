import { 
    collection, 
    getDocs, 
    getDoc,
    doc,
    addDoc,
    updateDoc,
    serverTimestamp,
    query,
    where
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Lectura
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

// Escritura
export const crearEmpresa = async (datos) => {
  try {
    const empresasRef = collection(db, 'empresas');
    const nuevaEmpresa = {
      nombre: datos.nombre,
      codigo: datos.codigo,
      direccion: datos.direccion,
      nombre_contacto: datos.nombre_contacto,
      telefono: datos.telefono,
      email: datos.email,
      rubro: datos.rubro,
      porcentaje_comision: datos.porcentaje_comision,
      logo: datos.logo || null,
      sitio_web: datos.sitio_web || null,
      status: 'activa',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(empresasRef, nuevaEmpresa);
    return { id: docRef.id, ...nuevaEmpresa };
  } catch (error) {
    console.error('Error creando empresa:', error);
    throw error;
  }
};

export const actualizarEmpresa = async (empresaId, datos) => {
  try {
    const empresaRef = doc(db, 'empresas', empresaId);
    await updateDoc(empresaRef, {
      ...datos,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error actualizando empresa:', error);
    throw error;
  }
};

export const eliminarEmpresa = async (empresaId) => {
  try {
    const empresaRef = doc(db, 'empresas', empresaId);
    await updateDoc(empresaRef, { status: 'inactiva', updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error('Error eliminando empresa:', error);
    throw error;
  }
};
