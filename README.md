# ACCVAULTNG - Social Media Accounts Marketplace

A full-stack web application for buying and selling social media accounts, built with React.js, Node.js, Express, and MongoDB.

## Features

### User Features
- User registration and authentication
- Browse marketplace with filtering options
- View account details and purchase
- Responsive design with purple and white theme

### Admin Features
- Admin dashboard with statistics
- Category management (Create, Read, Update, Delete)
- User management
- Account management
- Real-time data updates

## Tech Stack

### Frontend
- React.js 18
- Material-UI (MUI) for components
- React Router for navigation
- Axios for API calls
- Context API for state management

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- bcryptjs for password hashing
- CORS enabled

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd accvaultng
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/accvaultng
   JWT_SECRET=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system.

6. **Run the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or run separately:
   # Backend only
   npm run server
   
   # Frontend only (in another terminal)
   npm run client
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
accvaultng/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── App.js          # Main app component
├── models/                 # MongoDB models
├── routes/                 # Express routes
├── middleware/             # Custom middleware
├── server.js              # Express server
└── package.json           # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Accounts
- `GET /api/accounts` - Get all accounts with filters
- `GET /api/accounts/:id` - Get single account
- `POST /api/accounts` - Create account (Authenticated)

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/categories` - All categories for admin
- `GET /api/admin/users` - All users
- `GET /api/admin/accounts` - All accounts

## Default Admin Account

To create an admin account, you can either:

1. Register normally and manually update the user role in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "admin@accvaultng.com" },
     { $set: { role: "admin" } }
   )
   ```

2. Or modify the User model to set the first user as admin automatically.

## Features Overview

### Theme
- Primary color: Purple (#7c3aed)
- Secondary color: White (#ffffff)
- Modern, clean design with Material-UI components

### Admin Dashboard
- Statistics cards showing user, category, and account counts
- Category management with full CRUD operations
- User management with role-based access
- Account management and monitoring

### Security
- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes for admin functionality
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.# Social-Acc
