# Lost and Found Backend API

A comprehensive Node.js backend application for a Lost and Found platform where users can post lost items, find items, and connect with other users.

## Features

- **User Authentication**: Register, login, and profile management with JWT tokens
- **Item Management**: Create, view, search, and manage lost/found items
- **Item Responses**: Users can respond to items with their information
- **Search Functionality**: Search items by title, description, location, and category
- **Category Filtering**: Filter items by categories
- **User Protection**: Only item owners can modify or delete their items
- **Responsive Error Handling**: Comprehensive error messages and validation

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Encryption**: bcryptjs
- **Input Validation**: express-validator

## Project Structure

```
├── src/
│   ├── config/           # Configuration files
│   │   ├── config.js     # Main configuration
│   │   ├── database.js   # Database connection pool
│   │   └── initDatabase.js # Database initialization
│   ├── controllers/      # Business logic
│   │   ├── AuthController.js
│   │   └── ItemController.js
│   ├── models/           # Database models
│   │   ├── UserModel.js
│   │   └── ItemModel.js
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   └── itemRoutes.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # Authentication middleware
│   │   ├── errorHandler.js
│   │   └── validation.js # Input validation
│   └── utils/            # Utility functions
│       ├── jwtUtils.js
│       └── passwordUtils.js
├── server.js             # Main server file
├── package.json          # Dependencies
├── .env                  # Environment variables
└── README.md            # Documentation
```

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd CapstoneLostandFound
```

2. Install dependencies
```bash
npm install
```

3. Setup MySQL Database
   - Ensure MySQL is running on your machine
   - Update `.env` file with your MySQL credentials

4. Configure environment variables in `.env`:
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lost_and_found
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

5. Start the server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210"
}
```

### Items

#### Create Lost/Found Item
```http
POST /api/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Lost iPhone 13",
  "description": "Silver iPhone 13, last seen with black case",
  "category": "Electronics",
  "itemStatus": "lost",
  "locationLost": "Central Park, New York",
  "dateLost": "2024-01-15T10:30:00Z",
  "rewardAmount": 200,
  "imageUrl": "https://example.com/image.jpg"
}
```

#### Get All Items (Not Resolved)
```http
GET /api/items
```

#### Get Item by ID
```http
GET /api/items/:id
```

#### Get User's Items
```http
GET /api/items/user/items
Authorization: Bearer <token>
```

#### Search Items
```http
GET /api/items/search?query=iPhone
```

#### Get Items by Category
```http
GET /api/items/category/:category
```

#### Mark Item as Resolved
```http
PUT /api/items/:id/resolve
Authorization: Bearer <token>
```

#### Delete Item
```http
DELETE /api/items/:id
Authorization: Bearer <token>
```

### Item Responses

#### Add Response to Item
```http
POST /api/items/:id/responses
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I think I found your item!",
  "contactPhone": "9876543210",
  "contactEmail": "responder@example.com"
}
```

#### Get All Responses for Item
```http
GET /api/items/:id/responses
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### Items Table
```sql
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  item_status ENUM('lost', 'found') NOT NULL,
  location_found VARCHAR(255),
  location_lost VARCHAR(255),
  date_lost DATETIME,
  date_found DATETIME,
  reward_amount DECIMAL(10, 2),
  image_url VARCHAR(500),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

### Item Responses Table
```sql
CREATE TABLE item_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  responder_id INT NOT NULL,
  message TEXT NOT NULL,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  response_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE
)
```

## Response Format

All endpoints return JSON responses with the following structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Error Handling

The API includes comprehensive error handling:
- Invalid input validation (400)
- Authentication failures (401)
- Authorization failures (403)
- Not found errors (404)
- Duplicate email registration (409)
- Server errors (500)

## Security Features

- **Password Encryption**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: All inputs are validated using express-validator
- **Authorization**: Only authorized users can modify their own items
- **CORS**: Cross-Origin Resource Sharing configured

## Future Enhancements

- Image upload functionality
- Notification system
- Rating and review system
- Direct messaging between users
- Map integration for location
- Advanced filtering and sorting
- User profile verification

## Development

To start development server with auto-reload:
```bash
npm run dev
```

## License

ISC

## Support

For issues and questions, please contact the development team.
