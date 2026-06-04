# MyClinic

A clinic appointment booking system with separate patient and admin portals.

## Overview

MyClinic is a full-stack web application for managing healthcare appointments. Patients can book appointments, view their appointment history, and manage their profiles. Administrators can manage doctors, availability, appointments, and patient records.

## Features

### Patient Portal
- User registration and authentication
- Book appointments with available doctors
- View appointment history (upcoming, past, cancelled)
- Personal profile management with appointment statistics
- Visual analytics with charts and graphs

### Admin Portal
- Dashboard with clinic analytics and metrics
- Manage all appointments across all doctors
- Manage doctor profiles and availability
- Block time slots or entire days for doctors
- View patient records and appointment history
- Advanced filtering by date, time, service, and doctor

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication with bcryptjs
- CORS for cross-origin requests
- Validator for input validation

### Frontend
- Next.js 16 with React 19
- Tailwind CSS 4 for styling
- Shadcn/ui components with Radix UI
- Recharts for data visualization
- Axios for API requests
- date-fns for date handling
- Lucide React for icons
- Sonner for toast notifications

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd MyClinic
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory using `.env.example` as reference:

```env
MONGODB_URI=mongodb://localhost:27017/myclinic
PORT=5000
JWT_SECRET=your-secret-key-here
```

Seed the database with initial data:

```bash
node src/config/seed.js
node src/config/seedAdmin.js
```

Start the backend server:

```bash
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd web
npm install
```

Create a `.env.local` file in the web directory using `.env.example` as reference:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on http://localhost:3000

## Default Credentials

After seeding the database, you can log in with:

**Admin Account:**
- Check the output of `seedAdmin.js` for admin credentials

**Patient Account:**
- Register a new account through the signup page


## API Endpoints

### Authentication
- POST `/api/users/register` - Register new patient
- POST `/api/users/login` - Login user

### Appointments
- GET `/api/appointments` - Get appointments (filtered by role)
- POST `/api/appointments` - Create appointment
- PATCH `/api/appointments/:id/cancel` - Cancel appointment

### Doctors
- GET `/api/doctors` - Get all doctors
- GET `/api/doctors/active` - Get active doctors only
- PUT `/api/doctors/:id` - Update doctor (admin only)

### Availability
- GET `/api/availability` - Get doctor availability for a date
- POST `/api/availability/block` - Block time slots (admin only)
- POST `/api/availability/unblock` - Unblock time slots (admin only)

### Patients
- GET `/api/patients` - Get all patients (admin only)
- GET `/api/patients/:id` - Get patient details (admin only)
- PUT `/api/patients/:id/profile` - Update patient profile


