echo IMAGES_PATH=$(pwd)/../images/

IMAGES_PATH=$(pwd)/../images/
if grep -q "IMAGES_PATH=" ../.env; then
  # Si la línea existe, reemplázala
  sed -i "s|^IMAGES_PATH=.*|IMAGES_PATH=$IMAGES_PATH|" ../.env
else
  # Si la línea no existe, agrégala
  echo "IMAGES_PATH=$IMAGES_PATH" >> ../.env
fi

docker build . -t integrame/nodejs
docker run -p 30000:8080 --name nodejs-integrame -d integrame/nodejs
