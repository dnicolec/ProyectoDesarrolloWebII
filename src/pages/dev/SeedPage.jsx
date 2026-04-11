/**
 * SeedPage.jsx - Página temporal de desarrollo
 * Permite ejecutar el seed de datos de prueba con un clic.
 * ELIMINAR antes del deployment a producción.
 */

import { useState } from 'react';
import { seedUsuarios, seedEmpleados, seedEmpresas, seedOfertas, seedHistorial, limpiarSeed } from '../../scripts/seedData';

const CREDENCIALES = [
    { rol: 'admin_cuponera', correo: 'admin.cuponera@test.com', password: 'Test1234!', ruta: '/admin' },
    { rol: 'admin_empresa',  correo: 'admin.empresa@test.com',  password: 'Test1234!', ruta: '/empresa' },
    { rol: 'empleado',       correo: 'empleado@test.com',       password: 'Test1234!', ruta: '/empleado' },
    { rol: 'cliente',        correo: 'cliente@test.com',        password: 'Test1234!', ruta: '/' },
];

function ResultadoItem({ item }) {
    const color = item.resultado === 'error' || item.estado === 'error'
        ? 'text-red-600'
        : 'text-green-600';
    return (
        <li className={`text-sm font-mono ${color}`}>
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
    const [resultados, setResultados] = useState({});
    const [cargando, setCargando]     = useState({});
    const [ofertaId, setOfertaId]     = useState('');

    const [confirmandoLimpieza, setConfirmandoLimpieza] = useState(false);
    const [cargandoLimpieza, setCargandoLimpieza]       = useState(false);

    const ejecutar = (clave, fn) => async () => {
        setCargando(prev => ({ ...prev, [clave]: true }));
        try {
            const res = await fn();
            setResultados(prev => ({ ...prev, [clave]: res }));
            if (clave === 'ofertas' && res.length > 0 && res[0].id) {
                setOfertaId(res[0].id);
            }
        } catch (err) {
            setResultados(prev => ({ ...prev, [clave]: [{ error: err.message }] }));
        } finally {
            setCargando(prev => ({ ...prev, [clave]: false }));
        }
    };

    const handleLimpiar = async () => {
        setCargandoLimpieza(true);
        setConfirmandoLimpieza(false);
        try {
            const res = await limpiarSeed();
            setResultados(prev => ({ ...prev, limpieza: res }));
            setOfertaId('');
        } catch (err) {
            setResultados(prev => ({ ...prev, limpieza: [{ error: err.message }] }));
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

            {/* Ejecutar todo de una vez */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-blue-800 mb-2">
                    Ejecuta en orden (empresas y ofertas van <strong>antes</strong> de usuarios para evitar el cambio de sesión de Auth):
                    1. empresas → 2. ofertas → 3. usuarios → 4. empleados → 5. historial
                </p>
                <button
                    onClick={async () => {
                        // Empresas y ofertas PRIMERO, mientras el admin actual tiene permisos
                        await ejecutar('empresas', seedEmpresas)();
                        setCargando(prev => ({ ...prev, ofertas: true }));
                        try {
                            const res = await seedOfertas();
                            setResultados(prev => ({ ...prev, ofertas: res }));
                            const id = res.find(r => r.estado === 'aprobada')?.id || res[0]?.id;
                            if (id) {
                                setOfertaId(id);
                                const hist = await seedHistorial(id);
                                setResultados(prev => ({ ...prev, historial: hist }));
                            }
                        } catch (err) {
                            setResultados(prev => ({ ...prev, ofertas: [{ error: err.message }] }));
                        } finally {
                            setCargando(prev => ({ ...prev, ofertas: false }));
                        }
                        // Usuarios y empleados AL FINAL — createUserWithEmailAndPassword cambia la sesión
                        await ejecutar('usuarios', seedUsuarios)();
                        await ejecutar('empleados', seedEmpleados)();
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                    Ejecutar todo
                </button>
            </div>

            {/* Secciones individuales */}
            <Seccion
                titulo="1 - Usuarios (4 roles)"
                descripcion="Crea admin_cuponera, admin_empresa, empleado y cliente en Auth + Firestore."
                onEjecutar={ejecutar('usuarios', seedUsuarios)}
                resultado={resultados.usuarios}
                cargando={cargando.usuarios}
            />
            <Seccion
                titulo="2 - Empleados"
                descripcion="Crea 5 empleados de prueba: 3 en emp001 y 2 en emp002."
                onEjecutar={ejecutar('empleados', seedEmpleados)}
                resultado={resultados.empleados}
                cargando={cargando.empleados}
            />
            <Seccion
                titulo="3 - Empresas (10 marcas)"
                descripcion="Crea Siman, Pizza Hut, Pollo Campero, Burger King, Cinépolis, PetCenter, Subway, KFC, Zara y Starbucks."
                onEjecutar={ejecutar('empresas', seedEmpresas)}
                resultado={resultados.empresas}
                cargando={cargando.empresas}
            />
            <Seccion
                titulo="4 - Ofertas (6 estados + 18 activas)"
                descripcion="Crea ofertas en los 6 estados para probar el flujo admin, más 18 ofertas aprobadas variadas."
                onEjecutar={ejecutar('ofertas', seedOfertas)}
                resultado={resultados.ofertas}
                cargando={cargando.ofertas}
            />
            <Seccion
                titulo="5 - Historial de estados"
                descripcion={`Registra el flujo en_espera - aprobada para la oferta${ofertaId ? ` (${ofertaId.slice(0, 8)}...)` : ' creada en el paso 3'}.`}
                onEjecutar={ejecutar('historial', () => {
                    if (!ofertaId) throw new Error('Primero ejecuta el paso 3 para obtener un ofertaId');
                    return seedHistorial(ofertaId);
                })}
                resultado={resultados.historial}
                cargando={cargando.historial}
            />

            {/* Limpieza de datos */}
            <div className="border-2 border-red-200 rounded-lg p-4 space-y-3 bg-red-50">
                <div>
                    <h3 className="font-semibold text-red-800">Limpiar datos de prueba</h3>
                    <p className="text-sm text-red-600 mt-0.5">
                        Elimina de Firestore todas las ofertas SEED, los usuarios de prueba y el historial de estados.
                        Las cuentas de Firebase Auth <strong>no se eliminan</strong>. Hacerlo manualmente en la consola de Firebase si es necesario.
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

            {/* Credenciales de prueba */}
            <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-800">Credenciales de prueba</h3>
                <p className="text-xs text-gray-500">
                    Usa estas cuentas para probar cada rol. Todas tienen la misma contraseña.
                </p>
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
        </div>
    );
}
