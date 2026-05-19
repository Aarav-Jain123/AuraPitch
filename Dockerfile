FROM node:22

WORKDIR /aurapitch

COPY package*.json ./

RUN npm install

COPY . .

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

ENV PORT=8080
CMD ["npm", "start"]"
ENV BASE_URL="https://localhost:8080/"

EXPOSE 8080

CMD ["npm", "start"]
