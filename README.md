# Food Order Management App

A full-stack application for managing food orders with React Native frontend and Express.js backend.

## Project Structure

```
├── backend/          # Express.js API server
├── frontend/         # React Native app
└── README.md         # This file
```

## Tech Stack

### Backend
- Node.js with Express.js
- TypeScript
- SQLite database
- Sequelize ORM
- RESTful API

### Frontend
- React Native with Expo
- TypeScript
- React Navigation
- Axios for API calls
- Dark theme UI

## Quick Start

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:3001`

### 2. Start the Frontend

```bash
cd frontend
npm install
npm start
```

Choose your preferred platform (iOS, Android, or Web).

## Features

- **Menu Management**: View and manage menu items
- **Order Creation**: Create orders with customer details and multiple items
- **Order Tracking**: View all orders in chronological order
- **Status Updates**: Mark orders as completed or pending
- **Payment Tracking**: Track paid/unpaid orders
- **Real-time Updates**: Pull-to-refresh functionality

## Database Schema

The app uses three main tables:
- **Menu**: Store menu items with prices
- **Orders**: Store order information (customer, status, payment)
- **OrderItems**: Link orders to menu items with quantities

## API Documentation

### Menu Endpoints
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create new menu item

### Order Endpoints
- `GET /api/orders` - Get all orders (oldest first)
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Health Check
- `GET /health` - API health status

## Development

Both backend and frontend support hot reload during development. The backend uses `ts-node-dev` and the frontend uses Expo's development server.

## Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
expo build
```

## Sample Data

The backend automatically creates sample menu items on first run:
- Burger ($12.99)
- Pizza ($15.99)
- Pasta ($13.99)
- Salad ($9.99)
- Fries ($4.99)
- Soda ($2.99)
