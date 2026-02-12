FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# исходники будут примонтированы volume'ом
EXPOSE 3001

CMD ["npm", "run", "dev"]
