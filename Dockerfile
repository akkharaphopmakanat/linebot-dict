FROM node:18

WORKDIR /

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "start"]