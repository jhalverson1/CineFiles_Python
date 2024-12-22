FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install @babel/plugin-proposal-private-property-in-object
COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV NODE_ENV=production
ENV PORT=3000

RUN npm run build
RUN npm install -g serve

CMD ["serve", "-s", "build", "-l", "3000"]