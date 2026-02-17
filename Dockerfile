FROM node:25.6.1
WORKDIR /app

COPY package*.json /app/
RUN npm install
COPY . /app/

CMD [ "npm", "run", "dev-nm-server" ]