FROM node:25.6.1
WORKDIR /app

COPY package*.json /app/
RUN npm install
COPY . /app/

# CMD [ "tsx", "--env-file=.env", "--no-deprecation", "watch", "src/server.ts" ]
CMD [ "npx", "tsx", "watch", "src/server.ts" ]