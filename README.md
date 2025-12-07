# 🚗 Vehicle Management System

A complete backend system for managing vehicles, users, and bookings.
Includes authentication, role-based authorization (Admin / Customer), secure booking handling, and vehicle availability tracking.

> **Live URL:** `https://vehicle-manage-system.vercel.app/`

---

## 📌 Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access (Admin, Customer)
- Secure password hashing with **bcrypt**

### 🚘 Vehicle Management

- Add, update, delete vehicles (Admin only)
- View all or single vehicle
- Automatic availability control

### 👤 User Management

- Admin can manage all users
- Users can update their own profile
- Safety checks prevent deleting users with active bookings

### 📅 Booking System

- Booking creation with date validation
- Automatic price calculation (`daily_rate × duration`)
- Prevents double booking or unavailable vehicles
- Admin can mark bookings as returned
- Auto-return system (if implemented in your code)

### 🛠 Additional Highlights

- Built with **TypeScript**
- Error-handled Express API
- PostgreSQL database via **pg**
- Environment-based configuration with **dotenv**

---

## 🧰 Technology Stack

| Category             | Technology                                    |
| -------------------- | --------------------------------------------- |
| **Backend Runtime**  | Node.js                                       |
| **Framework**        | Express (v5)                                  |
| **Language**         | TypeScript                                    |
| **Database**         | PostgreSQL                                    |
| **Auth**             | JWT, bcryptjs                                 |
| **Dev Tools**        | ts-node, tsx, TypeScript, nodemon/ts-node-dev |
| **Environment**      | dotenv                                        |
| **API Architecture** | RESTful                                       |

---

## 📂 Project Structure (Suggested)

```
src/
 ├── controllers/
 ├── middleware/
 ├── models/
 ├── routes/
 ├── utils/
 ├── server.ts
 └── config/
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/your-username/vehicle-management-system.git
cd vehicle-management-system
```

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Create `.env` File

Add environment variables such as:

```
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret_key
```

### 4️⃣ Start Development Server

```sh
npm run dev
```

### 5️⃣ Build for Production

```sh
npm run build
node dist/server.js
```

---

## 🚀 API Endpoints

### 🔐 Authentication

| Method | Endpoint              | Access | Description         |
| ------ | --------------------- | ------ | ------------------- |
| POST   | `/api/v1/auth/signup` | Public | Register new user   |
| POST   | `/api/v1/auth/signin` | Public | Login & receive JWT |

---

### 🚘 Vehicles

| Method | Endpoint                      | Access | Description         |
| ------ | ----------------------------- | ------ | ------------------- |
| POST   | `/api/v1/vehicles`            | Admin  | Add new vehicle     |
| GET    | `/api/v1/vehicles`            | Public | Get all vehicles    |
| GET    | `/api/v1/vehicles/:vehicleId` | Public | Get vehicle details |
| PUT    | `/api/v1/vehicles/:vehicleId` | Admin  | Update vehicle      |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin  | Delete vehicle      |

---

### 👤 Users

| Method | Endpoint                | Access        | Description   |
| ------ | ----------------------- | ------------- | ------------- |
| GET    | `/api/v1/users`         | Admin         | Get all users |
| PUT    | `/api/v1/users/:userId` | Admin / Owner | Update user   |
| DELETE | `/api/v1/users/:userId` | Admin         | Delete user   |

---

### 📅 Bookings

| Method | Endpoint                      | Access         | Description                |
| ------ | ----------------------------- | -------------- | -------------------------- |
| POST   | `/api/v1/bookings`            | Customer/Admin | Create booking             |
| GET    | `/api/v1/bookings`            | Role-based     | Admin: all / Customer: own |
| PUT    | `/api/v1/bookings/:bookingId` | Role-based     | Cancel or mark returned    |

---

## ▶️ Usage Example (API Requests)

### Login

```json
POST /api/v1/auth/signin
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Create Booking

```json
POST /api/v1/bookings
{
  "vehicleId": 1,
  "startDate": "2025-01-05",
  "endDate": "2025-01-10"
}
```

---

## 🐛 Troubleshooting

| Issue               | Solution                            |
| ------------------- | ----------------------------------- |
| DB connection error | Check `DATABASE_URL` in `.env`      |
| JWT not working     | Make sure `JWT_SECRET` is set       |
| TypeScript errors   | Run `npm run build` to verify types |
| CORS issues         | Adjust CORS settings in middleware  |

---

## 👥 Contributors

- Add your name or GitHub link here
  Example: **Your Name (@your-github)**

---

## 📄 License

Licensed under the **ISC License**.
