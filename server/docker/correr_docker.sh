sudo rm -rf node_modules/
npm install

docker build . -t integrame/nodejs
docker run -p 6969:8080 --name nodejs-integrame -d integrame/nodejs
