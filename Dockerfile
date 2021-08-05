FROM node:latest
WORKDIR /usr/src/app
RUN npm install pm2 -g
EXPOSE 3000
CMD pm2-docker bin/www
