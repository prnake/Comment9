FROM keymetrics/pm2:latest-alpine
WORKDIR /usr/src/app
COPY package.json .
COPY ecosystem.config.js .
RUN yarn install --production
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
