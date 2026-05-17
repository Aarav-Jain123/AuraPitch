FROM node:22

WORKDIR /aurapitch

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=3000
ENV GEMINI_API_KEY="AIzaSyAJTjol2gmuJDlO0reQNSRSqb-eRKI67ac"
ENV BASE_URL="https://aurapitch-b9dba.web.app/"

EXPOSE 3000

CMD ["npm", "start"]
