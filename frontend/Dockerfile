FROM node:16

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install @babel/plugin-proposal-private-property-in-object

# Copy the rest of the application
COPY . .

# Build arguments and environment variables
ARG REACT_APP_API_URL=http://localhost:8080
ARG APP_ENV=development
ARG PORT=3001

# Set environment variables
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV NODE_ENV=${APP_ENV}
ENV PORT=${PORT}
ENV WDS_SOCKET_PORT=${PORT}

# Use a script to determine startup command based on environment
CMD if [ "$NODE_ENV" = "production" ] ; then \
        npm run build && npx serve -s build -l $PORT ; \
    else \
        npm start ; \
    fi