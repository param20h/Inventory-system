# Inventory & Warehouse Management System

A full microservices architecture built with Spring Boot, Spring Cloud Gateway, and MongoDB. Ready for Docker and PaaS deployments.

## Services
- **API Gateway (8080)**: Routes traffic and validates JWTs.
- **Auth Service (8081)**: Handles user registration, login, and JWT generation.
- **Product Service (8082)**: Manages product catalog. Fetches stock levels from Inventory Service via OpenFeign.
- **Inventory Service (8083)**: Manages product stock.

## Local Development (Docker Compose)

Prerequisites: Docker and Docker Compose installed.

1. Clone the repository or navigate to this folder.
2. (Optional) Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Run the containers:
   ```bash
   docker-compose up --build -d
   ```
4. Services will be available at:
   - Gateway: `http://localhost:8080` (use this for all API calls!)
   - MongoDB: `localhost:27017`

## API Flow & Testing

1. **Register a User:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "password", "role": "ADMIN"}'
   ```
2. **Login to get JWT:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "password"}'
   ```
   *Copy the `token` from the response.*

3. **Add a Product:**
   ```bash
   curl -X POST http://localhost:8080/api/products \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{"name": "Laptop", "sku": "TECH-001", "price": 999.99}'
   ```

4. **Add Inventory for Product:**
   ```bash
   curl -X POST http://localhost:8080/api/inventory/add \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{"productId": "PRODUCT_ID_FROM_STEP_3", "quantity": 50}'
   ```

## Deployment Guide (Railway / Render)

You can easily deploy these microservices to a PaaS like Railway or Render.

### 1. Database Setup
- Provision a MongoDB cluster (e.g., MongoDB Atlas, Railway MongoDB, or Render MongoDB).
- Get your connection URI: `mongodb+srv://...`

### 2. Deploying Services
You will deploy 4 separate applications (web services). For each, point the platform to the specific subdirectory (`api-gateway`, `auth-service`, etc.).

**Environment Variables per Service:**

*Auth Service:*
- `SPRING_DATA_MONGODB_URI` = your mongo URI
- `JWT_SECRET` = your secure secret string

*Product Service:*
- `SPRING_DATA_MONGODB_URI` = your mongo URI
- `INVENTORY_SERVICE_URL` = the internal URL of the deployed inventory service

*Inventory Service:*
- `SPRING_DATA_MONGODB_URI` = your mongo URI

*API Gateway:*
- `JWT_SECRET` = your secure secret string (same as auth service)
- You may need to configure routes using environment variables if internal service URLs change on the platform.

### 3. Networking
Make sure the Gateway is exposed to the public internet, but the other services can be kept as internal private services if the platform supports it (e.g., Railway Private Networking).
