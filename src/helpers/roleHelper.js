export const ROLES = {
  ADMIN_CUPONERA: "admin_cuponera",
  ADMIN_EMPRESA: "admin_empresa",
  EMPLEADO: "empleado",
  CLIENTE: "cliente",
};

const RUTAS_POR_ROL = {
  [ROLES.ADMIN_CUPONERA]: "/admin",
  [ROLES.ADMIN_EMPRESA]: "/empresa",
  [ROLES.EMPLEADO]: "/empleado",
  [ROLES.CLIENTE]: "/",
};

// Retorna la ruta de inicio segun el rol del usuario
export const getRutaPorRol = (rol) => {
  return RUTAS_POR_ROL[rol] ?? "/";
};

// Verdadero si el rol tiene capacidades de administración
export const esAdmin = (rol) => {
  return rol === ROLES.ADMIN_CUPONERA || rol === ROLES.ADMIN_EMPRESA;
};

export const esAdminCuponera = (rol) => rol === ROLES.ADMIN_CUPONERA;

export const esAdminEmpresa = (rol) => rol === ROLES.ADMIN_EMPRESA;

export const esEmpleado = (rol) => rol === ROLES.EMPLEADO;

export const esCliente = (rol) => rol === ROLES.CLIENTE;

// Solo el administrador de la cuponera puede aprobar ofertas
export const canAprobarOfertas = (rol) => rol === ROLES.ADMIN_CUPONERA;

// Solo el administrador de empresa puede crear ofertas
export const canCrearOfertas = (rol) => rol === ROLES.ADMIN_EMPRESA;

// Solo los empleados pueden canjear cupones
export const canCanjearCupones = (rol) => rol === ROLES.EMPLEADO;

// Solo el administrador de empresa puede gestionar su plantilla
export const canCrearEmpleados = (rol) => rol === ROLES.ADMIN_EMPRESA;
