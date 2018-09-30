FROM node:10

WORKDIR /app

COPY package.json .

ENV NODE_ENV=production

RUN yarn install --production=true

COPY . ./

USER node

EXPOSE 3000

CMD ["node", "index.js"]