FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install @babel/plugin-proposal-private-property-in-object
COPY . .

# Build arguments and environment variables
ARG REACT_APP_API_URL=http://localhost:8080
ARG REACT_APP_DEPLOY_ENV=development
ARG PORT=3001

# Set environment variables
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_DEPLOY_ENV=${REACT_APP_DEPLOY_ENV}
ENV NODE_ENV=development
ENV PORT=${PORT}
ENV WDS_SOCKET_PORT=${PORT}

# Start the development server
CMD ["npm", "start"]