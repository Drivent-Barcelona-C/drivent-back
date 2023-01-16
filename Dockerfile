FROM node:16
WORKDIR /drivent-back
COPY ./package*.json ./
COPY ./.husky ./
RUN npm install
COPY . . 
ENV PORT=5000
EXPOSE 5000
RUN npx prisma generate 
CMD ["npm", "run", "dev:migrate"]