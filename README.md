# Streamify Backend ⚙️

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

This is the backend server for the **Streamify** application. It serves as the robust API providing authentication, user management, and secure integration with GetStream.io for chat and video services.

## 🌐 Live API URL

[Streamify API](https://streamify-ncde.onrender.com)

## ✨ Key Features

- **Secure Authentication:** JWT-based authentication along with Google OAuth via Passport.js.
- **Database:** MongoDB integration using Mongoose for flexible data storage.
- **Robust Security:**
  - `helmet` for setting various HTTP headers.
  - `express-rate-limit` to prevent brute-force attacks.
  - `mongo-sanitize` to prevent NoSQL injection.
  - `hpp` for HTTP parameter pollution prevention.
- **Stream Integration:** Securely generates tokens and syncs users with GetStream.io.
- **Error Handling:** Centralized and consistent API error responses.

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** Passport.js, JSON Web Tokens (JWT), bcryptjs
- **Security:** Helmet, express-rate-limit, mongo-sanitize, cors
- **Third-Party Services:** GetStream.io (Server-side SDK)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or MongoDB Atlas)
- GetStream.io account credentials
- Google Cloud Console Project (for OAuth client ID and secret)

### Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   git clone <repository-url>
   cd Streamify/Streamify-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root of the backend directory and add the following:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET_KEY=your_jwt_secret
   STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5001`.

## 📦 Scripts

- `npm run dev`: Starts the development server using nodemon for hot-reloading.
- `npm start`: Starts the production server.
