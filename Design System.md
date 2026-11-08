# Diseño del Sistema – Censo Demográfico y Gestión de Talentos Vecinales

Consejo Comunal Alto Barinas Norte · Municipio Barinas, Estado Barinas · Nov 8, 2026 · @Manuel Lugo

## 1. Introducción y alcance

Este documento describe el diseño del sistema web de censo demográfico y gestión de talentos vecinales del Consejo Comunal Alto Barinas Norte. Corresponde a las actividades 8 (requerimientos) y 9 (diseño inicial) del cronograma, y es la base para el desarrollo del código fuente (actividad 10).

**Propósito:** sustituir los registros manuales y fragmentados por una plataforma centralizada que permita registrar viviendas, núcleos familiares y habitantes; identificar los oficios, profesiones y habilidades de la comunidad; y usar esa información para organizar proyectos internos autogestionados.

**Dentro del alcance:**

- Registro y actualización del censo (viviendas, familias, habitantes).
- Registro de talentos vecinales por habitante.
- Registro de proyectos comunitarios y asignación de vecinos con los talentos requeridos.
- Consultas, estadísticas y reportes exportables.
- Gestión de usuarios (voceros) con roles y permisos.

**Fuera del alcance:** pagos o finanzas del consejo comunal, integración con sistemas del Estado (p. ej. Patria/SAIME), aplicación móvil nativa y acceso público de los vecinos (solo usuarios autorizados del consejo comunal).

## 2. Arquitectura y stack tecnológico

Se adopta una arquitectura web cliente-servidor de tres capas, desarrollada íntegramente en TypeScript, tal como se estableció en el anteproyecto:

1. **Capa de presentación:** interfaz web que se abre desde cualquier navegador (PC o teléfono) y no requiere instalación en los equipos del consejo comunal.
2. **Capa de lógica de negocio:** servidor que valida los datos, aplica los permisos por rol y genera estadísticas y reportes.
3. **Capa de datos:** base de datos relacional PostgreSQL normalizada (3FN) con viviendas, familias, habitantes, talentos y proyectos.

| Componente | Tecnología propuesta | Justificación |
| --- | --- | --- |
| Lenguaje | TypeScript | Tipado estático, un solo lenguaje en cliente y servidor (definido en el anteproyecto) |
| Framework web | Next.js (React) | Frontend y backend en un mismo proyecto; desarrollo rápido |
| Estilos / componentes | Tailwind CSS + shadcn/ui | Interfaz limpia y adaptable a móvil |
| Acceso a datos | Prisma ORM | Modelo de datos tipado, migraciones y consultas seguras |
| Base de datos | PostgreSQL 16 | Gestor relacional definido en el anteproyecto |
| Autenticación | iron-session + bcrypt | Inicio de sesión con usuario y contraseña cifrada; sesión en cookie cifrada con expiración |
| Validación | Zod | Mismas reglas de validación en formularios y servidor |
| Reportes | Exportación a PDF y Excel | Entrega de listados a voceros y entes externos |
| Gráficos | Recharts | Estadísticas del censo en el panel principal |
| Despliegue | Desarrollo local; despliegue con Docker en servidor/PC o VPS (instalación directa si el equipo no soporta Docker) | Funciona en la red local del consejo o en internet |

**Flujo de una petición:** el vocero llena un formulario → el servidor verifica su sesión y rol → valida los datos con Zod → Prisma guarda en PostgreSQL → se registra la acción en la bitácora → la pantalla muestra la confirmación.

## 3. Actores, roles y permisos

Solo los usuarios autorizados del consejo comunal acceden al sistema. Los vecinos son sujetos del registro, no usuarios.

| Rol | Quién lo usa | Permisos principales |
| --- | --- | --- |
| Administrador | Equipo técnico / vocero principal | Todo: gestionar usuarios, catálogos (sectores, oficios), respaldos y bitácora |
| Vocero | Voceros de las unidades del consejo comunal | Registrar y editar viviendas, familias, habitantes y talentos; crear proyectos y asignar vecinos; ver reportes |
| Consulta | Contraloría social u otros miembros | Solo ver listados, estadísticas y exportar reportes; no puede modificar datos |

**Reglas:** todo usuario tiene contraseña personal; ninguna acción de escritura se permite sin sesión; eliminar registros está reservado al Administrador (los voceros solo pueden marcar a un habitante como "inactivo" por mudanza o fallecimiento); el rol Consulta solo ve totales de los datos de salud y discapacidad, nunca los de una persona identificada.

**Implementación por fases:** el inicio de sesión y el rol de cada usuario existen desde el principio. Las restricciones de lectura y escritura por rol se implementan en la semana del 23 al 29 de noviembre, antes de cargar datos reales y de desplegar el sistema; hasta entonces solo se usan datos de prueba.

## 4. Módulos del sistema

| # | Módulo | Qué hace |
| --- | --- | --- |
| M1 | Seguridad y usuarios | Inicio/cierre de sesión, gestión de usuarios y roles, cambio de contraseña, bitácora de acciones |
| M2 | Viviendas | Registro de viviendas por sector/calle: dirección, tipo, tenencia, servicios básicos |
| M3 | Núcleos familiares | Familias dentro de cada vivienda, jefe(a) de familia, ingreso aproximado, beneficios sociales |
| M4 | Habitantes | Datos personales, parentesco, nivel educativo, ocupación, salud/discapacidad, estado (activo/inactivo) |
| M5 | Talentos vecinales | Oficios, profesiones y habilidades de cada habitante, nivel y disposición a colaborar; buscador de talentos |
| M6 | Proyectos comunitarios | Registro de proyectos internos, talentos requeridos, asignación de vecinos y seguimiento por estado |
| M7 | Reportes y estadísticas | Panel con indicadores (población, pirámide por edad y sexo, talentos por área), listados filtrables, exportación PDF/Excel |
| M8 | Configuración | Catálogos (sectores, categorías de talento, tipos de vivienda), nombre del consejo comunal, respaldo de la base de datos |

## 5. Requerimientos funcionales

| Código | Requerimiento | Módulo | Prioridad |
| --- | --- | --- | --- |
| RF-01 | El sistema debe permitir iniciar y cerrar sesión con usuario y contraseña | M1 | Alta |
| RF-02 | El administrador debe poder crear, editar, desactivar usuarios y asignarles un rol | M1 | Alta |
| RF-03 | El sistema debe registrar en una bitácora quién creó, modificó o eliminó cada registro y cuándo | M1 | Media |
| RF-04 | Registrar, editar, consultar y listar viviendas con su sector, dirección y servicios | M2 | Alta |
| RF-05 | Registrar uno o más núcleos familiares por vivienda, indicando el jefe(a) de familia | M3 | Alta |
| RF-06 | Registrar habitantes dentro de un núcleo familiar, con parentesco respecto al jefe(a) | M4 | Alta |
| RF-07 | Validar que la combinación de nacionalidad y cédula de identidad no esté repetida; permitir habitantes sin cédula (menores) | M4 | Alta |
| RF-08 | Calcular automáticamente la edad a partir de la fecha de nacimiento | M4 | Alta |
| RF-09 | Marcar habitantes como inactivos (mudado o fallecido) sin borrar su historial | M4 | Media |
| RF-10 | Buscar habitantes por cédula, nombre, sector o vivienda | M4 | Alta |
| RF-11 | Asignar uno o más talentos a un habitante, con nivel (básico/intermedio/avanzado), años de experiencia y disponibilidad | M5 | Alta |
| RF-12 | Buscar vecinos por talento, categoría, sector y disponibilidad | M5 | Alta |
| RF-13 | Registrar proyectos comunitarios con nombre, descripción, fechas, estado y responsable | M6 | Alta |
| RF-14 | Indicar los talentos que requiere cada proyecto y sugerir vecinos que los poseen | M6 | Alta |
| RF-15 | Asignar vecinos a un proyecto con su rol y llevar el seguimiento del estado del proyecto | M6 | Media |
| RF-16 | Mostrar un panel con totales: viviendas, familias, habitantes, distribución por edad, sexo y talentos | M7 | Alta |
| RF-17 | Generar reportes filtrables (p. ej. adultos mayores, personas con discapacidad, niños por edad escolar, talentos por área) | M7 | Alta |
| RF-18 | Exportar listados y reportes a PDF y Excel | M7 | Media |
| RF-19 | Administrar catálogos: sectores, categorías y talentos, tipos de vivienda | M8 | Media |
| RF-20 | Generar un respaldo descargable de la base de datos | M8 | Media |

## 6. Requerimientos no funcionales

| Código | Categoría | Requerimiento |
| --- | --- | --- |
| RNF-01 | Usabilidad | Interfaz en español, sencilla, con formularios guiados; un vocero capacitado debe poder registrar una familia completa en menos de 10 minutos |
| RNF-02 | Compatibilidad | Funcionar en navegadores actuales (Chrome, Firefox, Edge) y adaptarse a pantallas de teléfono para el levantamiento casa por casa |
| RNF-03 | Seguridad | Contraseñas cifradas con bcrypt; sesiones con expiración; control de acceso por rol en cada operación del servidor |
| RNF-04 | Seguridad | Protección contra inyección SQL (consultas parametrizadas vía ORM) y validación de todas las entradas |
| RNF-05 | Privacidad | Los datos personales de los vecinos solo son visibles para usuarios autenticados y se usan exclusivamente para fines del consejo comunal |
| RNF-06 | Rendimiento | Las consultas y listados habituales deben responder en menos de 2 segundos con hasta 5.000 habitantes registrados |
| RNF-07 | Ligereza | Ejecutarse en equipos modestos (p. ej. 4 GB de RAM) y con conexiones de internet lentas |
| RNF-08 | Integridad | Base de datos normalizada con claves foráneas, restricciones de unicidad (nacionalidad + cédula) y borrado lógico |
| RNF-09 | Disponibilidad | Respaldos periódicos de la base de datos y procedimiento documentado de restauración |
| RNF-10 | Mantenibilidad | Código en TypeScript organizado por módulos, con migraciones de base de datos versionadas y manual técnico |
| RNF-11 | Escalabilidad | Permitir agregar nuevos módulos o sectores sin rediseñar la base de datos |

## 7. Casos de uso principales

| CU | Nombre | Actor | Flujo principal |
| --- | --- | --- | --- |
| CU-01 | Iniciar sesión | Todos | Ingresa usuario y contraseña → el sistema valida → muestra el panel según su rol |
| CU-02 | Registrar vivienda | Vocero | Selecciona sector → llena dirección, tipo y servicios → guarda → el sistema asigna un código de vivienda |
| CU-03 | Registrar núcleo familiar | Vocero | Abre una vivienda → "Agregar familia" → registra al jefe(a) de familia y datos socioeconómicos |
| CU-04 | Registrar habitante | Vocero | Dentro de una familia → "Agregar miembro" → datos personales y parentesco → el sistema valida cédula y calcula edad |
| CU-05 | Registrar talento | Vocero | Abre un habitante → "Agregar talento" → elige categoría y talento, nivel, experiencia y disponibilidad |
| CU-06 | Buscar talentos | Vocero / Consulta | Filtra por talento, sector y disponibilidad → obtiene lista de vecinos con teléfono y dirección |
| CU-07 | Crear proyecto y asignar vecinos | Vocero | Registra proyecto → indica talentos requeridos → el sistema sugiere vecinos → el vocero los asigna |
| CU-08 | Generar reporte | Vocero / Consulta | Elige tipo de reporte y filtros → visualiza → exporta a PDF o Excel |
| CU-09 | Gestionar usuarios | Administrador | Crea usuario → asigna rol → puede desactivarlo o restablecer su contraseña |
| CU-10 | Respaldar base de datos | Administrador | Pulsa "Generar respaldo" → descarga el archivo de respaldo |

**Flujo típico del censo casa por casa:** CU-02 → CU-03 → CU-04 (por cada miembro) → CU-05 (para quienes declaren oficios o profesiones).

## 8. Modelo de datos

Base de datos relacional en PostgreSQL, normalizada hasta la tercera forma normal. La jerarquía central es **Sector → Vivienda → Núcleo familiar → Habitante → Talentos**, y los proyectos se conectan con los habitantes a través de sus talentos.

### 8.1 Entidades y relaciones

| Entidad | Descripción | Relaciones |
| --- | --- | --- |
| usuario | Voceros y administradores con acceso al sistema | 1:N con bitacora y proyecto (responsable) |
| sector | Sectores o calles del consejo comunal | 1:N con vivienda |
| tipo\_vivienda | Catálogo de tipos de vivienda (casa, apartamento, anexo, rancho, otro…) | 1:N con vivienda |
| vivienda | Inmueble censado | N:1 sector; N:1 tipo\_vivienda; 1:N nucleo\_familiar |
| nucleo\_familiar | Familia que habita una vivienda | N:1 vivienda; 1:N habitante |
| habitante | Persona censada | N:1 nucleo\_familiar; N:M talento (vía habitante\_talento) |
| categoria\_talento | Área: construcción, salud, educación, tecnología, artes, oficios del hogar, etc. | 1:N talento |
| talento | Oficio, profesión o habilidad concreta (albañil, enfermero, electricista…) | N:1 categoria\_talento |
| habitante\_talento | Talento que posee un habitante, con nivel y disponibilidad | N:1 habitante; N:1 talento |
| proyecto | Proyecto comunitario interno | N:1 usuario (responsable); N:M talento; N:M habitante |
| proyecto\_talento | Talentos que necesita un proyecto y cuántas personas | N:1 proyecto; N:1 talento |
| proyecto\_participante | Vecinos asignados a un proyecto | N:1 proyecto; N:1 habitante; N:1 talento |
| bitacora | Registro de auditoría de acciones | N:1 usuario |
| configuracion | Nombre del consejo comunal mostrado en el sistema | Registro único, sin relaciones |

### 8.2 Diccionario de datos

**usuario**

| Campo | Tipo | Restricción | Descripción |
| --- | --- | --- | --- |
| id | SERIAL | PK | Identificador |
| nombre\_completo | VARCHAR(120) | NOT NULL | Nombre del vocero |
| cedula | VARCHAR(12) | UNIQUE, NOT NULL | Cédula del usuario |
| usuario | VARCHAR(40) | UNIQUE, NOT NULL | Nombre de inicio de sesión |
| password\_hash | VARCHAR(255) | NOT NULL | Contraseña cifrada (bcrypt) |
| rol | ENUM(ADMIN, VOCERO, CONSULTA) | NOT NULL | Rol del usuario |
| activo | BOOLEAN | DEFAULT true | Permite desactivar sin borrar |
| creado\_en | TIMESTAMP | DEFAULT now() | Fecha de creación |

**vivienda**

| Campo | Tipo | Restricción | Descripción |
| --- | --- | --- | --- |
| id | SERIAL | PK | Identificador |
| codigo | VARCHAR(15) | UNIQUE | Código de vivienda (p. ej. ABN-001) |
| sector\_id | INT | FK → sector | Sector o calle |
| direccion | VARCHAR(200) | NOT NULL | Dirección / punto de referencia |
| tipo\_vivienda\_id | INT | FK → tipo\_vivienda, NOT NULL | Tipo de vivienda (catálogo administrable) |
| tenencia | ENUM(PROPIA, ALQUILADA, PRESTADA, INVADIDA, OTRA) |  | Tenencia |
| agua, electricidad, gas, aseo, internet | BOOLEAN | DEFAULT false | Servicios básicos disponibles |
| observaciones | TEXT |  | Notas |

**nucleo\_familiar**

| Campo | Tipo | Restricción | Descripción |
| --- | --- | --- | --- |
| id | SERIAL | PK | Identificador |
| vivienda\_id | INT | FK → vivienda, NOT NULL | Vivienda donde habita |
| ingreso\_aprox\_usd | DECIMAL(10,2) | ≥ 0, opcional | Ingreso familiar mensual aproximado, en dólares estadounidenses |
| recibe\_clap | BOOLEAN | DEFAULT false | Beneficiario de bolsa CLAP |
| observaciones | TEXT |  | Notas |

**habitante**

| Campo | Tipo | Restricción | Descripción |
| --- | --- | --- | --- |
| id | SERIAL | PK | Identificador |
| nucleo\_id | INT | FK → nucleo\_familiar, NOT NULL | Familia a la que pertenece |
| nacionalidad | CHAR(1) | V / E | Nacionalidad |
| cedula | VARCHAR(12) | UNIQUE junto con nacionalidad, NULL permitido | Vacío para menores sin cédula |
| nombres / apellidos | VARCHAR(80) | NOT NULL | Nombre completo |
| fecha\_nacimiento | DATE | NOT NULL | La edad se calcula a partir de este campo |
| sexo | ENUM(F, M) | NOT NULL | Sexo |
| parentesco | ENUM(JEFE, CONYUGE, HIJO, PADRE\_MADRE, HERMANO, NIETO, OTRO) | NOT NULL; un solo JEFE por núcleo | Relación con el jefe(a); JEFE identifica al jefe(a) del núcleo familiar |
| telefono / correo | VARCHAR |  | Contacto |
| nivel\_educativo | ENUM(SIN\_ESCOLARIDAD, PRIMARIA, BACHILLERATO, TSU, UNIVERSITARIO, POSTGRADO) |  | Nivel educativo |
| estudia\_actualmente | BOOLEAN |  | Si estudia actualmente |
| ocupacion | VARCHAR(80) |  | Ocupación actual |
| discapacidad | VARCHAR(80) |  | Tipo de discapacidad, si aplica |
| enfermedad\_cronica | VARCHAR(80) |  | Si aplica |
| estado | ENUM(ACTIVO, MUDADO, FALLECIDO) | DEFAULT ACTIVO | Borrado lógico |

**habitante\_talento**

| Campo | Tipo | Restricción | Descripción |
| --- | --- | --- | --- |
| habitante\_id | INT | PK, FK → habitante | Vecino |
| talento\_id | INT | PK, FK → talento | Talento |
| nivel | ENUM(BASICO, INTERMEDIO, AVANZADO) | NOT NULL | Dominio |
| anios\_experiencia | SMALLINT | ≥ 0 | Experiencia |
| certificado | BOOLEAN | DEFAULT false | Tiene título o certificado |
| disponible | BOOLEAN | DEFAULT true | Dispuesto a colaborar en proyectos |

**proyecto**

| Campo | Tipo | Restricción | Descripción |
| --- | --- | --- | --- |
| id | SERIAL | PK | Identificador |
| nombre | VARCHAR(150) | NOT NULL | Nombre del proyecto |
| descripcion | TEXT |  | Objetivo y alcance |
| responsable\_id | INT | FK → usuario | Vocero responsable |
| fecha\_inicio / fecha\_fin | DATE |  | Fechas |
| estado | ENUM(PROPUESTO, EN\_EJECUCION, PAUSADO, CULMINADO) | DEFAULT PROPUESTO | Estado |

**Tablas de apoyo:** sector (id, nombre), tipo\_vivienda (id, nombre), configuracion (id, nombre\_consejo), categoria\_talento (id, nombre), talento (id, categoria\_id, nombre), proyecto\_talento (proyecto\_id, talento\_id, cantidad\_requerida), proyecto\_participante (proyecto\_id, habitante\_id, talento\_id como clave primaria compuesta, rol, fecha\_asignacion), bitacora (id, usuario\_id, accion, tabla, registro\_id, detalle JSONB, fecha). Todas las tablas principales incluyen además creado\_en, actualizado\_en y creado\_por (FK → usuario).

## 9. Diseño de interfaces

Navegación con menú lateral (en móvil, menú desplegable). El nombre del consejo comunal se configura en M8; el logo y los colores se definen en el código.

| Pantalla | Contenido principal | Rol |
| --- | --- | --- |
| Inicio de sesión | Usuario, contraseña, nombre y logo del consejo comunal | Todos |
| Panel principal | Tarjetas con totales (viviendas, familias, habitantes, talentos, proyectos activos); gráficos de pirámide poblacional y talentos por categoría | Todos |
| Viviendas | Tabla filtrable por sector; botón "Nueva vivienda"; ficha de vivienda con sus familias | Vocero / Consulta (solo lectura) |
| Ficha de familia | Datos del núcleo, lista de miembros, botón "Agregar miembro" | Vocero |
| Formulario de habitante | Pasos: datos personales → educación y trabajo → salud; los talentos se agregan desde la ficha del habitante | Vocero |
| Buscador de talentos | Filtros (categoría, talento, sector, nivel, disponibilidad) y resultados con contacto | Vocero / Consulta |
| Proyectos | Lista por estado; ficha con talentos requeridos, vecinos sugeridos y asignados | Vocero / Consulta (solo lectura) |
| Reportes | Selector de reporte, filtros, vista previa, botones PDF / Excel | Vocero / Consulta |
| Usuarios | Tabla de usuarios, crear/editar, restablecer contraseña | Administrador |
| Configuración | Catálogos, nombre del consejo comunal, respaldo | Administrador |

**Criterios de diseño:** textos grandes y claros, formularios por pasos para no abrumar al vocero, confirmación antes de acciones importantes, mensajes de error en lenguaje sencillo y uso cómodo desde el teléfono durante el censo casa por casa.

## 10. Plan de desarrollo

Distribución de la actividad 10 del cronograma (64 horas, del 01-11-2026 al 29-11-2026) por módulos, hasta las pruebas del 30-11 y la capacitación del 05-12.

| Semana | Fechas | Entregable |
| --- | --- | --- |
| 1 | 01–08 nov | Proyecto base (Next.js + Prisma + PostgreSQL), esquema de base de datos y migraciones, inicio de sesión y registro del rol de cada usuario (M1) |
| 2 | 09–15 nov | Viviendas, núcleos familiares y habitantes (M2, M3, M4) con validaciones |
| 3 | 16–22 nov | Talentos y buscador (M5); proyectos comunitarios y asignación de vecinos (M6) |
| 4 | 23–29 nov | Panel, reportes y exportación PDF/Excel (M7); configuración y respaldos (M8); restricciones de lectura y escritura por rol; carga de datos de prueba |
| — | 30 nov | Pruebas internas de estabilidad, rendimiento y corrección de errores (actividad 11) |
| — | 01–04 dic | Despliegue, carga de catálogos reales y creación de usuarios |
| — | 05 dic | Taller de capacitación a voceros con manual de usuario (actividad 12) |

**Pendientes por confirmar con el consejo comunal:**

- [ ] Lista oficial de sectores o calles de Alto Barinas Norte.
- [ ] Campos de la planilla de censo actual que deben conservarse (según las muestras de la actividad 7).
- [ ] Lista inicial de categorías y talentos a precargar.
- [ ] Dónde se instalará el sistema (computadora del consejo comunal o servidor en internet) y quién será el administrador.