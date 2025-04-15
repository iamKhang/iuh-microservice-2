# Microservices Architecture

This project demonstrates a simple microservices architecture with an Inventory Service and an API Gateway.

## Services

### Inventory Service
A microservice for managing inventory items, including:
- Getting inventory items
- Adding new items
- Updating item quantities
- Processing orders (reducing quantities)

### API Gateway
A gateway service that routes requests to the appropriate microservice.

## Setup and Running

### Install Dependencies

For the Inventory Service:
```bash
cd inventory-service
npm install
```

For the API Gateway:
```bash
cd api-gateway
npm install
```

### Running the Services

Start the Inventory Service:
```bash
cd inventory-service
npm start
```

Start the API Gateway:
```bash
cd api-gateway
npm start
```

## API Endpoints

### Inventory Service (via API Gateway)
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get a specific inventory item
- `POST /api/inventory` - Add a new inventory item
- `PUT /api/inventory/:id` - Update an inventory item
- `DELETE /api/inventory/:id` - Delete an inventory item
- `POST /api/inventory/order` - Process an order (reduce inventory)

## Architecture

All requests go through the API Gateway, which then routes them to the appropriate microservice. This provides a single entry point for clients and allows for centralized authentication, logging, and other cross-cutting concerns.