# User Management Dashboard

A full-stack user management dashboard built with React, Node.js, Express, and Supabase (PostgreSQL).

## Features

- **User Management**: Create, read, update, and delete users with detailed profiles
- **Responsive Design**: Works on desktop and mobile devices
- **Form Validation**: Client and server-side validation with Formik and Yup
- **Modern UI**: Built with Tailwind CSS and Hero Icons
- **RESTful API**: Clean and well-documented endpoints
- **Real-time Data**: Powered by Supabase real-time subscriptions
- **Secure Authentication**: JWT-based authentication
- **Error Handling**: Comprehensive error handling and user feedback

## Tech Stack

- **Frontend**: 
  - React 18 with Hooks
  - React Router v6 for navigation
  - Formik & Yup for form handling and validation
  - Axios for API requests
  - Tailwind CSS for styling
  - React Hot Toast for notifications

- **Backend**: 
  - Node.js & Express
  - Supabase (PostgreSQL) for database
  - JWT for authentication
  - CORS for secure cross-origin requests

- **Development Tools**:
  - Nodemon for development server
  - Environment variables for configuration
  - Git for version control

## Prerequisites

- Node.js (v16 or higher recommended)
- npm (v8 or higher) or yarn
- Git (for version control)
- Supabase account (for database)
- Modern web browser (Chrome, Firefox, Edge, or Safari)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/user-management-dashboard.git
cd user-management-dashboard
```

### 2. Environment Setup

1. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # JWT Configuration
   JWT_SECRET=your_secure_jwt_secret
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` (if available)
   - Or create a new `.env` file with the following content:
     ```
     PORT=5000
     NODE_ENV=development
     DATABASE_URL=./database.sqlite
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend will be available at `http://localhost:5000`

### 3. Database Setup

#### Development (SQLite)
- No additional setup required for development
- The database will be automatically created at `backend/database.sqlite`

#### Production (PostgreSQL)
1. Create a PostgreSQL database (local or cloud provider)
2. Update `.env` with your PostgreSQL connection string:
   ```
   NODE_ENV=production
   DATABASE_URL=postgres://username:password@host:port/database
   ```
3. The app will automatically use the correct database based on `NODE_ENV`

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

## Available Scripts

### Backend

- `npm run dev`: Start the development server with nodemon (SQLite)
- `npm start`: Start the production server (PostgreSQL)
- `npm test`: Run tests (to be implemented)
- `npx sequelize-cli db:migrate`: Run database migrations (production)
- `npx sequelize-cli db:seed:all`: Seed the database with test data

### Frontend

- `npm start`: Start the development server
- `npm build`: Build the app for production
- `npm test`: Launch the test runner
- `npm run eject`: Eject from create-react-app

## Deployment

### Backend Deployment
1. Set up a Node.js server (e.g., Heroku, Render, Railway)
2. Configure environment variables:
   ```
   NODE_ENV=production
   DATABASE_URL=your_postgres_connection_string
   PORT=5000
   ```
3. Install dependencies: `npm install --production`
4. Start the server: `npm start`

### Frontend Deployment
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `build` folder to a static hosting service (Vercel, Netlify, etc.)
3. Update the API base URL in the frontend `.env` file:
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   ```

## Migrating from SQLite to PostgreSQL

1. **Backup your SQLite database**
2. **Set up PostgreSQL**
   - Install PostgreSQL locally or use a cloud provider
   - Create a new database

3. **Update Configuration**
   - Set `NODE_ENV=production`
   - Update `DATABASE_URL` in `.env` to point to your PostgreSQL database

4. **Run Migrations**
   ```bash
   npx sequelize-cli db:migrate
   ```

5. **Seed Data (Optional)**
   ```bash
   npx sequelize-cli db:seed:all
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get a single user by ID
- `POST /users` - Create a new user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

#### Request/Response Examples

**Create User**
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Inc.",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001",
    "geo": {
      "lat": 40.7128,
      "lng": -74.0060
    }
  }
}
```

## Project Structure

```
user-management-dashboard/
├── backend/               # Backend code
│   ├── node_modules/
│   ├── routes/           # API routes
│   ├── database.sqlite   # SQLite database
│   ├── package.json
│   └── server.js         # Express server
└── frontend/             # Frontend code
    ├── public/           # Static files
    └── src/
        ├── components/   # Reusable components
        ├── pages/        # Page components
        ├── services/     # API services
        ├── App.js        # Main app component
        └── index.js      # Entry point
```

## Deployment

### Backend

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```

2. Start the production server:
   ```bash
   NODE_ENV=production pm2 start server.js --name "user-management-api"
   ```

### Frontend

1. Build the production version:
   ```bash
   npm run build
   ```

2. Serve the static files using a web server like Nginx or Apache.

## Environment Variables

Create a `.env` file in the backend directory:

```
PORT=5000
NODE_ENV=development
DATABASE_URL=./database.sqlite
```

## Testing

To be implemented...

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [SQLite](https://www.sqlite.org/)
- [Tailwind CSS](https://tailwindcss.com/)
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

## API Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a single user
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Project Structure

```
user-management-dashboard/
├── backend/
│   ├── database.js
│   ├── server.js
│   └── routes/
│       └── users.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── pages/
│       │   ├── UserList.js
│       │   └── UserForm.js
│       ├── App.js
│       └── index.js
└── README.md
```

## Available Scripts

### Backend

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon

### Frontend

- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run build` - Build for production

## Future Improvements

1. **Authentication & Authorization**: Add user login and role-based access control
2. **Pagination**: Implement server-side pagination for the users list
3. **Search & Filtering**: Add search and filter functionality
4. **User Profile**: Add user profile pages with more details
5. **Email Verification**: Add email verification for new users
6. **File Upload**: Allow users to upload profile pictures
7. **Export Data**: Add functionality to export user data to CSV/Excel
8. **Dark Mode**: Add dark mode support

## License

This project is open source and available under the [MIT License](LICENSE).
