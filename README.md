# 🔍 Lost and Found System - Backend API

A modern Node.js backend API developed for sharing and finding lost items.

## 🚀 Features

- ✅ User registration and login system (JWT Authentication)
- ✅ Create, update, and delete lost item listings
- ✅ List and search lost items
- ✅ Filter by categories
- ✅ Image upload support (maximum 5 images)
- ✅ Pagination support
- ✅ User profile management
- ✅ Secure password storage (bcrypt)
- ✅ RESTful API design

## 📋 Requirements

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd CapstoneLostandFound
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` file and configure the settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lost-and-found
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

5. Make sure MongoDB is running

6. Start the server:
```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev
```

## 📚 API Endpoints

### Authentication

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "phone": "5551234567"
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "123456"
}
```

#### Get Profile Information
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Update Profile
```http
PUT /api/auth/updatedetails
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "5559876543"
}
```

#### Update Password
```http
PUT /api/auth/updatepassword
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "123456",
  "newPassword": "newpassword123"
}
```

### Lost Items

#### List All Lost Items
```http
GET /api/lostitems
```

Query parameters:
- `status`: lost | found
- `category`: electronics | clothing | accessories | wallet | bag | keys | phone | id | pet | other
- `search`: Search term (title, description, location)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sorting (-createdAt, createdAt, etc.)

Example:
```http
GET /api/lostitems?status=lost&category=phone&search=iphone&page=1&limit=10
```

#### Get Single Lost Item
```http
GET /api/lostitems/:id
```

#### Create Lost Item
```http
POST /api/lostitems
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "Black Wallet",
  "description": "Lost black leather wallet at Maslak metro",
  "category": "wallet",
  "status": "lost",
  "location": "Maslak Metro Station",
  "date": "2024-01-15",
  "images": [file1, file2]
}
```

#### Update Lost Item
```http
PUT /api/lostitems/:id
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "Black Leather Wallet (Found)",
  "status": "found"
}
```

#### Delete Lost Item
```http
DELETE /api/lostitems/:id
Authorization: Bearer {token}
```

#### Get My Listings
```http
GET /api/lostitems/user/me
Authorization: Bearer {token}
```

### Health Check
```http
GET /api/health
```

## 📁 Project Structure

```
CapstoneLostandFound/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication operations
│   │   └── lostItemController.js # Lost item operations
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   └── errorHandler.js      # Error handling middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── LostItem.js          # Lost item model
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   └── lostItemRoutes.js    # Lost item routes
│   ├── utils/
│   │   └── upload.js            # File upload configuration
│   └── server.js                # Main server file
├── uploads/                      # Uploaded images
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment example file
├── .gitignore
├── package.json
└── README.md
```

## 🗄️ Database Schema

### User
```javascript
{
  name: String,        // User name
  email: String,       // Email (unique)
  password: String,    // Hashed password
  phone: String,       // Phone number
  role: String,        // 'user' | 'admin'
  createdAt: Date      // Registration date
}
```

### LostItem
```javascript
{
  title: String,           // Listing title
  description: String,     // Detailed description
  category: String,        // Category
  status: String,          // 'lost' | 'found'
  location: String,        // Location
  date: Date,             // Lost/Found date
  images: [String],       // Image paths
  contactInfo: {          // Contact information
    name: String,
    phone: String,
    email: String
  },
  user: ObjectId,         // User reference
  isActive: Boolean,      // For soft delete
  createdAt: Date,        // Creation date
  updatedAt: Date         // Update date
}
```

## 🔒 Security

- JWT token-based authentication
- Password hashing with Bcrypt
- CORS protection
- Input validation
- Rate limiting (can be added in the future)
- Helmet.js (can be added in the future)

## 📝 Categories

The system supports the following categories:
- `electronics` - Electronic devices
- `clothing` - Clothing items
- `accessories` - Accessories
- `wallet` - Wallets
- `bag` - Bags
- `keys` - Keys
- `phone` - Phones
- `id` - ID documents
- `pet` - Pets
- `other` - Other items

## 🧪 Testing

You can test using API testing tools like Postman or Insomnia.

Example test scenario:
1. Create user registration
2. Login and get token
3. Create lost item listing with token
4. List all items
5. View your own listings

## 🚧 Future Improvements

- [ ] Email verification system
- [ ] Password reset
- [ ] Real-time notifications (Socket.io)
- [ ] Advanced search (location-based)
- [ ] Admin panel
- [ ] Statistics and reporting
- [ ] Rate limiting
- [ ] Unit and integration tests

## 👥 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📄 License

ISC

## 📞 Contact

You can open an issue for project questions.

---

**Note:** This project was developed as a capstone project.
