FROM node:16 as frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM python:3.9-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
COPY --from=frontend /app/frontend/build ./static

# Copy and set up init script
COPY scripts/init.sh /app/init.sh
RUN chmod +x /app/init.sh

ENV PORT=8080
# Use single CMD that runs migrations and starts the app
CMD ["/app/init.sh"]
