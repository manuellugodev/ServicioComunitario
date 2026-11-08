# Respaldos de la base de datos

Un respaldo contiene todos los datos personales y de salud de la comunidad. Guárdalo en un lugar con acceso restringido y nunca lo compartas por canales abiertos.

En una instalación con Docker, los comandos están en `docs/DESPLIEGUE.md`.

## Generar un respaldo

1. Entra al sistema como Administrador.
2. Ve a **Configuración → Respaldo de la base de datos**.
3. Pulsa **Generar respaldo** y guarda el archivo `respaldo-censo-AAAA-MM-DD.dump`.

Cada respaldo queda registrado en la bitácora. El servidor necesita el programa `pg_dump`; si no está en el `PATH`, indica su ruta en la variable `PG_DUMP_PATH` del archivo `.env`.

Se recomienda generar un respaldo al menos una vez por semana, y siempre antes de actualizar el sistema, y conservar una copia fuera del equipo donde está instalado.

## Respaldo automático desde la línea de comandos

```bash
PGPASSWORD="CONTRASENA" pg_dump -h localhost -U postgres -d censo --format=custom --no-owner --no-privileges -f respaldo-censo.dump
```

En Windows se puede programar con el Programador de tareas. En Linux, con `cron`.

## Restaurar un respaldo

Restaura primero en una base de datos nueva, para no tocar la actual hasta confirmar que el respaldo está bien.

```bash
export PGPASSWORD="CONTRASENA"
createdb -h localhost -U postgres censo_restaurado
pg_restore -h localhost -U postgres -d censo_restaurado --no-owner --no-privileges respaldo-censo.dump
```

Comprueba los datos:

```bash
psql -h localhost -U postgres -d censo_restaurado -c "SELECT count(*) FROM habitante;"
```

Para ponerla en uso, detén el sistema y cambia el nombre de la base de datos en `DATABASE_URL` del archivo `.env` por `censo_restaurado`. Luego inicia el sistema de nuevo.

En Windows, los programas están en `C:\Program Files\PostgreSQL\16\bin`.
