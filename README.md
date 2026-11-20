# Censo Comunal — Consejo Comunal Alto Barinas Norte

Sistema web para el censo demográfico y los talentos vecinales del Consejo Comunal Alto Barinas Norte (Barinas, Venezuela). Hecho con Next.js, Prisma y PostgreSQL.

- Requisitos del sistema: `Design System.md`
- Estructura del código: `docs/ARQUITECTURA.md`
- Despliegue en servidor con Docker: `docs/DESPLIEGUE.md`
- Respaldos y restauración: `docs/RESPALDOS.md`

---

## Instalación por primera vez (computadora de desarrollo)

Esta guía es para dejar el sistema funcionando en tu computadora desde cero. Toma unos 20 minutos.

### Paso 1. Instalar los programas necesarios

1. **Node.js 20.9 o superior**
   - Descárgalo de <https://nodejs.org> (la versión LTS sirve).
   - Para comprobar, abre una terminal y escribe:
     ```bash
     node -v
     npm -v
     ```
     Ambos deben mostrar un número de versión.

2. **PostgreSQL 16**
   - Descárgalo de <https://www.postgresql.org/download/>.
   - Durante la instalación te pedirá una **contraseña para el usuario `postgres`**. Anótala, la usarás en el paso 4.
   - Deja el puerto en **5432**.
   - Marca la opción de instalar **pgAdmin** (sirve para crear la base de datos de forma visual).

3. **Git** (opcional, solo si recibes el proyecto por GitHub): <https://git-scm.com>

### Paso 2. Obtener el proyecto

Copia la carpeta del proyecto a tu computadora (o clónala con `git clone`). Luego abre una terminal **dentro de esa carpeta**.

> En Windows: abre la carpeta en el Explorador, haz clic en la barra de direcciones, escribe `cmd` y presiona Enter. O ábrela en VS Code y usa *Terminal → Nueva terminal*.

### Paso 3. Instalar las dependencias

```bash
npm install
```

Esto descarga las librerías (carpeta `node_modules`) y genera el cliente de Prisma. Puede tardar unos minutos.

> Si npm muestra un aviso para actualizar Prisma a una versión más nueva, **ignóralo**. El proyecto usa exactamente Prisma 7.10.1.

### Paso 4. Crear la base de datos vacía

Crea una base de datos llamada **`censo`**. Elige una de estas dos formas:

**Opción A — con pgAdmin (más fácil):**
1. Abre pgAdmin e ingresa la contraseña de `postgres`.
2. En el panel izquierdo: *Servers → PostgreSQL 16 → Databases*.
3. Clic derecho en *Databases → Create → Database...*
4. En *Database* escribe `censo` y presiona *Save*.

**Opción B — con la terminal:**
```bash
createdb -U postgres censo
```
> En Windows, si dice que `createdb` no se reconoce, usa la ruta completa:
> `"C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres censo`

La base queda vacía; las tablas se crean en el paso 6.

### Paso 5. Crear el archivo de configuración `.env`

Copia el archivo de ejemplo:

```bash
# Windows (cmd)
copy .env.example .env

# Linux, macOS o Git Bash
cp .env.example .env
```

Abre `.env` con un editor de texto y cambia estos valores:

| Variable | Qué poner |
|---|---|
| `DATABASE_URL` | Reemplaza `CONTRASENA` por la contraseña de `postgres` del paso 1. |
| `SESSION_PASSWORD` | Cualquier texto aleatorio de **32 caracteres o más**. |
| `COOKIE_SEGURA` | Ponlo en `"false"`. En tu computadora el sistema corre por `http`, y con `"true"` no podrás iniciar sesión. |
| `ADMIN_PASSWORD` | La contraseña que quieras para el usuario `admin`. |
| `PG_DUMP_PATH` | Déjalo comentado. Solo hace falta si los respaldos dicen que no encuentran `pg_dump` (ver *Problemas comunes*). |

Ejemplo:

```env
DATABASE_URL="postgresql://postgres:miClave123@localhost:5432/censo?schema=public"
SESSION_PASSWORD="k8Jd93hsLq0pZx7Vb2Nm4Rt6Yw1Ue5Ia9Oc3"
COOKIE_SEGURA="false"
ADMIN_PASSWORD="admin1234"
```

Para generar un `SESSION_PASSWORD` aleatorio puedes usar:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> **Nunca compartas tu archivo `.env`**: contiene tus contraseñas. Cada persona crea el suyo.

### Paso 6. Crear las tablas

```bash
npx prisma migrate deploy
```

Aplica todas las migraciones de `prisma/migrations` y crea las tablas con sus catálogos iniciales. Al final debe decir que las migraciones se aplicaron correctamente.

> Usa `migrate deploy`, **no** `migrate dev`. `migrate dev` es para crear migraciones nuevas mientras se programa.

### Paso 7. Crear el primer usuario administrador

```bash
npx prisma db seed
```

Crea el usuario **`admin`** con la contraseña que pusiste en `ADMIN_PASSWORD`. Si ya existe un administrador, no hace nada.

### Paso 8 (opcional). Cargar datos de prueba

Para tener viviendas, familias y habitantes ficticios con los que probar:

```bash
npm run db:demo
```

La sección [Datos de prueba](#datos-de-prueba) explica todo lo que crea y cómo borrarlo.

### Paso 9. Iniciar el sistema

```bash
npm run dev
```

Abre <http://localhost:3000> en el navegador e inicia sesión con:

- **Usuario:** `admin`
- **Contraseña:** la de `ADMIN_PASSWORD`

Para detener el sistema, presiona `Ctrl + C` en la terminal.

---

## Uso diario

Una vez instalado, solo necesitas:

```bash
npm run dev
```

Si recibes una versión nueva del proyecto (por ejemplo con `git pull`), ejecuta también:

```bash
npm install
npx prisma migrate deploy
```

para instalar dependencias nuevas y aplicar las migraciones nuevas.

## Datos de prueba

Los datos de prueba son ficticios y sirven para probar el sistema y capacitar a los voceros sin usar datos reales. Necesitas haber hecho antes los pasos 4 a 7 (base de datos, `.env`, tablas y administrador).

### Cargar los datos

```bash
npm run db:demo
```

Crea **120 viviendas** por defecto. Para crear otra cantidad (entre 1 y 2000), escribe el número después de `--`:

```bash
npm run db:demo -- 300
```

> El `--` es necesario: le indica a npm que el número es para el script.

Al terminar muestra un resumen, por ejemplo:

```
Datos de prueba cargados: 120 viviendas, ... familias, ... habitantes, ... talentos asignados y ... proyectos.
Usuarios de prueba: demo.vocero y demo.consulta (contraseña: ADMIN_PASSWORD de .env).
```

Con muchas viviendas puede tardar unos minutos.

### Qué se crea

| Dato | Cómo reconocerlo |
|---|---|
| 5 sectores | Su nombre empieza con `Demo - Sector` |
| Viviendas | Su código empieza con `DEMO-` |
| Familias y habitantes | Están dentro de las viviendas de prueba. Los nombres son venezolanos comunes, inventados |
| Talentos | Se agregan algunos talentos a los catálogos y se asignan a habitantes |
| 5 proyectos | Su nombre empieza con `Demo - ` y tienen distintos estados (propuesto, en ejecución, pausado, culminado) |
| 2 usuarios | `demo.vocero` (rol Vocero) y `demo.consulta` (rol Consulta) |

Los datos salen siempre iguales: si los borras y los vuelves a cargar con la misma cantidad, obtienes las mismas personas.

### Probar los roles

Los usuarios de prueba usan la **misma contraseña que `ADMIN_PASSWORD`** del `.env`. Sirven para ver qué puede hacer cada rol:

- **`admin`**: todo, incluidos usuarios, catálogos y respaldos.
- **`demo.vocero`**: puede registrar y editar el censo y los proyectos.
- **`demo.consulta`**: solo puede ver. Los datos de salud y discapacidad le aparecen solo como totales.

### Borrar los datos

```bash
npm run db:demo:borrar
```

Borra todo lo de la tabla anterior. Ten en cuenta que **también borra cualquier cosa que se haya registrado iniciando sesión como `demo.vocero` o `demo.consulta`**, y sus registros en la bitácora. Lo que registraste como `admin` u otros usuarios reales no se toca.

**Borra siempre los datos de prueba antes de empezar a cargar datos reales.**

### Si algo sale mal

- **"Los datos de prueba ya están cargados"**: ya los habías cargado. Para cargarlos de nuevo (por ejemplo con otra cantidad), primero ejecuta `npm run db:demo:borrar`.
- **"Define ADMIN_PASSWORD en el archivo .env"**: falta esa línea en el `.env` (paso 5).
- **"Indica un número de viviendas entre 1 y 2000"**: el número después de `--` no es válido.
- **"Los datos de prueba no se pueden usar en producción"**: el script no funciona en el servidor real (`NODE_ENV=production`), para proteger los datos verdaderos.

## Comandos útiles

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Inicia el sistema en <http://localhost:3000> |
| `npm run build` | Compila el sistema para producción |
| `npm run lint` | Revisa el código en busca de errores |
| `npx prisma studio` | Abre un visor de la base de datos en el navegador |
| `npx prisma migrate status` | Muestra si la base de datos está al día |
| `npm run db:demo` | Carga datos de prueba |
| `npm run db:demo:borrar` | Borra los datos de prueba |

---

## Problemas comunes

**No puedo iniciar sesión: pongo la contraseña y vuelve a la pantalla de login.**
Revisa que en `.env` esté `COOKIE_SEGURA="false"` y reinicia `npm run dev`.

**`Authentication failed` o `password authentication failed for user "postgres"`.**
La contraseña en `DATABASE_URL` no es la correcta. Si la contraseña tiene símbolos como `@`, `#` o `/`, cámbialos por su código: `@` → `%40`, `#` → `%23`, `/` → `%2F`.

**`Can't reach database server at localhost:5432`.**
PostgreSQL no está encendido. En Windows: abre *Servicios*, busca `postgresql-x64-16` y presiona *Iniciar*.

**`Database "censo" does not exist`.**
Falta el paso 4.

**El login dice que el usuario está bloqueado.**
Tras 10 intentos fallidos el usuario se bloquea 15 minutos. Espera y vuelve a intentar.

**Los respaldos fallan diciendo que no encuentran `pg_dump`.**
En `.env`, quita el `#` de la línea `PG_DUMP_PATH` y verifica que la ruta exista, por ejemplo:
`PG_DUMP_PATH="C:/Program Files/PostgreSQL/16/bin/pg_dump.exe"`

**`npm run build` falla mencionando `.next/dev/types/validator.ts`.**
Borra la carpeta `.next` y vuelve a ejecutar `npm run build`.

**Errores de Prisma después de `npm install`, como `Cannot find module '@/generated/prisma/client'`.**
Ejecuta `npx prisma generate`.
