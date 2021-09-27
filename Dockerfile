FROM keymetrics/pm2:latest-alpine
WORKDIR /usr/src/app
COPY package.json .
COPY ecosystem.config.js .
RUN if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then \
    echo 'use npm mirror'; yarn config set registry https://registry.npm.taobao.org; \
    fi;
RUN yarn install --production
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
