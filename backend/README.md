# Food Order Backend

A Node.js/Express.js backend API for managing food orders with SQLite database.

## Features

- RESTful API for menu management
- Order creation and management
- SQLite database with Sequelize ORM
- TypeScript support
- Automatic database initialization with sample menu items

## API Endpoints

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create a new menu item

### Orders
- `GET /api/orders` - Get all orders (oldest first)
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id/status` - Update order status

### Health
- `GET /health` - Health check endpoint

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
npm start
```

The server will start on port 3001 by default.

## Database Schema

### Menu Table
- `id` (INTEGER, PRIMARY KEY)
- `name` (STRING)
- `price` (DECIMAL)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

### Orders Table
- `id` (INTEGER, PRIMARY KEY)
- `customerName` (STRING)
- `status` (ENUM: 'pending' | 'completed')
- `paid` (BOOLEAN)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

### OrderItems Table
- `id` (INTEGER, PRIMARY KEY)
- `orderId` (INTEGER, FOREIGN KEY)
- `menuItemId` (INTEGER, FOREIGN KEY)
- `quantity` (INTEGER)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

## Sample Data

The application automatically creates sample menu items on first run:
- Burger - $12.99
- Pizza - $15.99
- Pasta - $13.99
- Salad - $9.99
- Fries - $4.99
- Soda - $2.99
