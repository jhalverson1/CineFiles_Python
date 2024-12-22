FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

RUN npm run build
RUN npm install -g serve

CMD ["serve", "-s", "build", "-l", "3000"]