FROM node:16-buster-slim as dep-builder

LABEL MAINTAINER https://github.com/prnake/Comment9

ARG USE_CHINA_NPM_REGISTRY=0;
RUN ln -sf /bin/bash /bin/sh

RUN apt-get update && apt-get install -yq python3 build-essential dumb-init --no-install-recommends

WORKDIR /app
COPY . /app

RUN if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then \
  echo 'use npm mirror'; yarn config set registry https://registry.npm.taobao.org; \
  fi;

RUN yarn install
RUN yarn build

RUN node scripts/minify-docker.js

FROM node:16-slim as app

ENV NODE_ENV production
ENV TZ Asia/Shanghai

WORKDIR /app
COPY --from=dep-builder /app/dist /app/dist
COPY --from=dep-builder /app/app-minimal /app
COPY --from=dep-builder /usr/bin/dumb-init /usr/bin/dumb-init

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]

CMD ["yarn", "start"]
