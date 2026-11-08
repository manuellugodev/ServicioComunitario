# Despliegue con Docker

Instala el sistema, PostgreSQL 16 y https automático en un servidor Linux.

## Requisitos

- Servidor Linux con Docker y Docker Compose, y al menos 2 GB de RAM. La construcción de la imagen es lo que más memoria usa; con 2 GB, crea antes un archivo de intercambio (swap) de 2 GB.
- Un dominio cuyo registro DNS apunte a la IP del servidor.
- Los puertos 80 y 443 abiertos. No abras el 5432: la base de datos solo es accesible dentro de Docker.

## Primera instalación

1. Copia el código al servidor.
2. Crea el archivo de configuración y genera las claves con `openssl rand -hex 32`:

   ```bash
   cp .env.produccion.example .env
   nano .env
   chmod 600 .env
   ```

3. Inicia el sistema:

   ```bash
   docker compose up -d --build
   ```

4. Comprueba que el migrador terminó bien y que los servicios están activos:

   ```bash
   docker compose logs migrador
   docker compose ps
   ```

5. Entra a `https://TU_DOMINIO` con el usuario `admin` y la contraseña `ADMIN_PASSWORD`.
6. Cambia la contraseña y reemplaza la cédula provisional `V00000000`.
7. Carga los sectores y talentos oficiales, y crea las cuentas de los voceros.

La base de datos empieza vacía; los datos de demostración no están incluidos en la imagen.

## Actualizar el sistema

Genera antes un respaldo. Luego, con el código nuevo en el servidor:

```bash
docker compose up -d --build
```

El migrador aplica las migraciones nuevas y el administrador existente no se modifica.

## Respaldos automáticos

Programa este comando con `crontab -e`, ajustando la ruta. Guarda un respaldo cada día a las 2:00 y conserva 30 días:

```cron
0 2 * * * cd /ruta/del/sistema && docker compose exec -T db pg_dump -U censo -d censo --format=custom --no-owner --no-privileges > /ruta/respaldos/censo-$(date +\%F).dump && find /ruta/respaldos -name '*.dump' -mtime +30 -delete
```

Copia los respaldos fuera del servidor. Si el servidor se pierde, los que estén dentro se pierden con él.

## Restaurar un respaldo

Restaura primero en una base de datos nueva y comprueba los datos:

```bash
docker compose exec db createdb -U censo censo_restaurado
docker compose exec -T db pg_restore -U censo -d censo_restaurado --no-owner --no-privileges < respaldo-censo.dump
docker compose exec db psql -U censo -d censo_restaurado -c "SELECT count(*) FROM habitante;"
```

Para ponerla en uso, detén la aplicación y sustituye la base de datos:

```bash
docker compose stop app
docker compose exec db psql -U censo -d postgres -c "DROP DATABASE censo;"
docker compose exec db psql -U censo -d postgres -c "ALTER DATABASE censo_restaurado RENAME TO censo;"
docker compose start app
```

`DROP DATABASE` borra los datos actuales de forma definitiva: hazlo solo después de comprobar el respaldo.

## Importante

No ejecutes `docker compose down -v`: la opción `-v` borra los volúmenes, incluida la base de datos.
