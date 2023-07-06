FROM node:18

WORKDIR /

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run" , "start"]