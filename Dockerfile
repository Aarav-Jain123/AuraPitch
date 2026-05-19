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
ENV GEMINI_API_KEY = "AIzaSyA2W6yB9fXcrvT9P5-gMwQ_hn_ty6CrmQA"
EXPOSE 8080

CMD ["npm", "start"]
