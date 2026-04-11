/**
 * seedData.js
 * Script para poblar Firestore con datos de prueba.
 * Solo debe ejecutarse en desarrollo - nunca en producción.
 *
 * Cubre:
 *  - 4 usuarios de prueba (uno por rol) en Firebase Auth + Firestore
 *  - Empleados vinculados a emp001 y emp002
 *  - Empresas de prueba con marcas reconocidas
 *  - Ofertas activas variadas (15+) y 6 ofertas en todos los estados
 *  - Historial de cambios de estado
 */

import {
    collection,
    doc,
    setDoc,
    addDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

// --- Usuarios de prueba -------------------------------------------------------

const USUARIOS_PRUEBA = [
    {
        correo: 'admin.cuponera@test.com',
        password: 'Test1234!',
        datos: {
            nombre: 'Admin',
            apellido: 'Cuponera',
            correo: 'admin.cuponera@test.com',
            role: 'admin_cuponera',
            telefono: '70000001',
            dui: '00000001-1',
            direccion: 'San Salvador',
            cupones: [],
            photoURL: null,
        },
    },
    {
        correo: 'admin.empresa@test.com',
        password: 'Test1234!',
        datos: {
            nombre: 'Admin',
            apellido: 'Empresa',
            correo: 'admin.empresa@test.com',
            role: 'admin_empresa',
            empresaId: 'emp001',
            telefono: '70000002',
            dui: '00000002-2',
            direccion: 'Santa Ana',
            cupones: [],
            photoURL: null,
        },
    },
    {
        correo: 'empleado@test.com',
        password: 'Test1234!',
        datos: {
            nombre: 'Carlos',
            apellido: 'Empleado',
            correo: 'empleado@test.com',
            role: 'empleado',
            empresaId: 'emp001',
            telefono: '70000003',
            dui: '00000003-3',
            direccion: 'San Miguel',
            cupones: [],
            photoURL: null,
        },
    },
    {
        correo: 'cliente@test.com',
        password: 'Test1234!',
        datos: {
            nombre: 'María',
            apellido: 'Cliente',
            correo: 'cliente@test.com',
            role: 'cliente',
            telefono: '70000004',
            dui: '00000004-4',
            direccion: 'Soyapango',
            cupones: [],
            photoURL: null,
        },
    },
];

/**
 * Crea los 4 usuarios de prueba en Firebase Auth y sus documentos en Firestore.
 * Si un usuario ya existe, lo omite sin lanzar error.
 */
export const seedUsuarios = async () => {
    const resultados = [];

    for (const usuario of USUARIOS_PRUEBA) {
        try {
            const credencial = await createUserWithEmailAndPassword(
                auth,
                usuario.correo,
                usuario.password
            );

            await setDoc(doc(db, 'usuarios', credencial.user.uid), {
                uid: credencial.user.uid,
                ...usuario.datos,
                createdAt: serverTimestamp(),
            });

            resultados.push({ correo: usuario.correo, estado: 'creado', uid: credencial.user.uid });
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                resultados.push({ correo: usuario.correo, estado: 'ya existía' });
            } else {
                resultados.push({ correo: usuario.correo, estado: 'error', detalle: error.message });
            }
        }
    }

    return resultados;
};

// --- Empleados de prueba ------------------------------------------------------

const EMPLEADOS_PRUEBA = [
    { nombre: 'Laura',   apellido: 'Martínez',  correo: 'laura.martinez@emp001.com',    empresaId: 'emp001' },
    { nombre: 'Roberto', apellido: 'Hernández', correo: 'roberto.hernandez@emp001.com', empresaId: 'emp001' },
    { nombre: 'Diana',   apellido: 'López',     correo: 'diana.lopez@emp001.com',       empresaId: 'emp001' },
    { nombre: 'Kevin',   apellido: 'Flores',    correo: 'kevin.flores@emp002.com',      empresaId: 'emp002' },
    { nombre: 'Sofía',   apellido: 'Ramírez',   correo: 'sofia.ramirez@emp002.com',     empresaId: 'emp002' },
];

export const seedEmpleados = async () => {
    const resultados = [];

    for (const empleado of EMPLEADOS_PRUEBA) {
        try {
            const ref = await addDoc(collection(db, 'usuarios'), {
                nombre:         empleado.nombre,
                apellido:       empleado.apellido,
                correo:         empleado.correo,
                role:           'empleado',
                empresaId:      empleado.empresaId,
                mustChangePass: false,
                dui:            '',
                telefono:       '',
                direccion:      '',
                cupones:        [],
                photoURL:       null,
                createdAt:      serverTimestamp(),
            });
            resultados.push({ nombre: `${empleado.nombre} ${empleado.apellido}`, id: ref.id, estado: 'creado' });
        } catch (error) {
            resultados.push({ nombre: `${empleado.nombre} ${empleado.apellido}`, estado: 'error', detalle: error.message });
        }
    }

    return resultados;
};

// --- Empresas de prueba -------------------------------------------------------

const EMPRESAS_SEED = [
    {
        id: 'seed-siman',
        nombre: 'Siman',
        rubro: 'clothing',
        email: 'contacto@siman.com.sv',
        telefono: '2222-3333',
        sitio_web: 'https://www.siman.com',
        status: 'activa',
        descripcion: 'La tienda departamental más grande de El Salvador',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Almacenes_Siman_logo.svg/320px-Almacenes_Siman_logo.svg.png',
        isSeed: true,
    },
    {
        id: 'seed-pizzahut',
        nombre: 'Pizza Hut',
        rubro: 'restaurant',
        email: 'info@pizzahut.com.sv',
        telefono: '2264-4444',
        sitio_web: 'https://www.pizzahut.com',
        status: 'activa',
        descripcion: 'Cadena de pizzerías internacional',
        logo: 'https://logo.clearbit.com/pizzahut.com',
        isSeed: true,
    },
    {
        id: 'seed-campero',
        nombre: 'Pollo Campero',
        rubro: 'restaurant',
        email: 'info@campero.com',
        telefono: '2263-5555',
        sitio_web: 'https://www.campero.com',
        status: 'activa',
        descripcion: 'Marca de pollo frito icónica de Centroamérica',
        logo: 'https://logo.clearbit.com/campero.com',
        isSeed: true,
    },
    {
        id: 'seed-burgerking',
        nombre: 'Burger King',
        rubro: 'restaurant',
        email: 'info@burgerking.com.sv',
        telefono: '2284-6666',
        sitio_web: 'https://www.burgerking.com',
        status: 'activa',
        descripcion: 'Cadena de hamburguesas internacional',
        logo: 'https://logo.clearbit.com/burgerking.com',
        isSeed: true,
    },
    {
        id: 'seed-cinepolis',
        nombre: 'Cinépolis',
        rubro: 'entertainment',
        email: 'atencion@cinepolis.com',
        telefono: '2278-7777',
        sitio_web: 'https://www.cinepolis.com',
        status: 'activa',
        descripcion: 'Cadena de cines con la mejor tecnología',
        logo: 'https://logo.clearbit.com/cinepolis.com',
        isSeed: true,
    },
    {
        id: 'seed-petcenter',
        nombre: 'PetCenter',
        rubro: 'veterinary',
        email: 'info@petcenter.com.sv',
        telefono: '2221-8888',
        sitio_web: 'https://www.petcenter.com.sv',
        status: 'activa',
        descripcion: 'Centro veterinario y tienda de mascotas',
        logo: null,
        isSeed: true,
    },
    {
        id: 'seed-subway',
        nombre: 'Subway',
        rubro: 'restaurant',
        email: 'sv@subway.com',
        telefono: '2222-9999',
        sitio_web: 'https://www.subway.com',
        status: 'activa',
        descripcion: 'Sándwiches frescos hechos al momento',
        logo: 'https://logo.clearbit.com/subway.com',
        isSeed: true,
    },
    {
        id: 'seed-kfc',
        nombre: 'KFC El Salvador',
        rubro: 'restaurant',
        email: 'sv@kfc.com',
        telefono: '2280-1111',
        sitio_web: 'https://www.kfc.com',
        status: 'activa',
        descripcion: 'El mejor pollo frito del mundo',
        logo: 'https://logo.clearbit.com/kfc.com',
        isSeed: true,
    },
    {
        id: 'seed-zara',
        nombre: 'Zara',
        rubro: 'clothing',
        email: 'sv@zara.com',
        telefono: '2280-2222',
        sitio_web: 'https://www.zara.com',
        status: 'activa',
        descripcion: 'Moda internacional para toda la familia',
        logo: 'https://logo.clearbit.com/zara.com',
        isSeed: true,
    },
    {
        id: 'seed-starbucks',
        nombre: 'Starbucks',
        rubro: 'restaurant',
        email: 'sv@starbucks.com',
        telefono: '2280-3333',
        sitio_web: 'https://www.starbucks.com',
        status: 'activa',
        descripcion: 'La mejor experiencia en café del mundo',
        logo: 'https://logo.clearbit.com/starbucks.com',
        isSeed: true,
    },
];

/**
 * Crea los documentos de empresa de prueba en Firestore.
 * Usa IDs fijos (seed-*) para poder limpiarlos fácilmente.
 */
export const seedEmpresas = async () => {
    const resultados = [];

    for (const empresa of EMPRESAS_SEED) {
        const { id, ...datos } = empresa;
        try {
            await setDoc(doc(db, 'empresas', id), {
                ...datos,
                createdAt: serverTimestamp(),
            });
            resultados.push({ nombre: empresa.nombre, id, estado: 'creada' });
        } catch (error) {
            resultados.push({ nombre: empresa.nombre, estado: 'error', detalle: error.message });
        }
    }

    return resultados;
};

// --- Fechas de referencia -----------------------------------------------------

const ahora = new Date();
const hace30 = new Date(ahora); hace30.setDate(ahora.getDate() - 30);
const hace10 = new Date(ahora); hace10.setDate(ahora.getDate() - 10);
const en7    = new Date(ahora); en7.setDate(ahora.getDate() + 7);
const en30   = new Date(ahora); en30.setDate(ahora.getDate() + 30);

// --- Ofertas en todos los estados (para probar flujo admin) -------------------

const OFERTAS_ESTADOS = [
    {
        titulo: 'SEED - 30% en calzado',
        descripcion: 'Descuento en toda la línea de calzado deportivo',
        descuento: 30,
        tipo: 'porcentaje',
        costo_cupon: 5,
        cantidadCupones: 20,
        cuponesGenerados: 0,
        empresa_id: 'emp001',
        rubro: 'clothing',
        estado: 'en_espera',
        fecha_inicio: Timestamp.fromDate(en7),
        fecha_fin: Timestamp.fromDate(en30),
    },
    {
        titulo: 'SEED - $15 en menú ejecutivo',
        descripcion: 'Aplica de lunes a viernes al mediodía',
        descuento: 15,
        tipo: 'monto',
        costo_cupon: 3,
        cantidadCupones: 50,
        cuponesGenerados: 12,
        empresa_id: 'emp002',
        rubro: 'restaurant',
        estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10),
        fecha_fin: Timestamp.fromDate(en30),
    },
    {
        titulo: 'SEED - 2×1 en entradas de cine',
        descripcion: 'Válido para funciones de fin de semana',
        descuento: 50,
        tipo: 'porcentaje',
        costo_cupon: 8,
        cantidadCupones: 30,
        cuponesGenerados: 30,
        empresa_id: 'emp003',
        rubro: 'entertainment',
        estado: 'activa',
        fecha_inicio: Timestamp.fromDate(hace10),
        fecha_fin: Timestamp.fromDate(en7),
    },
    {
        titulo: 'SEED - Consulta veterinaria gratis',
        descripcion: 'Oferta vencida, ya no está disponible',
        descuento: 100,
        tipo: 'porcentaje',
        costo_cupon: 0,
        cantidadCupones: 10,
        cuponesGenerados: 10,
        empresa_id: 'emp004',
        rubro: 'veterinary',
        estado: 'pasada',
        fecha_inicio: Timestamp.fromDate(hace30),
        fecha_fin: Timestamp.fromDate(hace10),
    },
    {
        titulo: 'SEED - 40% en ropa de temporada',
        descripcion: 'Rechazada por imágenes incorrectas',
        descuento: 40,
        tipo: 'porcentaje',
        costo_cupon: 6,
        cantidadCupones: 25,
        cuponesGenerados: 0,
        empresa_id: 'emp001',
        rubro: 'clothing',
        estado: 'rechazada',
        motivo_rechazo: 'Las imágenes adjuntas no cumplen con los requisitos de resolución mínima.',
        fecha_inicio: Timestamp.fromDate(en7),
        fecha_fin: Timestamp.fromDate(en30),
    },
    {
        titulo: 'SEED - Descuento en pizza familiar',
        descripcion: 'Descartada por la empresa antes de enviarse',
        descuento: 20,
        tipo: 'porcentaje',
        costo_cupon: 4,
        cantidadCupones: 15,
        cuponesGenerados: 0,
        empresa_id: 'emp002',
        rubro: 'restaurant',
        estado: 'descartada',
        fecha_inicio: Timestamp.fromDate(en7),
        fecha_fin: Timestamp.fromDate(en30),
    },
];

// --- Ofertas activas variadas (para poblar la página principal) ---------------

const OFERTAS_ACTIVAS = [
    // Siman
    {
        titulo: 'SEED - 20% en ropa de temporada',
        descripcion: 'Aplica en toda la ropa de temporada de damas y caballeros en cualquier sucursal Siman',
        descuento: 20, tipo: 'porcentaje', costo_cupon: 5,
        cantidadCupones: 100, cuponesGenerados: 12,
        empresa_id: 'seed-siman', rubro: 'clothing', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    {
        titulo: 'SEED - $15 en compras mayores a $60',
        descripcion: 'Descuento automático en caja al presentar tu cupón en cualquier tienda Siman',
        descuento: 15, tipo: 'monto', costo_cupon: 3,
        cantidadCupones: 80, cuponesGenerados: 20,
        empresa_id: 'seed-siman', rubro: 'clothing', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    // Pizza Hut
    {
        titulo: 'SEED - 2×1 en pizza personal los martes',
        descripcion: 'Pide una pizza personal y llévate otra gratis todos los martes en cualquier sucursal',
        descuento: 50, tipo: 'porcentaje', costo_cupon: 4,
        cantidadCupones: 60, cuponesGenerados: 18,
        empresa_id: 'seed-pizzahut', rubro: 'restaurant', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    {
        titulo: 'SEED - $5 de descuento en pizza familiar',
        descripcion: 'Válido en cualquier pizza familiar del menú regular, no aplica con otras promociones',
        descuento: 5, tipo: 'monto', costo_cupon: 2,
        cantidadCupones: 50, cuponesGenerados: 8,
        empresa_id: 'seed-pizzahut', rubro: 'restaurant', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en7),
    },
    // Pollo Campero
    {
        titulo: 'SEED - Combo Campero con 15% off',
        descripcion: 'Descuento en cualquier combo del menú en todas las sucursales del país',
        descuento: 15, tipo: 'porcentaje', costo_cupon: 3,
        cantidadCupones: 120, cuponesGenerados: 35,
        empresa_id: 'seed-campero', rubro: 'restaurant', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    {
        titulo: 'SEED - Pieza de pollo gratis en tu cumpleaños',
        descripcion: 'Presenta tu DUI y recibe una pieza de pollo gratis el día de tu cumpleaños',
        descuento: 100, tipo: 'porcentaje', costo_cupon: 0,
        cantidadCupones: 200, cuponesGenerados: 45,
        empresa_id: 'seed-campero', rubro: 'restaurant', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    // Burger King
    {
        titulo: 'SEED - Whopper a mitad de precio',
        descripcion: '50% de descuento en Whopper regular cualquier día de la semana en todas las sucursales BK',
        descuento: 50, tipo: 'porcentaje', costo_cupon: 2,
        cantidadCupones: 75, cuponesGenerados: 20,
        empresa_id: 'seed-burgerking', rubro: 'restaurant', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en7),
    },
    {
        titulo: 'SEED - Agrandado gratis en cualquier combo',
        descripcion: 'Agrandá tu combo sin costo adicional, aplica en bebida y papas en cualquier BK',
        descuento: 0, tipo: 'porcentaje', costo_cupon: 1,
        cantidadCupones: 90, cuponesGenerados: 30,
        empresa_id: 'seed-burgerking', rubro: 'restaurant', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    // Cinépolis
    {
        titulo: 'SEED - Entrada general a $4 de lunes a jueves',
        descripcion: 'Disfruta cualquier función en sala estándar de lunes a jueves en Cinépolis Multiplaza y Metrocentro',
        descuento: 30, tipo: 'porcentaje', costo_cupon: 4,
        cantidadCupones: 40, cuponesGenerados: 10,
        empresa_id: 'seed-cinepolis', rubro: 'entertainment', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    {
        titulo: 'SEED - 2×1 en palomitas grandes',
        descripcion: 'Compra una palomita grande y llévate otra gratis en cualquier función de Cinépolis',
        descuento: 50, tipo: 'porcentaje', costo_cupon: 3,
        cantidadCupones: 50, cuponesGenerados: 5,
        empresa_id: 'seed-cinepolis', rubro: 'entertainment', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en7),
    },
    // PetCenter
    {
        titulo: 'SEED - Consulta veterinaria con 30% off',
        descripcion: 'Descuento en consulta general para cualquier mascota, incluye diagnóstico básico',
        descuento: 30, tipo: 'porcentaje', costo_cupon: 5,
        cantidadCupones: 30, cuponesGenerados: 8,
        empresa_id: 'seed-petcenter', rubro: 'veterinary', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    {
        titulo: 'SEED - $10 en alimento para mascotas',
        descripcion: 'Aplica en cualquier marca de alimento para perros o gatos en compras mayores a $25',
        descuento: 10, tipo: 'monto', costo_cupon: 3,
        cantidadCupones: 45, cuponesGenerados: 12,
        empresa_id: 'seed-petcenter', rubro: 'veterinary', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    // Subway
    {
        titulo: 'SEED - Sub del día a $4.99 con bebida',
        descripcion: 'Elige entre los sabores del día con bebida mediana incluida en cualquier Subway',
        descuento: 25, tipo: 'porcentaje', costo_cupon: 2,
        cantidadCupones: 60, cuponesGenerados: 22,
        empresa_id: 'seed-subway', rubro: 'restaurant', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    // KFC
    {
        titulo: 'SEED - Bucket familiar KFC con 20% off',
        descripcion: 'Descuento en el bucket familiar de 12 piezas en cualquier KFC del país',
        descuento: 20, tipo: 'porcentaje', costo_cupon: 4,
        cantidadCupones: 65, cuponesGenerados: 18,
        empresa_id: 'seed-kfc', rubro: 'restaurant', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    {
        titulo: 'SEED - Sandwich Zinger gratis al comprar 2',
        descripcion: 'Lleva 3 Zingers al precio de 2, válido de lunes a viernes',
        descuento: 33, tipo: 'porcentaje', costo_cupon: 3,
        cantidadCupones: 40, cuponesGenerados: 10,
        empresa_id: 'seed-kfc', rubro: 'restaurant', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en7),
    },
    // Zara
    {
        titulo: 'SEED - 25% en nueva colección Zara',
        descripcion: 'Descuento en prendas de la nueva colección de damas en Zara Multiplaza',
        descuento: 25, tipo: 'porcentaje', costo_cupon: 6,
        cantidadCupones: 55, cuponesGenerados: 14,
        empresa_id: 'seed-zara', rubro: 'clothing', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    {
        titulo: 'SEED - $20 en compras mayores a $100 en Zara',
        descripcion: 'Aplica en tienda física en El Salvador, no válido en sale',
        descuento: 20, tipo: 'monto', costo_cupon: 4,
        cantidadCupones: 35, cuponesGenerados: 7,
        empresa_id: 'seed-zara', rubro: 'clothing', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    // Starbucks
    {
        titulo: 'SEED - 2×1 en bebidas frapuccino',
        descripcion: 'Pide cualquier frapuccino y recibe otro del mismo tamaño sin costo adicional',
        descuento: 50, tipo: 'porcentaje', costo_cupon: 4,
        cantidadCupones: 70, cuponesGenerados: 25,
        empresa_id: 'seed-starbucks', rubro: 'restaurant', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en30),
    },
    {
        titulo: 'SEED - $3 en cualquier bebida caliente Starbucks',
        descripcion: 'Aplica en bebidas calientes de cualquier tamaño en todas las sucursales de El Salvador',
        descuento: 3, tipo: 'monto', costo_cupon: 2,
        cantidadCupones: 80, cuponesGenerados: 30,
        empresa_id: 'seed-starbucks', rubro: 'restaurant', estado: 'aprobada',
        fecha_inicio: Timestamp.fromDate(hace10), fecha_fin: Timestamp.fromDate(en7),
    },
];

export const seedOfertas = async () => {
    const resultados = [];
    const todasLasOfertas = [...OFERTAS_ESTADOS, ...OFERTAS_ACTIVAS];

    for (const oferta of todasLasOfertas) {
        try {
            const ref = await addDoc(collection(db, 'ofertas'), {
                ...oferta,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            resultados.push({ titulo: oferta.titulo, estado: oferta.estado, id: ref.id, resultado: 'creada' });
        } catch (error) {
            resultados.push({ titulo: oferta.titulo, resultado: 'error', detalle: error.message });
        }
    }

    return resultados;
};

// --- Historial de estados -----------------------------------------------------

export const seedHistorial = async (ofertaAprobadaId, adminId = 'seed-admin') => {
    const entradas = [
        {
            ofertaId: ofertaAprobadaId,
            estadoAnterior: null,
            estadoNuevo: 'en_espera',
            razonRechazo: null,
            cambiado_por: adminId,
            timestamp: serverTimestamp(),
        },
        {
            ofertaId: ofertaAprobadaId,
            estadoAnterior: 'en_espera',
            estadoNuevo: 'aprobada',
            razonRechazo: null,
            cambiado_por: adminId,
            timestamp: serverTimestamp(),
        },
    ];

    const resultados = [];

    for (const entrada of entradas) {
        try {
            const ref = await addDoc(collection(db, 'historial_estados_oferta'), entrada);
            resultados.push({ transicion: `${entrada.estadoAnterior} - ${entrada.estadoNuevo}`, id: ref.id });
        } catch (error) {
            resultados.push({ transicion: `${entrada.estadoAnterior} - ${entrada.estadoNuevo}`, error: error.message });
        }
    }

    return resultados;
};

// --- Limpieza de datos de prueba ----------------------------------------------

const CORREOS_SEED = [
    'admin.cuponera@test.com',
    'admin.empresa@test.com',
    'empleado@test.com',
    'cliente@test.com',
    'laura.martinez@emp001.com',
    'roberto.hernandez@emp001.com',
    'diana.lopez@emp001.com',
    'kevin.flores@emp002.com',
    'sofia.ramirez@emp002.com',
];

const IDS_EMPRESAS_SEED = EMPRESAS_SEED.map(e => e.id);

export const limpiarSeed = async () => {
    const resultados = [];

    // 1. Ofertas cuyo título empieza con 'SEED'
    try {
        const snap = await getDocs(query(
            collection(db, 'ofertas'),
            where('titulo', '>=', 'SEED'),
            where('titulo', '<=', 'SEED\uf8ff')
        ));
        await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'ofertas', d.id))));
        resultados.push({ coleccion: 'ofertas', eliminados: snap.size });
    } catch (error) {
        resultados.push({ coleccion: 'ofertas', estado: 'error', detalle: error.message });
    }

    // 2. Empresas seed por ID fijo
    try {
        let eliminados = 0;
        for (const id of IDS_EMPRESAS_SEED) {
            try {
                await deleteDoc(doc(db, 'empresas', id));
                eliminados++;
            } catch (_) { /* ya no existía */ }
        }
        resultados.push({ coleccion: 'empresas', eliminados });
    } catch (error) {
        resultados.push({ coleccion: 'empresas', estado: 'error', detalle: error.message });
    }

    // 3. Documentos de usuarios seeded (por correo)
    try {
        const snap = await getDocs(query(
            collection(db, 'usuarios'),
            where('correo', 'in', CORREOS_SEED)
        ));
        await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'usuarios', d.id))));
        resultados.push({
            coleccion: 'usuarios (Firestore)',
            eliminados: snap.size,
            nota: 'cuentas Auth NO eliminadas - borrar manualmente en consola Firebase si se necesita',
        });
    } catch (error) {
        resultados.push({ coleccion: 'usuarios', estado: 'error', detalle: error.message });
    }

    // 4. Todo el historial de estados
    try {
        const snap = await getDocs(collection(db, 'historial_estados_oferta'));
        await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'historial_estados_oferta', d.id))));
        resultados.push({ coleccion: 'historial_estados_oferta', eliminados: snap.size });
    } catch (error) {
        resultados.push({ coleccion: 'historial_estados_oferta', estado: 'error', detalle: error.message });
    }

    return resultados;
};
