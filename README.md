# fullstack-finance-saas-nextjs-nestjs-mongodb

Hosted Link: [Live Demo](https://expense-tracker-darswebdev.vercel.app/sign-in) <br />

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Requirements](#requirements)
- [Installation and Usage](#installation-and-usage)
- [Architecture and Approach](#architecture-and-approach)
- [Future Improvements](#future-improvements)
- [Self-Evaluation](#self-evaluation)

## Introduction
This **Full-stack SaaS Finance Dashboard** is a comprehensive solution for managing personal finances. Built with modern web technologies, it allows users to track income and expenses, visualize financial data through interactive charts, and ensure secure data handling with industry-standard authentication.

## Features
- **Secure Authentication**: Integration with **Clerk** for robust user management.
- **Financial Tracking**: Full CRUD functionality for incomes and expenses.
- **Data Visualization**: Real-time analytics using **Highcharts**.
- **Modern UI**: Clean, responsive design with **Shadcn/UI** and **Tailwind CSS**.
- **User Synchronization**: Automated user data syncing between Clerk and MongoDB via webhooks.

## Technologies Used

### Frontend
- **Next.js 15+ (App Router)**
- **React 19**
- **Tailwind CSS 4**
- **Clerk (Auth)**
- **Highcharts**
- **Shadcn/UI & Radix UI**
- **Lucide Icons**
- **Axios**

### Backend
- **NestJS 11**
- **MongoDB & Mongoose**
- **Clerk Backend SDK**
- **Svix (Webhook Verification)**
- **Class-validator & Class-transformer**

## Requirements
- **Node.js** >= 18
- **npm** or **yarn**
- **MongoDB Atlas** or local instance

## Installation and Usage

### 1. Clone the repository
```bash
git clone https://github.com/darskp/fullstack-finance-saas-nextjs-nestjs-mongodb.git && cd finance-saas
```

### 2. Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on provided keys (Clerk, MongoDB).
4. Start the server: `npm run start:dev`

### 3. Frontend Setup
1. Navigate to the frontend folder: `cd ../frontend`
2. Install dependencies: `npm install`
3. Create a `.env.local` file with backend URL and Clerk keys.
4. Start the app: `npm run dev`

### 4. Open the App
The app will be available at `http://localhost:3000`.

## Architecture and Approach
- **State Management**: Using modern React hooks and Next.js built-in state management for a streamlined approach.
- **API Communication**: The frontend interacts with a NestJS REST API using Axios.
- **Database**: MongoDB serves as the persistent storage layer, managed via Mongoose schemas.
- **Security**: Authentication is handled by Clerk, ensuring secure access and metadata management.
- **Scalability**: The modular NestJS architecture provides a solid foundation for enterprise-level features.

## Future Improvements
- **AI Chatbot Integration**: Implement an advanced AI assistant to help users perform CRUD operations (e.g., "Add an income of $200 for freelance work yesterday") and provide predictive financial analysis and insights to help you analyze your spending habits.
- **Multi-Currency Support**: Support for multiple global currencies.
- **Budgeting Feature**: Set monthly limits and receive notifications.

## Self-Evaluation

**Evaluation Summary**:  
This project is a powerful, production-ready finance management tool that combines a fast React frontend with a scalable NestJS backend. It focuses on user experience, real-time analytics, and secure data handling.

**Good**:
- Clean, modular NestJS architecture.
- Real-time data visualization with Highcharts.
- Robust user authentication and data syncing.
- Sleek UI with Tailwind CSS 4 and Dark mode.

**Areas for Improvement**:
- Implementation of more complex filtering (e.g., date range, category groups).
- Unit and E2E testing for the entire flow.

**Critique**:
- The current transaction form could be optimized for faster entry (e.g., batch uploads).
- Error handling can be improved with more descriptive toast notifications.

**Technology Rating**:

| Technology      | Rating (out of 10) |
|-----------------|-------------------|
| Next.js         | 9.5/10             |
| NestJS          | 9/10               |
| MongoDB         | 8.5/10             |
| Tailwind CSS    | 10/10              |
