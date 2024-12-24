FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install @babel/plugin-proposal-private-property-in-object
COPY . .

# Build arguments and environment variables
ARG REACT_APP_API_URL
ARG REACT_APP_DEPLOY_ENV=staging
ARG PORT=3000

# Set environment variables
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_DEPLOY_ENV=${REACT_APP_DEPLOY_ENV}
ENV NODE_ENV=production
ENV PORT=${PORT}
ENV WDS_SOCKET_PORT=${PORT}

# Debug information during build
RUN echo "Build-time environment:"
RUN echo "REACT_APP_API_URL: ${REACT_APP_API_URL}"
RUN echo "REACT_APP_DEPLOY_ENV: ${REACT_APP_DEPLOY_ENV}"
RUN echo "NODE_ENV: ${NODE_ENV}"
RUN echo "PORT: ${PORT}"

# Build the application
RUN npm run build

# Install serve
RUN npm install -g serve

# Start the application
CMD ["sh", "-c", "echo \"Runtime environment: DEPLOY_ENV=${REACT_APP_DEPLOY_ENV} API_URL=${REACT_APP_API_URL} PORT=${PORT}\" && serve -s build -l ${PORT}"]