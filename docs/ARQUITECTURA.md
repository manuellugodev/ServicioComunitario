# Arquitectura y plan de construcción

Monolito modular: una sola aplicación Next.js, con cada módulo de `Design System.md` en su propia carpeta y las mismas capas internas en todos.

## Estructura de carpetas

```
prisma/                 esquema y migraciones versionadas
src/
  app/                  solo rutas: páginas delgadas, sin lógica de negocio
    (auth)/login/
    (panel)/            menú lateral + viviendas/, habitantes/, ...
  modules/
    seguridad/          M1
    configuracion/      M8
    viviendas/          M2
    familias/           M3
    habitantes/         M4
    talentos/           M5
    proyectos/          M6
    reportes/           M7
  shared/
    components/         shadcn/ui, menú lateral, tablas
    lib/                conexión a la base de datos, sesión, bitácora, utilidades
```

Cada módulo tiene las mismas cuatro partes:

| Archivo | Función |
| --- | --- |
| `schemas.ts` | Reglas de validación con Zod, compartidas por formularios y servidor |
| `queries.ts` | Lectura de datos (solo servidor) |
| `actions.ts` | Crear, editar y eliminar (solo servidor) |
| `components/` | Formularios y tablas del módulo |

## Reglas

1. **Las páginas son delgadas.** Los archivos de `app/` solo muestran información y llaman a su módulo.
2. **Solo `queries.ts` y `actions.ts` acceden a la base de datos.** Las pantallas nunca lo hacen.
3. **Las dependencias van en un solo sentido:** configuración → viviendas → familias → habitantes → talentos → proyectos → reportes. Un módulo puede usar los anteriores, nunca los posteriores. `seguridad` y `shared` están disponibles para todos.
4. **Toda acción sigue los mismos pasos:** verificar la sesión → validar con Zod → guardar y registrar en la bitácora en una misma transacción → actualizar la pantalla.
5. **Los permisos están en un solo lugar.** Cada acción llama a `requerirSesion()`, también en las lecturas. Las restricciones por rol se agregan después cambiando esa llamada.

## Orden de construcción

| Etapa | Módulo | Contenido | Fecha objetivo |
| --- | --- | --- | --- |
| 0 | Base | Carpetas, shadcn/ui, conexión a la base de datos, diseño con menú lateral | 9 nov |
| 1 | M1 Seguridad | `usuario`, `bitacora`, inicio y cierre de sesión con iron-session, gestión de usuarios, primer administrador | 9–11 nov |
| 2 | M8 Catálogos | Sectores, tipos de vivienda, nombre del consejo comunal | 11–12 nov |
| 3 | M2 Viviendas | Listado, formulario, código automático | 12–13 nov |
| 4 | M3 Familias | Núcleos familiares dentro de cada vivienda | 13–14 nov |
| 5 | M4 Habitantes | Formulario por pasos, cédula, edad, un solo `JEFE` por núcleo | 14–15 nov |
| 6 | M5 Talentos | Catálogo, asignación a habitantes, buscador | 16–19 nov |
| 7 | M6 Proyectos | Proyectos, vecinos sugeridos, asignación | 19–22 nov |
| 8 | M7 Reportes | Panel, gráficos, PDF y Excel | 23–26 nov |
| 9 | Seguridad | Restricciones por rol, respaldos | 27–28 nov |
| 10 | Cierre | Datos de prueba, configuración de Docker | 29 nov |

Cada módulo agrega sus propias tablas en su propia migración.

**Un módulo está terminado cuando:** su migración está aplicada, `npm run build` y `npm run lint` pasan, se probó en el navegador y tiene su propio commit en git. Solo entonces se empieza el siguiente.

## Notas de esta versión de Next.js

- Cache Components está activo: leer la sesión ocurre en cada petición, así que los componentes que la leen van dentro de `<Suspense>`.
- Las Server Actions se pueden invocar directamente con una petición POST, por lo que cada una debe verificar la sesión por sí misma. Una redirección en `proxy.ts` no es suficiente.
- Para Docker se usa `output: 'standalone'`, generando la imagen dentro de Linux.
