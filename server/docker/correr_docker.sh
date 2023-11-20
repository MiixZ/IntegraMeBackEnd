sudo rm -rf node_modules/
npm install

docker build . -t integrame/nodejs
docker run -p 6969:6969 --name nodejs-integrame -d integrame/nodejs
