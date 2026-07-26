FROM node:22.0-alpine

#Set the working directory inside the container

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "run", "start"]

