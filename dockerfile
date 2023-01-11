FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=4000

EXPOSE 4000
RUN npx prisma generate

CMD ["npm", "run", "dev"]

