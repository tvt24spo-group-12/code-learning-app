FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN apt-get update && apt-get install -y docker.io

EXPOSE 3000

CMD ["node", "src/server.js"]