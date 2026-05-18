FROM node:22

WORKDIR /aurapitch

COPY package*.json ./

RUN npm install

COPY . .
RUN npm run build
ENV GEMINI_API_KEY="AIzaSyAJTjol2gmuJDlO0reQNSRSqb-eRKI67ac"
ENV BASE_URL="https://aurapitch-231480891026.europe-west1.run.app/"

EXPOSE 8080

CMD ["npm", "start"]
