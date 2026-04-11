/**
 * seedData.js -Solo para desarrollo. Nunca ejecutar en producción.
 * Solo el super admin (superadmin@lacuponera.com) puede ejecutar estas funciones.
 *
 * Crea:
 *  1. Usuarios de prueba (4 roles) + sus cuentas en Firebase Auth
 *  2. Empleados de prueba (solo Firestore, sin cuenta Auth)
 *  3. Empresas de prueba (10 marcas)
 *  4. Ofertas (6 estados + 18 activas)
 *  5. Cupones para el cliente de prueba
 *  6. Historial de estados
 *
 * limpiarSeed borra TODO excepto el super admin. La sesión principal nunca se modifica.
 *
 * IMPORTANTE: El super admin (superadmin@lacuponera.com) nunca se crea ni se borra
 *             desde aquí. Simplemente existe en Firebase Auth y Firestore.
 */

import {
    collection, doc, setDoc, addDoc, getDocs, deleteDoc,
    serverTimestamp, Timestamp, runTransaction, increment,
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signOut as auxSignOut,
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { db, auth, firebaseConfig } from '../lib/firebase';

// =============================================================================
// INSTANCIA AUXILIAR DE FIREBASE
// Permite crear/autenticar usuarios de prueba sin cambiar la sesión principal.
// La sesión del super admin en `auth` (app principal) nunca se ve afectada.
// =============================================================================

function getSeedApp() {
    const existing = getApps().find(a => a.name === 'seed-aux');
    return existing || initializeApp(firebaseConfig, 'seed-aux');
}

const getSeedAuth = () => getAuth(getSeedApp());
const getSeedDb   = () => getFirestore(getSeedApp());

// =============================================================================
// CONSTANTES
// =============================================================================

export const SUPER_ADMIN_EMAIL = 'superadmin@lacuponera.com';

// =============================================================================
// USUARIOS DE PRUEBA
// 4 genéricos + 15 del equipo (5 integrantes × 3 roles)
// Todos con password: Test1234!
// =============================================================================

// Integrantes del equipo y la empresa que administran como admin_empresa
const _EQUIPO = [
    { nombre: 'Andre',   empresaId: 'seed-siman'      },
    { nombre: 'Tiffany', empresaId: 'seed-pizzahut'   },
    { nombre: 'Debbie',  empresaId: 'seed-campero'    },
    { nombre: 'Dana',    empresaId: 'seed-burgerking' },
    { nombre: 'Susana',  empresaId: 'seed-zara'       },
];

const USUARIOS_PRUEBA = [
    // --- 4 usuarios genéricos ---
    {
        correo: 'admin.cuponera@test.com',
        password: 'Test1234!',
        datos: {
            nombre: 'Admin', apellido: 'Cuponera',
            correo: 'admin.cuponera@test.com',
            role: 'admin_cuponera',
            telefono: '70000001', dui: '00000001-1', direccion: 'San Salvador',
            cupones: [], photoURL: null,
        },
    },
    {
        correo: 'admin.empresa@test.com',
        password: 'Test1234!',
        datos: {
            nombre: 'Admin', apellido: 'Empresa',
            correo: 'admin.empresa@test.com',
            role: 'admin_empresa', empresaId: 'seed-siman',
            telefono: '70000002', dui: '00000002-2', direccion: 'Santa Ana',
            cupones: [], photoURL: null,
        },
    },
    {
        correo: 'empleado@test.com',
        password: 'Test1234!',
        datos: {
            nombre: 'Carlos', apellido: 'Empleado',
            correo: 'empleado@test.com',
            role: 'empleado', empresaId: 'seed-siman',
            telefono: '70000003', dui: '00000003-3', direccion: 'San Miguel',
            cupones: [], photoURL: null,
        },
    },
    {
        correo: 'cliente@test.com',
        password: 'Test1234!',
        datos: {
            nombre: 'María', apellido: 'Cliente',
            correo: 'cliente@test.com',
            role: 'cliente',
            telefono: '70000004', dui: '00000004-4', direccion: 'Soyapango',
            cupones: [], photoURL: null,
        },
    },
    // --- 15 usuarios del equipo (nombre.rol@test.com) ---
    ..._EQUIPO.flatMap(({ nombre, empresaId }) => {
        const n = nombre.toLowerCase();
        return [
            {
                correo: `${n}.cliente@test.com`,
                password: 'Test1234!',
                datos: {
                    nombre, apellido: 'Cliente',
                    correo: `${n}.cliente@test.com`,
                    role: 'cliente',
                    telefono: '70000000', dui: '00000000-0', direccion: 'San Salvador',
                    cupones: [], photoURL: null,
                },
            },
            {
                correo: `${n}.admin-empresa@test.com`,
                password: 'Test1234!',
                datos: {
                    nombre, apellido: 'Admin Empresa',
                    correo: `${n}.admin-empresa@test.com`,
                    role: 'admin_empresa', empresaId,
                    telefono: '70000000', dui: '00000000-0', direccion: 'San Salvador',
                    cupones: [], photoURL: null,
                },
            },
            {
                correo: `${n}.admin@test.com`,
                password: 'Test1234!',
                datos: {
                    nombre, apellido: 'Admin',
                    correo: `${n}.admin@test.com`,
                    role: 'admin_cuponera',
                    telefono: '70000000', dui: '00000000-0', direccion: 'San Salvador',
                    cupones: [], photoURL: null,
                },
            },
        ];
    }),
];

/**
 * Crea los 4 usuarios de prueba en Firebase Auth usando la app auxiliar
 * (sin cambiar la sesión principal) y crea sus documentos en Firestore
 * usando la sesión del super admin.
 */
export const seedUsuarios = async () => {
    const resultados = [];
    const auxAuth = getSeedAuth();

    for (const usuario of USUARIOS_PRUEBA) {
        try {
            let uid;

            try {
                const cred = await createUserWithEmailAndPassword(auxAuth, usuario.correo, usuario.password);
                uid = cred.user.uid;
            } catch (authErr) {
                if (authErr.code === 'auth/email-already-in-use') {
                    // Ya existe en Auth -obtener el UID iniciando sesión en la app auxiliar
                    const cred = await signInWithEmailAndPassword(auxAuth, usuario.correo, usuario.password);
                    uid = cred.user.uid;
                } else {
                    throw authErr;
                }
            }

            // Crear/actualizar doc en Firestore con la sesión del super admin
            await setDoc(doc(db, 'usuarios', uid), {
                uid,
                ...usuario.datos,
                isSeed: true,
                createdAt: serverTimestamp(),
            });

            resultados.push({ correo: usuario.correo, estado: 'ok', uid });
        } catch (error) {
            resultados.push({ correo: usuario.correo, estado: 'error', detalle: error.message });
        }
    }

    // Limpiar sesión auxiliar
    try { await auxSignOut(auxAuth); } catch (_) { /* ignorar */ }

    return resultados;
};

// =============================================================================
// EMPLEADOS DE PRUEBA (solo Firestore, sin cuenta Auth)
// =============================================================================

const EMPLEADOS_PRUEBA = [
    { nombre: 'Laura',   apellido: 'Martínez',  correo: 'laura.martinez@seed-siman.com',    empresaId: 'seed-siman' },
    { nombre: 'Roberto', apellido: 'Hernández', correo: 'roberto.hernandez@seed-siman.com', empresaId: 'seed-siman' },
    { nombre: 'Diana',   apellido: 'López',     correo: 'diana.lopez@seed-siman.com',       empresaId: 'seed-siman' },
    { nombre: 'Kevin',   apellido: 'Flores',    correo: 'kevin.flores@seed-pizzahut.com',   empresaId: 'seed-pizzahut' },
    { nombre: 'Sofía',   apellido: 'Ramírez',   correo: 'sofia.ramirez@seed-campero.com',   empresaId: 'seed-campero' },
];

export const seedEmpleados = async () => {
    const resultados = [];

    for (const emp of EMPLEADOS_PRUEBA) {
        try {
            const ref = await addDoc(collection(db, 'usuarios'), {
                nombre: emp.nombre, apellido: emp.apellido,
                correo: emp.correo, role: 'empleado',
                empresaId: emp.empresaId,
                mustChangePass: false,
                dui: '', telefono: '', direccion: '',
                cupones: [], photoURL: null,
                isSeed: true,
                createdAt: serverTimestamp(),
            });
            resultados.push({ nombre: `${emp.nombre} ${emp.apellido}`, id: ref.id, estado: 'ok' });
        } catch (error) {
            resultados.push({ nombre: `${emp.nombre} ${emp.apellido}`, estado: 'error', detalle: error.message });
        }
    }

    return resultados;
};

// =============================================================================
// EMPRESAS DE PRUEBA
// =============================================================================

const EMPRESAS_SEED = [
    { id: 'seed-siman',      nombre: 'Siman',         rubro: 'clothing',       email: 'contacto@siman.com.sv',   telefono: '2222-3333', sitio_web: 'https://www.siman.com',       logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Almacenes_Siman_logo.svg/320px-Almacenes_Siman_logo.svg.png' },
    { id: 'seed-pizzahut',   nombre: 'Pizza Hut',     rubro: 'restaurant',     email: 'info@pizzahut.com.sv',    telefono: '2264-4444', sitio_web: 'https://www.pizzahut.com',    logo: 'https://logo.clearbit.com/pizzahut.com' },
    { id: 'seed-campero',    nombre: 'Pollo Campero', rubro: 'restaurant',     email: 'info@campero.com',        telefono: '2263-5555', sitio_web: 'https://www.campero.com',     logo: 'https://logo.clearbit.com/campero.com' },
    { id: 'seed-burgerking', nombre: 'Burger King',   rubro: 'restaurant',     email: 'info@burgerking.com.sv',  telefono: '2284-6666', sitio_web: 'https://www.burgerking.com', logo: 'https://logo.clearbit.com/burgerking.com' },
    { id: 'seed-cinepolis',  nombre: 'Cinépolis',     rubro: 'entertainment',  email: 'atencion@cinepolis.com',  telefono: '2278-7777', sitio_web: 'https://www.cinepolis.com',  logo: 'https://logo.clearbit.com/cinepolis.com' },
    { id: 'seed-petcenter',  nombre: 'PetCenter',     rubro: 'veterinary',     email: 'info@petcenter.com.sv',   telefono: '2221-8888', sitio_web: 'https://www.petcenter.com.sv', logo: null },
    { id: 'seed-subway',     nombre: 'Subway',        rubro: 'restaurant',     email: 'sv@subway.com',           telefono: '2222-9999', sitio_web: 'https://www.subway.com',     logo: 'https://logo.clearbit.com/subway.com' },
    { id: 'seed-kfc',        nombre: 'KFC',           rubro: 'restaurant',     email: 'sv@kfc.com',              telefono: '2280-1111', sitio_web: 'https://www.kfc.com',        logo: 'https://logo.clearbit.com/kfc.com' },
    { id: 'seed-zara',       nombre: 'Zara',          rubro: 'clothing',       email: 'sv@zara.com',             telefono: '2280-2222', sitio_web: 'https://www.zara.com',       logo: 'https://logo.clearbit.com/zara.com' },
    { id: 'seed-starbucks',  nombre: 'Starbucks',     rubro: 'restaurant',     email: 'sv@starbucks.com',        telefono: '2280-3333', sitio_web: 'https://www.starbucks.com', logo: 'https://logo.clearbit.com/starbucks.com' },
];

export const seedEmpresas = async () => {
    const resultados = [];

    for (const { id, ...datos } of EMPRESAS_SEED) {
        try {
            await setDoc(doc(db, 'empresas', id), {
                ...datos, status: 'activa', isSeed: true,
                createdAt: serverTimestamp(),
            });
            resultados.push({ nombre: datos.nombre, id, estado: 'ok' });
        } catch (error) {
            resultados.push({ nombre: datos.nombre, estado: 'error', detalle: error.message });
        }
    }

    return resultados;
};

// =============================================================================
// OFERTAS DE PRUEBA
// =============================================================================

const ahora  = new Date();
const hace30 = new Date(ahora); hace30.setDate(ahora.getDate() - 30);
const hace10 = new Date(ahora); hace10.setDate(ahora.getDate() - 10);
const en7    = new Date(ahora); en7.setDate(ahora.getDate() + 7);
const en30   = new Date(ahora); en30.setDate(ahora.getDate() + 30);

const OFERTAS_ESTADOS = [
    // --- En espera (para demo de aprobación: fechas activas para que aparezcan en home al aprobar) ---
    { titulo: 'SEED - 30% en calzado deportivo',     descripcion: 'Descuento en toda la línea de calzado deportivo en sucursales Siman',       descuento: 30, tipo: 'porcentaje', costo_cupon: 5,  cantidadCupones: 20, cuponesGenerados: 0,  empresa_id: 'seed-siman',      rubro: 'clothing',      estado: 'en_espera', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - $8 en compras +$40 Siman',     descripcion: 'Presentá tu cupón en caja y recibí $8 de descuento en compras mayores a $40', descuento: 8, tipo: 'monto',     costo_cupon: 3,  cantidadCupones: 30, cuponesGenerados: 0,  empresa_id: 'seed-siman',      rubro: 'clothing',      estado: 'en_espera', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - Combo Campero + refresco free', descripcion: 'Llevate un refresco grande gratis con la compra de cualquier combo',         descuento: 20, tipo: 'porcentaje', costo_cupon: 4,  cantidadCupones: 50, cuponesGenerados: 0,  empresa_id: 'seed-campero',    rubro: 'restaurant',    estado: 'en_espera', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - 35% nueva colección Zara',     descripcion: 'Descuento en prendas seleccionadas de la nueva colección primavera',         descuento: 35, tipo: 'porcentaje', costo_cupon: 7,  cantidadCupones: 25, cuponesGenerados: 0,  empresa_id: 'seed-zara',       rubro: 'clothing',      estado: 'en_espera', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - Entrada Cinépolis 2×1',        descripcion: '2 entradas al precio de 1 en funciones de lunes a miércoles',               descuento: 50, tipo: 'porcentaje', costo_cupon: 5,  cantidadCupones: 40, cuponesGenerados: 0,  empresa_id: 'seed-cinepolis',  rubro: 'entertainment', estado: 'en_espera', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    // --- Otros estados (referencia) ---
    { titulo: 'SEED - Menú ejecutivo aprobado',       descripcion: 'Aplica de lunes a viernes',      descuento: 15, tipo: 'monto',      costo_cupon: 3,  cantidadCupones: 50, cuponesGenerados: 12, empresa_id: 'seed-pizzahut', rubro: 'restaurant',     estado: 'aprobada',   fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - 2×1 cine (activa)',            descripcion: 'Fines de semana',                descuento: 50, tipo: 'porcentaje', costo_cupon: 8,  cantidadCupones: 30, cuponesGenerados: 30, empresa_id: 'seed-cinepolis', rubro: 'entertainment', estado: 'activa',     fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en7) },
    { titulo: 'SEED - Consulta vet. (pasada)',        descripcion: 'Oferta vencida',                 descuento: 100,tipo: 'porcentaje', costo_cupon: 0,  cantidadCupones: 10, cuponesGenerados: 10, empresa_id: 'seed-petcenter', rubro: 'veterinary',    estado: 'pasada',     fecha_inicio: Timestamp.fromDate(hace30), fecha_fin: Timestamp.fromDate(hace10) },
    { titulo: 'SEED - Ropa temporada (rechazada)',    descripcion: 'Rechazada por imágenes',         descuento: 40, tipo: 'porcentaje', costo_cupon: 6,  cantidadCupones: 25, cuponesGenerados: 0,  empresa_id: 'seed-zara',     rubro: 'clothing',      estado: 'rechazada',  motivo_rechazo: 'Las imágenes no cumplen los requisitos mínimos de calidad.', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - Pizza descartada',             descripcion: 'Descartada por la empresa',      descuento: 20, tipo: 'porcentaje', costo_cupon: 4,  cantidadCupones: 15, cuponesGenerados: 0,  empresa_id: 'seed-pizzahut', rubro: 'restaurant',    estado: 'descartada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
];

const OFERTAS_ACTIVAS = [
    { titulo: 'SEED - 20% en ropa Siman',            descripcion: 'Aplica en toda la ropa de temporada en cualquier sucursal Siman',           descuento: 20, tipo: 'porcentaje', costo_cupon: 5,  cantidadCupones: 100, cuponesGenerados: 12, empresa_id: 'seed-siman',      rubro: 'clothing',      estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - $15 en compras +$60 Siman',    descripcion: 'Descuento automático en caja al presentar tu cupón en Siman',               descuento: 15, tipo: 'monto',      costo_cupon: 3,  cantidadCupones: 80,  cuponesGenerados: 20, empresa_id: 'seed-siman',      rubro: 'clothing',      estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - 2×1 pizza personal martes',    descripcion: 'Pide una pizza personal y llévate otra gratis todos los martes',           descuento: 50, tipo: 'porcentaje', costo_cupon: 4,  cantidadCupones: 60,  cuponesGenerados: 18, empresa_id: 'seed-pizzahut',   rubro: 'restaurant',    estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - $5 en pizza familiar PH',      descripcion: 'Válido en cualquier pizza familiar del menú regular',                       descuento: 5,  tipo: 'monto',      costo_cupon: 2,  cantidadCupones: 50,  cuponesGenerados: 8,  empresa_id: 'seed-pizzahut',   rubro: 'restaurant',    estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en7) },
    { titulo: 'SEED - Combo Campero 15% off',        descripcion: 'Descuento en cualquier combo del menú en todas las sucursales del país',    descuento: 15, tipo: 'porcentaje', costo_cupon: 3,  cantidadCupones: 120, cuponesGenerados: 35, empresa_id: 'seed-campero',    rubro: 'restaurant',    estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - Pollo gratis cumpleaños',      descripcion: 'Presenta tu DUI y recibe una pieza de pollo gratis en tu cumpleaños',      descuento: 100,tipo: 'porcentaje', costo_cupon: 0,  cantidadCupones: 200, cuponesGenerados: 45, empresa_id: 'seed-campero',    rubro: 'restaurant',    estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - Whopper a mitad de precio',    descripcion: '50% de descuento en Whopper regular cualquier día de la semana',           descuento: 50, tipo: 'porcentaje', costo_cupon: 2,  cantidadCupones: 75,  cuponesGenerados: 20, empresa_id: 'seed-burgerking', rubro: 'restaurant',    estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en7) },
    { titulo: 'SEED - Agrandado gratis combo BK',    descripcion: 'Agrandá tu combo sin costo adicional en cualquier Burger King',            descuento: 0,  tipo: 'porcentaje', costo_cupon: 1,  cantidadCupones: 90,  cuponesGenerados: 30, empresa_id: 'seed-burgerking', rubro: 'restaurant',    estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - Entrada Cinépolis $4',         descripcion: 'Cualquier función estándar de lunes a jueves en Cinépolis',                descuento: 30, tipo: 'porcentaje', costo_cupon: 4,  cantidadCupones: 40,  cuponesGenerados: 10, empresa_id: 'seed-cinepolis',  rubro: 'entertainment', estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - 2×1 palomitas Cinépolis',      descripcion: 'Compra una palomita grande y llévate otra gratis en cualquier función',    descuento: 50, tipo: 'porcentaje', costo_cupon: 3,  cantidadCupones: 50,  cuponesGenerados: 5,  empresa_id: 'seed-cinepolis',  rubro: 'entertainment', estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en7) },
    { titulo: 'SEED - Consulta vet. 30% off',        descripcion: 'Descuento en consulta general para cualquier mascota en PetCenter',        descuento: 30, tipo: 'porcentaje', costo_cupon: 5,  cantidadCupones: 30,  cuponesGenerados: 8,  empresa_id: 'seed-petcenter',  rubro: 'veterinary',    estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - $10 alimento mascotas',        descripcion: 'Aplica en cualquier marca de alimento para perros o gatos +$25',          descuento: 10, tipo: 'monto',      costo_cupon: 3,  cantidadCupones: 45,  cuponesGenerados: 12, empresa_id: 'seed-petcenter',  rubro: 'veterinary',    estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - Sub del día Subway $4.99',     descripcion: 'Sabores del día con bebida mediana incluida en cualquier Subway',          descuento: 25, tipo: 'porcentaje', costo_cupon: 2,  cantidadCupones: 60,  cuponesGenerados: 22, empresa_id: 'seed-subway',     rubro: 'restaurant',    estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - Bucket KFC 20% off',           descripcion: 'Descuento en el bucket familiar de 12 piezas en cualquier KFC del país',  descuento: 20, tipo: 'porcentaje', costo_cupon: 4,  cantidadCupones: 65,  cuponesGenerados: 18, empresa_id: 'seed-kfc',        rubro: 'restaurant',    estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - Zinger gratis al comprar 2',   descripcion: 'Lleva 3 Zingers al precio de 2, válido de lunes a viernes en KFC',        descuento: 33, tipo: 'porcentaje', costo_cupon: 3,  cantidadCupones: 40,  cuponesGenerados: 10, empresa_id: 'seed-kfc',        rubro: 'restaurant',    estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en7) },
    { titulo: 'SEED - 25% nueva colección Zara',     descripcion: 'Descuento en prendas de la nueva colección damas en Zara Multiplaza',     descuento: 25, tipo: 'porcentaje', costo_cupon: 6,  cantidadCupones: 55,  cuponesGenerados: 14, empresa_id: 'seed-zara',       rubro: 'clothing',      estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - $20 en compras +$100 Zara',    descripcion: 'Aplica en tienda física en El Salvador, no válido en sale',              descuento: 20, tipo: 'monto',      costo_cupon: 4,  cantidadCupones: 35,  cuponesGenerados: 7,  empresa_id: 'seed-zara',       rubro: 'clothing',      estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - 2×1 frapuccino Starbucks',     descripcion: 'Pide cualquier frapuccino y recibe otro del mismo tamaño sin costo',     descuento: 50, tipo: 'porcentaje', costo_cupon: 4,  cantidadCupones: 70,  cuponesGenerados: 25, empresa_id: 'seed-starbucks',  rubro: 'restaurant',    estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30) },
    { titulo: 'SEED - $3 bebida caliente Starbucks', descripcion: 'Aplica en bebidas calientes de cualquier tamaño en todas las sucursales', descuento: 3,  tipo: 'monto',      costo_cupon: 2,  cantidadCupones: 80,  cuponesGenerados: 30, empresa_id: 'seed-starbucks',  rubro: 'restaurant',    estado: 'aprobada', fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en7) },
];

export const seedOfertas = async () => {
    const resultados = [];

    for (const oferta of [...OFERTAS_ESTADOS, ...OFERTAS_ACTIVAS]) {
        try {
            const ref = await addDoc(collection(db, 'ofertas'), {
                ...oferta,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            resultados.push({ titulo: oferta.titulo, estado: oferta.estado, id: ref.id, resultado: 'ok' });
        } catch (error) {
            resultados.push({ titulo: oferta.titulo, resultado: 'error', detalle: error.message });
        }
    }

    return resultados;
};

// =============================================================================
// CUPONES DE PRUEBA (para cliente@test.com)
// Se autentica en la app auxiliar como el cliente para satisfacer las reglas
// de Firestore, sin afectar la sesión principal del super admin.
// =============================================================================

export const seedCupones = async () => {
    const resultados = [];
    const auxAuth = getSeedAuth();
    const auxDb   = getSeedDb();

    try {
        // Iniciar sesión como cliente en la app auxiliar
        const cred = await signInWithEmailAndPassword(auxAuth, 'cliente@test.com', 'Test1234!');
        const clienteUid = cred.user.uid;

        // Buscar 5 ofertas SEED aprobadas (filtro client-side para evitar índice compuesto)
        const snapAll = await getDocs(collection(auxDb, 'ofertas'));
        const ofertasParaCupones = snapAll.docs
            .filter(d => {
                const data = d.data();
                return data.estado === 'aprobada' && data.titulo?.startsWith('SEED');
            })
            .slice(0, 5);

        if (ofertasParaCupones.length === 0) {
            return [{ estado: 'sin_ofertas', nota: 'No hay ofertas SEED aprobadas. Ejecuta seedOfertas primero.' }];
        }
        const usuarioRef = doc(auxDb, 'usuarios', clienteUid);

        for (let i = 0; i < ofertasParaCupones.length; i++) {
            const ofertaDoc  = ofertasParaCupones[i];
            const ofertaData = ofertaDoc.data();
            const ofertaId   = ofertaDoc.id;
            const esCanjeado = i === ofertasParaCupones.length - 1;

            try {
                await runTransaction(auxDb, async (tx) => {
                    const usuarioSnap = await tx.get(usuarioRef);
                    const cuponesList = usuarioSnap.exists() ? (usuarioSnap.data()?.cupones || []) : [];

                    const cuponRef = doc(collection(auxDb, 'cupones'));
                    const codigo   = `SEED-${ofertaId.slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

                    tx.set(cuponRef, {
                        codigo,
                        oferta_id:   ofertaId,
                        usuario_id:  clienteUid,
                        estado:      esCanjeado ? 'canjeado' : 'asignado',
                        costo_cupon: ofertaData.costo_cupon || 0,
                        createdAt:   serverTimestamp(),
                        asignadoEn:  serverTimestamp(),
                        canjeadoEn:  esCanjeado ? serverTimestamp() : null,
                    });

                    tx.update(doc(auxDb, 'ofertas', ofertaId), { cuponesGenerados: increment(1) });
                    tx.set(usuarioRef, { cupones: [...cuponesList, cuponRef.id] }, { merge: true });
                });

                resultados.push({
                    oferta:    ofertaData.titulo,
                    estado:    esCanjeado ? 'canjeado' : 'asignado',
                    resultado: 'ok',
                });
            } catch (txErr) {
                resultados.push({ oferta: ofertaData.titulo, resultado: 'error', detalle: txErr.message });
            }
        }
    } catch (error) {
        resultados.push({ estado: 'error', detalle: error.message });
    } finally {
        try { await auxSignOut(auxAuth); } catch (_) { /* ignorar */ }
    }

    return resultados;
};

// =============================================================================
// CLIENTES DE PRUEBA (solo Firestore, sin cuenta Auth -para poblar el panel admin)
// =============================================================================

const NOMBRES_F  = ['Ana', 'María', 'Laura', 'Sofía', 'Valentina', 'Isabella', 'Gabriela', 'Daniela', 'Camila', 'Andrea', 'Patricia', 'Verónica', 'Lucía', 'Fernanda', 'Karla'];
const NOMBRES_M  = ['Carlos', 'José', 'Miguel', 'Luis', 'Juan', 'Roberto', 'Fernando', 'Diego', 'Alejandro', 'Ricardo', 'Sergio', 'Óscar', 'Marcos', 'Rodrigo', 'Andrés'];
const APELLIDOS1 = ['García', 'Rodríguez', 'López', 'Martínez', 'González', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Morales', 'Cruz', 'Reyes'];
const APELLIDOS2 = ['Vásquez', 'Mejía', 'Aguilar', 'Castro', 'Gutiérrez', 'Ortiz', 'Ramos', 'Ruiz', 'Núñez', 'Vargas', 'Fuentes', 'Mendoza', 'Osorio', 'Pineda', 'Salazar'];
const CIUDADES   = ['San Salvador', 'Santa Ana', 'San Miguel', 'Soyapango', 'Mejicanos', 'Apopa', 'Ciudad Delgado', 'Ilopango', 'Antiguo Cuscatlán', 'San Marcos', 'Cuscatancingo', 'Usulután', 'Zacatecoluca', 'San Vicente', 'La Libertad'];

export const seedClientes = async () => {
    const resultados = [];
    const total = 50;

    for (let i = 1; i <= total; i++) {
        const esFemenino = i % 3 !== 0;
        const nombresPool = esFemenino ? NOMBRES_F : NOMBRES_M;
        const nombre   = nombresPool[i % nombresPool.length];
        const apellido = `${APELLIDOS1[i % APELLIDOS1.length]} ${APELLIDOS2[(i * 3) % APELLIDOS2.length]}`;
        const ciudad   = CIUDADES[i % CIUDADES.length];

        const duiBase = String(10000000 + i * 13).padStart(8, '0');
        const duiDig  = i % 10;
        const tel     = `7${String(1000000 + i * 7).slice(0, 7)}`;

        try {
            await addDoc(collection(db, 'usuarios'), {
                nombre,
                apellido,
                correo:   `cliente${i}@seed.test`,
                role:     'cliente',
                telefono: tel,
                dui:      `${duiBase}-${duiDig}`,
                direccion: ciudad,
                cupones:  [],
                photoURL: null,
                isSeed:   true,
                createdAt: serverTimestamp(),
            });
            resultados.push({ cliente: `cliente${i}`, nombre: `${nombre} ${apellido}`, estado: 'ok' });
        } catch (error) {
            resultados.push({ cliente: `cliente${i}`, estado: 'error', detalle: error.message });
        }
    }

    return resultados;
};

// =============================================================================
// HISTORIAL DE ESTADOS
// =============================================================================

export const seedHistorial = async (ofertaAprobadaId, adminId = 'seed-admin') => {
    const entradas = [
        { ofertaId: ofertaAprobadaId, estadoAnterior: null,        estadoNuevo: 'en_espera', razonRechazo: null, cambiado_por: adminId, timestamp: serverTimestamp() },
        { ofertaId: ofertaAprobadaId, estadoAnterior: 'en_espera', estadoNuevo: 'aprobada',  razonRechazo: null, cambiado_por: adminId, timestamp: serverTimestamp() },
    ];
    const resultados = [];

    for (const entrada of entradas) {
        try {
            const ref = await addDoc(collection(db, 'historial_estados_oferta'), entrada);
            resultados.push({ transicion: `${entrada.estadoAnterior} - ${entrada.estadoNuevo}`, id: ref.id, resultado: 'ok' });
        } catch (error) {
            resultados.push({ transicion: `${entrada.estadoAnterior} - ${entrada.estadoNuevo}`, resultado: 'error', detalle: error.message });
        }
    }

    return resultados;
};

// =============================================================================
// LIMPIEZA TOTAL
// Borra TODO excepto el documento del super admin en Firestore.
// La sesión principal NO se modifica -el super admin sigue autenticado.
// Las cuentas de Firebase Auth de los usuarios de prueba NO se eliminan
// (hacerlo requiere Admin SDK; borrarlas manualmente en la consola de Firebase).
// =============================================================================

export const limpiarSeed = async () => {
    const resultados = [];

    // El llamador debe ser el super admin -su UID se usa para preservar su doc
    const superAdminUid = auth.currentUser?.uid;
    if (!superAdminUid) {
        return [{ paso: 'error', estado: 'Sin sesión activa. Inicia sesión como super admin antes de limpiar.' }];
    }

    // 1. Borrar todas las colecciones completamente
    const colecciones = ['cupones', 'historial_estados_oferta', 'ofertas', 'empresas'];
    for (const coleccion of colecciones) {
        try {
            const snap = await getDocs(collection(db, coleccion));
            await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
            resultados.push({ coleccion, eliminados: snap.size, estado: 'ok' });
        } catch (error) {
            resultados.push({ coleccion, estado: 'error', detalle: error.message });
        }
    }

    // 2. Borrar todos los usuarios excepto el super admin.
    // Se identifica el super admin por UID Y por isSuperAdmin:true para mayor seguridad,
    // por si el UID del documento difiere del auth.currentUser.uid por alguna razón.
    try {
        const snap     = await getDocs(collection(db, 'usuarios'));
        const toDelete = snap.docs.filter(
            d => d.id !== superAdminUid && d.data().isSuperAdmin !== true,
        );

        let eliminados = 0;
        const errores  = [];

        for (const d of toDelete) {
            try {
                await deleteDoc(d.ref);
                eliminados++;
            } catch (e) {
                errores.push({ id: d.id, role: d.data().role, detalle: e.message });
            }
        }

        resultados.push({
            coleccion:   'usuarios',
            eliminados,
            preservados: snap.size - eliminados,
            estado:      errores.length === 0 ? 'ok' : 'parcial',
            ...(errores.length > 0 && { errores }),
        });
    } catch (error) {
        resultados.push({ coleccion: 'usuarios', estado: 'error', detalle: error.message });
    }

    resultados.push({
        paso:   'fin',
        estado: 'Limpieza completa. Sesión de super admin mantenida.',
        nota:   'Las cuentas de Firebase Auth de los usuarios de prueba no se eliminan automáticamente.',
    });

    return resultados;
};
