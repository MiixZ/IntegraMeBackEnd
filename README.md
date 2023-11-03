# "IntegraMe" BackEnd

Esto es una aplicación desarrollada con NodeJS para el hostage y mantenimiento del servidor y la base de datos de la aplicación IntegraMe, un proyecto para un colegio mayor de personas con minusvalía.

# Ejemplo de prueba de proyecto
yarn → Ayuda para para basedatos.
dotenv → Sirve para usar las variables de entorno (archivos .env o terminal??) para usarlos en cosas como el login de la database.
express → Framework para simplificar el desarrollo web y para el manejo de solicitudes HTTP.
nodemon -D -> hace que el servidor se reinicie con cada cambio que hagamos; es decir nop hace falta quitarlo y volver a iniciarlo cada vez que hagamos un cambio.
jsonwebtoken
bcrypt
node-schedule

# Base de Datos
## Consideraciones:
Claves externas → +
Clave primaria → *
Docker

MYSQL:
Hay que crear un PV para persistir los datos de la base de datos

```
docker volume create mysql-db-data
```

Para lanzar MySql cada vez tras tirar el docker y asignando el pv para no perder la información.

```		
docker run -d -p 33060:3306 --name mysql-db  -e MYSQL_ROOT_PASSWORD=integrame --mount src=mysql-db-data,dst=/var/lib/mysql mysql:8.1
```

Para entrar dentro de mysql, recordar poner la contraseña genérica → integrame:
```
docker exec -it mysql-db mysql -p
```

Para cerrar el contenedor:
```
docker rm -f mysql-db
```

Para conectar a mysql desde fuera

```
mysql -h 34.175.9.11 -P 33060 -u root -p
```

	
# NodeJS:
IMPORTANTE: Al pasar de local (Windows) a la VM en Google, NO hacer commit de la librería bcrypt.

Para nodejs (en el directorio integrame-backend):
```
docker run -p 49160:8080 -d <nombre_imagen>
```

Si quisiéramos entrar en el contenedor (su terminal):
 ```
docker exec -it <container id> /bin/bash
```
