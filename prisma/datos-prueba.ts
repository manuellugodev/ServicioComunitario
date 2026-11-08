import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";

// Datos ficticios para pruebas y capacitación. Todo queda marcado para poder borrarlo.
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PREFIJO_NOMBRE = "Demo - ";
const PREFIJO_CODIGO = "DEMO-";
const USUARIOS_DEMO = ["demo.vocero", "demo.consulta"];
const VIVIENDAS_POR_DEFECTO = 120;
const MAXIMO_VIVIENDAS = 2000;
const TIEMPO_TRANSACCION = 10 * 60 * 1000;

const SECTORES = ["La Ceiba", "El Samán", "Los Mangos", "Las Palmas", "El Paraíso"].map(
  (nombre) => `${PREFIJO_NOMBRE}Sector ${nombre}`
);

const TALENTOS_DEMO: Record<string, string[]> = {
  Construcción: ["Plomero(a)", "Pintor(a)", "Herrero(a)", "Carpintero(a)"],
  Salud: ["Médico(a)", "Paramédico(a)", "Farmaceuta"],
  Educación: ["Docente", "Facilitador(a) de talleres"],
  Tecnología: ["Técnico(a) en computación", "Técnico(a) en redes"],
  Artes: ["Músico(a)", "Artesano(a)", "Bailarín(a)"],
  "Oficios del hogar": ["Costurero(a)", "Cocinero(a)", "Repostero(a)"],
};

const PROYECTOS = [
  { nombre: "Reparación de la cancha", estado: "EN_EJECUCION", talentos: ["Albañil", "Electricista"] },
  { nombre: "Jornada de salud", estado: "EN_EJECUCION", talentos: ["Enfermero(a)", "Paramédico(a)"] },
  { nombre: "Taller de costura", estado: "PROPUESTO", talentos: ["Costurero(a)"] },
  { nombre: "Pintura de la escuela", estado: "PAUSADO", talentos: ["Pintor(a)", "Albañil"] },
  { nombre: "Tutorías de matemática", estado: "CULMINADO", talentos: ["Docente"] },
] as const;

const NOMBRES_F = ["María", "Ana", "Carmen", "Luisa", "Rosa", "Yolanda", "Daniela", "Andrea", "Valentina", "Gabriela", "Sofía", "Isabel", "Marisol", "Yusmary", "Karina", "Beatriz"];
const NOMBRES_M = ["José", "Luis", "Carlos", "Pedro", "Juan", "Miguel", "Rafael", "Jesús", "Antonio", "Andrés", "Daniel", "Alejandro", "Wilmer", "Freddy", "Ramón", "Héctor"];
const APELLIDOS = ["González", "Rodríguez", "Pérez", "Hernández", "García", "Martínez", "López", "Ramírez", "Torres", "Flores", "Rivas", "Mendoza", "Briceño", "Contreras", "Rojas", "Paredes", "Araujo", "Quintero"];
const OCUPACIONES = ["Comerciante", "Docente", "Obrero(a)", "Ama de casa", "Chofer", "Agricultor(a)", "Enfermero(a)", "Mecánico", "Secretaria(o)", "Vendedor(a)"];
const DISCAPACIDADES = ["Visual", "Auditiva", "Motora", "Intelectual"];
const ENFERMEDADES = ["Hipertensión", "Diabetes", "Asma", "Artritis"];

// Generador con semilla: cada carga produce los mismos datos.
function crearAzar(semilla: number) {
  let estado = semilla;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const azar = crearAzar(20261108);
const entero = (minimo: number, maximo: number) =>
  minimo + Math.floor(azar() * (maximo - minimo + 1));
const elegir = <T>(lista: readonly T[]) => lista[entero(0, lista.length - 1)];
const probable = (probabilidad: number) => azar() < probabilidad;

function ponderado<T>(opciones: readonly (readonly [T, number])[]) {
  let resto = azar() * opciones.reduce((suma, [, peso]) => suma + peso, 0);
  for (const [valor, peso] of opciones) {
    resto -= peso;
    if (resto <= 0) {
      return valor;
    }
  }
  return opciones[0][0];
}

function nacimiento(edad: number) {
  const hoy = new Date();
  return new Date(
    Date.UTC(hoy.getUTCFullYear() - edad, hoy.getUTCMonth(), hoy.getUTCDate() - entero(1, 360))
  );
}

function sinAcentos(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

type TalentoCatalogo = { id: number };
type Parentesco = Prisma.HabitanteCreateWithoutNucleoInput["parentesco"];
type Sexo = "F" | "M";

let cedulas = 90000100;
let contactos = 1;

function nivelEducativo(edad: number) {
  if (edad < 6) {
    return null;
  }
  if (edad < 12) {
    return "PRIMARIA" as const;
  }
  if (edad < 18) {
    return "BACHILLERATO" as const;
  }
  return ponderado([
    ["SIN_ESCOLARIDAD", 3],
    ["PRIMARIA", 18],
    ["BACHILLERATO", 45],
    ["TSU", 15],
    ["UNIVERSITARIO", 17],
    ["POSTGRADO", 2],
  ] as const);
}

function talentosDePersona(edad: number, activo: boolean, catalogo: TalentoCatalogo[]) {
  if (edad < 18 || !activo || !probable(0.4)) {
    return [];
  }
  const elegidos = new Set<number>([elegir(catalogo).id]);
  if (probable(0.25)) {
    elegidos.add(elegir(catalogo).id);
  }
  return [...elegidos].map((talentoId) => ({
    talentoId,
    nivel: ponderado([
      ["BASICO", 3],
      ["INTERMEDIO", 4],
      ["AVANZADO", 3],
    ] as const),
    aniosExperiencia: entero(0, Math.max(1, Math.min(edad - 16, 40))),
    certificado: probable(0.3),
    disponible: probable(0.75),
  }));
}

function persona(
  datos: { edad: number; sexo: Sexo; apellidos: string; parentesco: Parentesco; esJefe?: boolean },
  catalogo: TalentoCatalogo[],
  creadoPorId: number
): Prisma.HabitanteUncheckedCreateWithoutNucleoInput {
  const { edad, sexo, apellidos, parentesco, esJefe } = datos;
  const nombres = elegir(sexo === "F" ? NOMBRES_F : NOMBRES_M);
  const estado = esJefe
    ? ("ACTIVO" as const)
    : ponderado([
        ["ACTIVO", 96],
        ["MUDADO", 3],
        ["FALLECIDO", 1],
      ] as const);
  const conCedula = edad >= 18 || (edad >= 10 && probable(0.5));
  const adulto = edad >= 18;
  const numero = contactos++;

  return {
    nacionalidad: probable(0.97) ? "V" : "E",
    cedula: conCedula ? String(cedulas++) : null,
    nombres,
    apellidos,
    fechaNacimiento: nacimiento(edad),
    sexo,
    parentesco,
    telefono: adulto && probable(0.8) ? `0414-000${String(numero % 10000).padStart(4, "0")}` : null,
    correo: adulto && probable(0.25) ? `${sinAcentos(nombres)}.${numero}@example.com` : null,
    nivelEducativo: nivelEducativo(edad),
    estudiaActualmente: edad >= 3 && edad <= 17 ? probable(0.92) : edad <= 24 && probable(0.4),
    ocupacion: !adulto ? null : edad >= 65 && probable(0.5) ? "Jubilado(a)" : elegir(OCUPACIONES),
    discapacidad: probable(0.04) ? elegir(DISCAPACIDADES) : null,
    enfermedadCronica: edad >= 30 && probable(0.16) ? elegir(ENFERMEDADES) : null,
    estado,
    creadoPorId,
    talentos: { create: talentosDePersona(edad, estado === "ACTIVO", catalogo) },
  };
}

function miembrosDeFamilia(catalogo: TalentoCatalogo[], creadoPorId: number) {
  const apellido = elegir(APELLIDOS);
  const edadJefe = entero(24, 78);
  const sexoJefe: Sexo = probable(0.55) ? "F" : "M";
  const otroSexo: Sexo = sexoJefe === "F" ? "M" : "F";
  const sexoAlAzar = (): Sexo => (probable(0.5) ? "F" : "M");
  const crear = (edad: number, sexo: Sexo, apellidos: string, parentesco: Parentesco) =>
    persona({ edad, sexo, apellidos, parentesco }, catalogo, creadoPorId);

  const miembros = [
    persona(
      {
        edad: edadJefe,
        sexo: sexoJefe,
        apellidos: `${apellido} ${elegir(APELLIDOS)}`,
        parentesco: "JEFE",
        esJefe: true,
      },
      catalogo,
      creadoPorId
    ),
  ];

  if (probable(0.6)) {
    miembros.push(crear(Math.max(18, edadJefe + entero(-6, 6)), otroSexo, elegir(APELLIDOS), "CONYUGE"));
  }

  const hijos = edadJefe < 62 ? entero(0, 4) : entero(0, 1);
  for (let i = 0; i < hijos; i++) {
    const edad = entero(Math.max(0, edadJefe - 42), Math.max(0, edadJefe - 18));
    miembros.push(crear(edad, sexoAlAzar(), `${apellido} ${elegir(APELLIDOS)}`, "HIJO"));
  }

  if (edadJefe < 65 && probable(0.2)) {
    miembros.push(crear(edadJefe + entero(19, 30), sexoAlAzar(), apellido, "PADRE_MADRE"));
  }
  if (edadJefe >= 48 && probable(0.25)) {
    miembros.push(crear(entero(0, 14), sexoAlAzar(), `${elegir(APELLIDOS)} ${apellido}`, "NIETO"));
  }
  if (probable(0.08)) {
    miembros.push(crear(Math.max(18, edadJefe + entero(-8, 8)), sexoAlAzar(), apellido, "HERMANO"));
  }

  return miembros;
}

async function cargar(cantidadViviendas: number) {
  const contrasena = process.env.ADMIN_PASSWORD;
  if (!contrasena) {
    throw new Error("Define ADMIN_PASSWORD en el archivo .env.");
  }
  if (await db.usuario.findFirst({ where: { usuario: { in: USUARIOS_DEMO } } })) {
    console.log("Los datos de prueba ya están cargados. Bórralos primero con: npm run db:demo:borrar");
    return;
  }

  const passwordHash = await bcrypt.hash(contrasena, 12);

  await db.$transaction(
    async (tx) => {
      const vocero = await tx.usuario.create({
        data: { nombreCompleto: "Vocero de Prueba", cedula: "V90000001", usuario: USUARIOS_DEMO[0], passwordHash, rol: "VOCERO" },
      });
      await tx.usuario.create({
        data: { nombreCompleto: "Consulta de Prueba", cedula: "V90000002", usuario: USUARIOS_DEMO[1], passwordHash, rol: "CONSULTA" },
      });

      for (const nombre of SECTORES) {
        await tx.sector.upsert({ where: { nombre }, create: { nombre }, update: {} });
      }
      const sectores = await tx.sector.findMany({ where: { nombre: { in: SECTORES } } });
      const tipos = await tx.tipoVivienda.findMany();
      const categorias = await tx.categoriaTalento.findMany();

      await tx.talento.createMany({
        skipDuplicates: true,
        data: categorias.flatMap(({ id, nombre }) =>
          (TALENTOS_DEMO[nombre] ?? []).map((talento) => ({ categoriaId: id, nombre: talento }))
        ),
      });
      const talentos = await tx.talento.findMany();
      if (talentos.length === 0 || tipos.length === 0) {
        throw new Error("Faltan tipos de vivienda o talentos en los catálogos.");
      }

      const pesoTipo = (nombre: string) => (nombre === "Casa" ? 70 : nombre === "Apartamento" ? 10 : 7);

      for (let indice = 1; indice <= cantidadViviendas; indice++) {
        const familias = probable(0.15) ? 2 : 1;
        await tx.vivienda.create({
          data: {
            codigo: `${PREFIJO_CODIGO}${String(indice).padStart(3, "0")}`,
            sectorId: elegir(sectores).id,
            direccion: `Calle ${entero(1, 12)}, casa ${entero(1, 90)}`,
            tipoViviendaId: ponderado(tipos.map(({ id, nombre }) => [id, pesoTipo(nombre)] as const)),
            tenencia: ponderado([
              ["PROPIA", 65],
              ["ALQUILADA", 18],
              ["PRESTADA", 10],
              ["INVADIDA", 4],
              ["OTRA", 3],
            ] as const),
            agua: probable(0.85),
            electricidad: probable(0.97),
            gas: probable(0.7),
            aseo: probable(0.6),
            internet: probable(0.4),
            creadoPorId: vocero.id,
            nucleos: {
              create: Array.from({ length: familias }, () => ({
                ingresoAproxUsd: probable(0.8) ? entero(30, 400) : null,
                recibeClap: probable(0.7),
                creadoPorId: vocero.id,
                habitantes: { create: miembrosDeFamilia(talentos, vocero.id) },
              })),
            },
          },
        });
      }

      for (const proyecto of PROYECTOS) {
        const requeridos = talentos.filter(({ nombre }) =>
          (proyecto.talentos as readonly string[]).includes(nombre)
        );
        const creado = await tx.proyecto.create({
          data: {
            nombre: `${PREFIJO_NOMBRE}${proyecto.nombre}`,
            descripcion: "Proyecto de prueba para la capacitación.",
            responsableId: vocero.id,
            estado: proyecto.estado,
            creadoPorId: vocero.id,
          },
        });

        for (const talento of requeridos) {
          const cantidadRequerida = entero(2, 4);
          await tx.proyectoTalento.create({
            data: { proyectoId: creado.id, talentoId: talento.id, cantidadRequerida },
          });
          if (proyecto.estado === "PROPUESTO") {
            continue;
          }
          const candidatos = await tx.habitanteTalento.findMany({
            where: {
              talentoId: talento.id,
              disponible: true,
              habitante: { estado: "ACTIVO", creadoPorId: vocero.id },
            },
            take: cantidadRequerida - 1,
          });
          for (const { habitanteId } of candidatos) {
            await tx.proyectoParticipante.create({
              data: {
                proyectoId: creado.id,
                habitanteId,
                talentoId: talento.id,
                fechaAsignacion: new Date(),
              },
            });
          }
        }
      }
    },
    { timeout: TIEMPO_TRANSACCION, maxWait: TIEMPO_TRANSACCION }
  );

  const [viviendas, familias, habitantes, asignados, proyectos] = await Promise.all([
    db.vivienda.count({ where: { codigo: { startsWith: PREFIJO_CODIGO } } }),
    db.nucleoFamiliar.count({ where: { vivienda: { codigo: { startsWith: PREFIJO_CODIGO } } } }),
    db.habitante.count({ where: { nucleo: { vivienda: { codigo: { startsWith: PREFIJO_CODIGO } } } } }),
    db.habitanteTalento.count({
      where: { habitante: { nucleo: { vivienda: { codigo: { startsWith: PREFIJO_CODIGO } } } } },
    }),
    db.proyecto.count({ where: { nombre: { startsWith: PREFIJO_NOMBRE } } }),
  ]);
  console.log(
    `Datos de prueba cargados: ${viviendas} viviendas, ${familias} familias, ${habitantes} habitantes, ${asignados} talentos asignados y ${proyectos} proyectos.`
  );
  console.log(`Usuarios de prueba: ${USUARIOS_DEMO.join(" y ")} (contraseña: ADMIN_PASSWORD de .env).`);
}

async function borrar() {
  await db.$transaction(
    async (tx) => {
      const usuarios = await tx.usuario.findMany({
        where: { usuario: { in: USUARIOS_DEMO } },
        select: { id: true },
      });
      const usuarioIds = usuarios.map(({ id }) => id);
      const creadoPorDemo = { creadoPorId: { in: usuarioIds } };

      const viviendas = {
        OR: [{ codigo: { startsWith: PREFIJO_CODIGO } }, creadoPorDemo],
      } satisfies Prisma.ViviendaWhereInput;
      const nucleos = {
        OR: [{ vivienda: viviendas }, creadoPorDemo],
      } satisfies Prisma.NucleoFamiliarWhereInput;
      const habitantes = {
        OR: [{ nucleo: nucleos }, creadoPorDemo],
      } satisfies Prisma.HabitanteWhereInput;
      const proyectos = {
        OR: [
          { nombre: { startsWith: PREFIJO_NOMBRE } },
          creadoPorDemo,
          { responsableId: { in: usuarioIds } },
        ],
      } satisfies Prisma.ProyectoWhereInput;

      await tx.proyectoParticipante.deleteMany({
        where: {
          OR: [{ requerimiento: { proyecto: proyectos } }, { posesion: { habitante: habitantes } }],
        },
      });
      await tx.proyectoTalento.deleteMany({ where: { proyecto: proyectos } });
      await tx.proyecto.deleteMany({ where: proyectos });
      await tx.habitanteTalento.deleteMany({ where: { habitante: habitantes } });
      await tx.habitante.deleteMany({ where: habitantes });
      await tx.nucleoFamiliar.deleteMany({ where: nucleos });
      await tx.vivienda.deleteMany({ where: viviendas });
      await tx.sector.deleteMany({ where: { nombre: { in: SECTORES } } });
      await tx.talento.deleteMany({
        where: {
          nombre: { in: Object.values(TALENTOS_DEMO).flat() },
          habitantes: { none: {} },
          proyectos: { none: {} },
        },
      });
      await tx.bitacora.deleteMany({ where: { usuarioId: { in: usuarioIds } } });
      await tx.usuario.deleteMany({ where: { id: { in: usuarioIds } } });

      for (const tabla of ["vivienda", "nucleo_familiar", "habitante", "proyecto"]) {
        await tx.$queryRawUnsafe(
          `SELECT setval(pg_get_serial_sequence('${tabla}', 'id'), COALESCE((SELECT MAX(id) FROM "${tabla}"), 0) + 1, false)`
        );
      }
    },
    { timeout: TIEMPO_TRANSACCION, maxWait: TIEMPO_TRANSACCION }
  );
  console.log("Datos de prueba borrados.");
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Los datos de prueba no se pueden usar en producción.");
  }

  const [argumento] = process.argv.slice(2);
  if (argumento === "borrar") {
    await borrar();
    return;
  }

  const cantidad = argumento ? Number(argumento) : VIVIENDAS_POR_DEFECTO;
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAXIMO_VIVIENDAS) {
    throw new Error(`Indica un número de viviendas entre 1 y ${MAXIMO_VIVIENDAS}.`);
  }
  await cargar(cantidad);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
