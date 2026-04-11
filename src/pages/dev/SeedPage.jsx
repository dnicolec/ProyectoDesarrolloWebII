/**
 * SeedPage.jsx - Página temporal de desarrollo
 * Acceso restringido: solo superadmin@lacuponera.com puede usarla.
 * ELIMINAR antes del deployment a producción.
 */

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    SUPER_ADMIN_EMAIL,
    seedUsuarios, seedEmpleados, seedEmpresas,
    seedOfertas, seedCupones, seedHistorial,
    seedClientes, limpiarSeed,
} from '../../scripts/seedData';

const CREDENCIALES = [
    { rol: 'super_admin',    correo: 'superadmin@lacuponera.com', password: 'SuperAdmin2024!', ruta: '/admin' },
    { rol: 'admin_cuponera', correo: 'admin.cuponera@test.com',   password: 'Test1234!',       ruta: '/admin' },
    { rol: 'admin_empresa',  correo: 'admin.empresa@test.com',    password: 'Test1234!',       ruta: '/empresa' },
    { rol: 'empleado',       correo: 'empleado@test.com',         password: 'Test1234!',       ruta: '/empleado' },
    { rol: 'cliente',        correo: 'cliente@test.com',          password: 'Test1234!',       ruta: '/' },
];

const EQUIPO_NOMBRES = ['andre', 'tiffany', 'debbie', 'dana', 'susana'];
const EQUIPO_EMPRESAS = {
    andre: 'Siman', tiffany: 'Pizza Hut', debbie: 'Pollo Campero',
    dana: 'Burger King', susana: 'Zara',
};

function ResultadoItem({ item }) {
    const esError = item.resultado === 'error' || item.estado === 'error';
    return (
        <li className={`text-sm font-mono ${esError ? 'text-red-600' : 'text-green-600'}`}>
            {JSON.stringify(item)}
        </li>
    );
}

function Seccion({ titulo, descripcion, onEjecutar, resultado, cargando }) {
    return (
        <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-800">{titulo}</h3>
                    <p className="text-sm text-gray-500">{descripcion}</p>
                </div>
                <button
                    onClick={onEjecutar}
                    disabled={cargando}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {cargando ? 'Ejecutando...' : 'Ejecutar'}
                </button>
            </div>
            {resultado && (
                <ul className="bg-gray-50 rounded p-3 space-y-1 max-h-40 overflow-y-auto">
                    {resultado.map((item, i) => <ResultadoItem key={i} item={item} />)}
                </ul>
            )}
        </div>
    );
}

export default function SeedPage() {
    const { user } = useAuth();

    const [resultados, setResultados] = useState({});
    const [cargando, setCargando]     = useState({});
    const [ofertaId, setOfertaId]     = useState('');

    const [confirmandoLimpieza, setConfirmandoLimpieza] = useState(false);
    const [cargandoLimpieza, setCargandoLimpieza]       = useState(false);

    // Solo el super admin puede usar esta página
    if (user?.email !== SUPER_ADMIN_EMAIL) {
        return (
            <div className="max-w-md mx-auto py-20 px-4 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Acceso restringido</h2>
                    <p className="text-sm text-red-600">
                        Esta herramienta solo está disponible para el super admin
                        ({SUPER_ADMIN_EMAIL}).
                    </p>
                </div>
            </div>
        );
    }

    const ejecutar = (clave, fn) => async () => {
        setCargando(prev => ({ ...prev, [clave]: true }));
        try {
            const res = await fn();
            setResultados(prev => ({ ...prev, [clave]: res }));
            if (clave === 'ofertas' && res.length > 0 && res[0].id) {
                setOfertaId(res[0].id);
            }
        } catch (err) {
            setResultados(prev => ({ ...prev, [clave]: [{ estado: 'error', detalle: err.message }] }));
        } finally {
            setCargando(prev => ({ ...prev, [clave]: false }));
        }
    };

    const handleEjecutarTodo = async () => {
        // Orden correcto:
        // 1. empresas (necesarias para vincular usuarios y ofertas)
        // 2. ofertas
        // 3. historial
        // 4. empleados
        // 5. usuarios (crea cuentas Auth + docs Firestore, usa app auxiliar)
        // 6. cupones (se autentica como cliente en app auxiliar)

        await ejecutar('empresas', seedEmpresas)();

        setCargando(prev => ({ ...prev, ofertas: true }));
        let ofertaIdLocal = null;
        try {
            const res = await seedOfertas();
            setResultados(prev => ({ ...prev, ofertas: res }));
            ofertaIdLocal = res.find(r => r.estado === 'aprobada')?.id || res[0]?.id;
            if (ofertaIdLocal) setOfertaId(ofertaIdLocal);
        } catch (err) {
            setResultados(prev => ({ ...prev, ofertas: [{ estado: 'error', detalle: err.message }] }));
        } finally {
            setCargando(prev => ({ ...prev, ofertas: false }));
        }

        if (ofertaIdLocal) await ejecutar('historial', () => seedHistorial(ofertaIdLocal))();
        await ejecutar('empleados', seedEmpleados)();
        await ejecutar('usuarios', seedUsuarios)();
        await ejecutar('cupones', seedCupones)();
        await ejecutar('clientes', seedClientes)();
    };

    const handleLimpiar = async () => {
        setCargandoLimpieza(true);
        setConfirmandoLimpieza(false);
        try {
            const res = await limpiarSeed();
            setResultados(prev => ({ ...prev, limpieza: res }));
            setOfertaId('');
        } catch (err) {
            setResultados(prev => ({ ...prev, limpieza: [{ estado: 'error', detalle: err.message }] }));
        } finally {
            setCargandoLimpieza(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">

            {/* Advertencia */}
            <div className="bg-yellow-50 border border-yellow-300 rounded p-4 text-sm text-yellow-800">
                <strong>Solo para desarrollo.</strong> Esta página no debe existir en producción.
                Elimina la ruta <code>/admin/seed</code> de <code>App.jsx</code> antes del deploy.
            </div>

            <h1 className="text-2xl font-bold text-gray-900">Seed de datos de prueba</h1>

            {/* Limpiar primero */}
            <div className="border-2 border-red-200 rounded-lg p-4 space-y-3 bg-red-50">
                <div>
                    <h3 className="font-semibold text-red-800">Limpiar datos de prueba</h3>
                    <p className="text-sm text-red-600 mt-0.5">
                        Elimina de Firestore <strong>todos</strong> los datos de prueba: empresas, ofertas,
                        cupones, historial y usuarios (excepto el super admin).
                        Las cuentas de Firebase Auth <strong>no se eliminan</strong> - hay que borrarlas
                        manualmente en desde Firebase.
                    </p>
                </div>

                {!confirmandoLimpieza ? (
                    <button
                        onClick={() => setConfirmandoLimpieza(true)}
                        disabled={cargandoLimpieza}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        {cargandoLimpieza ? 'Limpiando...' : 'Limpiar datos'}
                    </button>
                ) : (
                    <div className="bg-red-100 border border-red-300 rounded p-3 space-y-2">
                        <p className="text-sm font-semibold text-red-800">
                            ⚠ Esta acción es irreversible. ¿Estás seguro?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleLimpiar}
                                className="px-4 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 font-semibold"
                            >
                                Sí, limpiar todo
                            </button>
                            <button
                                onClick={() => setConfirmandoLimpieza(false)}
                                className="px-4 py-1.5 bg-white text-red-700 text-sm rounded border border-red-300 hover:bg-red-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {resultados.limpieza && (
                    <ul className="bg-white rounded p-3 space-y-1 max-h-40 overflow-y-auto border border-red-100">
                        {resultados.limpieza.map((item, i) => (
                            <li key={i} className={`text-sm font-mono ${item.estado === 'error' ? 'text-red-600' : 'text-green-700'}`}>
                                {JSON.stringify(item)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Ejecutar todo de una vez */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-blue-800 mb-3">
                    Orden de ejecución: <strong>1. empresas, 2. ofertas, 3. historial, 4. empleados, 5. usuarios, 6. cupones, 7. clientes</strong>.
                    Tu sesión de super admin no se modifica en ningún momento.
                </p>
                <button
                    onClick={handleEjecutarTodo}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                    Ejecutar todo
                </button>
            </div>

            {/* Secciones individuales */}
            <Seccion
                titulo="1 - Empresas (10 marcas)"
                descripcion="Crea Siman, Pizza Hut, Pollo Campero, Burger King, Cinépolis, PetCenter, Subway, KFC, Zara y Starbucks."
                onEjecutar={ejecutar('empresas', seedEmpresas)}
                resultado={resultados.empresas}
                cargando={cargando.empresas}
            />
            <Seccion
                titulo="2 - Ofertas (6 estados + 18 activas)"
                descripcion="Crea ofertas en los 6 estados para probar el flujo admin, más 18 ofertas aprobadas variadas."
                onEjecutar={ejecutar('ofertas', seedOfertas)}
                resultado={resultados.ofertas}
                cargando={cargando.ofertas}
            />
            <Seccion
                titulo="3 - Historial de estados"
                descripcion={`Registra el flujo en_espera - aprobada para la oferta${ofertaId ? ` (${ofertaId.slice(0, 8)}...)` : ' creada en el paso 2'}.`}
                onEjecutar={ejecutar('historial', () => {
                    if (!ofertaId) throw new Error('Primero ejecuta el paso 2 para obtener un ofertaId');
                    return seedHistorial(ofertaId);
                })}
                resultado={resultados.historial}
                cargando={cargando.historial}
            />
            <Seccion
                titulo="4 - Empleados"
                descripcion="Crea 5 empleados de prueba en Firestore: 3 en seed-siman, 1 en seed-pizzahut y 1 en seed-campero."
                onEjecutar={ejecutar('empleados', seedEmpleados)}
                resultado={resultados.empleados}
                cargando={cargando.empleados}
            />
            <Seccion
                titulo="5 - Usuarios (4 roles)"
                descripcion="Crea admin_cuponera, admin_empresa, empleado y cliente en Auth + Firestore. La sesión de super admin no se toca."
                onEjecutar={ejecutar('usuarios', seedUsuarios)}
                resultado={resultados.usuarios}
                cargando={cargando.usuarios}
            />
            <Seccion
                titulo="6 - Cupones para cliente de prueba"
                descripcion="Crea 5 cupones (4 asignados + 1 canjeado) para cliente@test.com. Requiere pasos 2 y 5 previos."
                onEjecutar={ejecutar('cupones', seedCupones)}
                resultado={resultados.cupones}
                cargando={cargando.cupones}
            />
            <Seccion
                titulo="7 - Clientes de prueba (50)"
                descripcion="Crea 50 clientes en Firestore (sin cuenta Auth) con nombres y datos salvadoreños para poblar el panel admin."
                onEjecutar={ejecutar('clientes', seedClientes)}
                resultado={resultados.clientes}
                cargando={cargando.clientes}
            />

            {/* Credenciales de prueba -cuentas genéricas */}
            <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-800">Credenciales de prueba</h3>
                <p className="text-xs text-gray-500">Cuentas genéricas por rol. Password compartida.</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="pb-2 pr-4">Rol</th>
                                <th className="pb-2 pr-4">Correo</th>
                                <th className="pb-2 pr-4">Password</th>
                                <th className="pb-2">Ruta</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono">
                            {CREDENCIALES.map(c => (
                                <tr key={c.rol} className="border-b last:border-0">
                                    <td className="py-2 pr-4 text-gray-700">{c.rol}</td>
                                    <td className="py-2 pr-4 text-blue-700">{c.correo}</td>
                                    <td className="py-2 pr-4 text-gray-600">{c.password}</td>
                                    <td className="py-2 text-green-700">{c.ruta}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Credenciales del equipo */}
            <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-800">Credenciales del equipo</h3>
                <p className="text-xs text-gray-500">
                    Patrón: <span className="font-mono">nombre.rol@test.com</span> -Password: <span className="font-mono">Test1234!</span>
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b font-mono">
                                <th className="pb-2 pr-3">Nombre</th>
                                <th className="pb-2 pr-3">.cliente - /</th>
                                <th className="pb-2 pr-3">.admin-empresa - /empresa</th>
                                <th className="pb-2">.admin - /admin</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-xs">
                            {EQUIPO_NOMBRES.map(n => (
                                <tr key={n} className="border-b last:border-0">
                                    <td className="py-1.5 pr-3 font-semibold text-gray-700 capitalize">{n}</td>
                                    <td className="py-1.5 pr-3 text-blue-700">{n}.cliente@test.com</td>
                                    <td className="py-1.5 pr-3 text-blue-700">
                                        {n}.admin-empresa@test.com
                                        <span className="ml-1 text-gray-400">({EQUIPO_EMPRESAS[n]})</span>
                                    </td>
                                    <td className="py-1.5 text-blue-700">{n}.admin@test.com</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
