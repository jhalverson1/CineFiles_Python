FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install @babel/plugin-proposal-private-property-in-object
COPY . .

ARG REACT_APP_API_URL
ARG PORT=3000
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV NODE_ENV=production
ENV PORT=${PORT}
ENV WDS_SOCKET_PORT=${PORT}

RUN npm run build
RUN npm install -g serve

CMD ["sh", "-c", "serve -s build -l ${PORT}"]