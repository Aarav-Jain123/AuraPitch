FROM node:22

WORKDIR /aurapitch

COPY package*.json ./

RUN npm install

COPY . .

# ENV GEMINI_API_KEY="AIzaSyAJTjol2gmuJDlO0reQNSRSqb-eRKI67ac"
ENV BASE_URL="https://localhost:8080/"

EXPOSE 8080

CMD ["npm", "start"]
