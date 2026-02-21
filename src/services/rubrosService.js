import { 
  collection, 
  getDocs, 
  getDoc,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Obtener todos los rubros
export const obtenerRubros = async () => {
  try {
    const rubrosRef = collection(db, 'rubros');
    const querySnapshot = await getDocs(rubrosRef);
    
    const rubros = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return rubros;
  } catch (error) {
    console.error('Error obteniendo rubros:', error);
    throw error;
  }
};

// Obtener rubro por ID
export const obtenerRubroPorId = async (rubroId) => {
    try {
        const rubroRef = doc(db, 'rubros', rubroId);
        const rubroSnap = await getDoc(rubroRef);

        if (!rubroSnap.exists()) {
            throw new Error('Rubro no encontrado');
        }

        return {
            id: rubroSnap.id,
            ...rubroSnap.data()
        };
    } catch (error) {
        console.error('Error obteniendo rubro:', error);
        throw error;
    }
};
