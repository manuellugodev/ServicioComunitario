export type Rol = "ADMIN" | "VOCERO" | "CONSULTA";

export const esAdmin = (rol: Rol) => rol === "ADMIN";
export const puedeEscribir = (rol: Rol) => rol !== "CONSULTA";
