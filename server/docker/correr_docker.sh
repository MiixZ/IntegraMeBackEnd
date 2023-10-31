docker build . -t integrame/nodejs
docker run -p 30000:8080 --name nodejs-integrame -d integrame/nodejs
