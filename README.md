# Coffee Shop POS System

## Project Overview

This project is a full-stack Point of Sale (POS) system designed for a coffee shop. It's built to be a simple yet robust platform for managing a cafe's operations, including a categorized menu, user roles, order management, and real-time sales analytics. The system features a clear separation of concerns with dedicated dashboards for administrators and waiters.

## Key Features

  - **User Authentication:** Secure login system with JWT (JSON Web Tokens) and bcrypt for password hashing.
  - **Role-Based Access Control:** Differentiates between `admin` and `waiter` roles, with restricted access to administrative functions.
  - **Admin Dashboard:** A powerful control panel for administrators to manage:
      - User accounts (add, edit, delete)
      - Menu items (create, update, delete)
      - Menu categories
      - Tables
      - View daily and weekly sales statistics, along with a profit chart.
  - **Waiter Interface:** A streamlined interface for waiters to:
      - Create new orders for specific tables.
      - View and manage their own orders.
      - Update and delete order items.
  - **Database Management:** Uses **SQLite3** for a lightweight, file-based database that is easy to set up and manage locally.
  - **RESTful API:** A well-structured API built with Express.js to handle all backend logic and data communication.
  - **React Frontend:** A dynamic and responsive user interface built with React, styled with Tailwind CSS for a clean and modern look.

## Technology Stack

  - **Backend:**

      - **Node.js:** The JavaScript runtime environment.
      - **Express.js:** The web application framework for building the API.
      - **SQLite3:** The database system.
      - **bcryptjs:** For secure password hashing.
      - **jsonwebtoken:** For handling JWT-based authentication.
      - **cors:** For enabling cross-origin requests between the front-end and back-end.

  - **Frontend:**

      - **React.js:** For building the user interface.
      - **Axios:** A promise-based HTTP client for API requests.
      - **Tailwind CSS:** A utility-first CSS framework for styling.
      - **Chart.js:** For visualizing sales and profit data.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

  - Node.js (v14 or higher)
  - npm (Node Package Manager)

### 1\. Backend Setup

Navigate to the `servers` directory in your terminal.

```bash
# Navigate to the backend directory
cd servers

# Install the required npm packages
npm install

# Start the server
npm start
```

The server will automatically create a `coffee_shop.db` file and a default admin user with the following credentials:

  - **Username:** `admin`
  - **Password:** `admin123`

The server will be running on `http://localhost:5000`.

### 2\. Frontend Setup

Open a **new** terminal window, navigate to the `front-end` directory, and start the React development server.

```bash
# Navigate to the frontend directory
cd front-end

# Install the required npm packages
npm install

# Start the React development server
npm start
```

The frontend application will open in your browser at `http://localhost:3000`.

### 3\. Usage

  - **Login:** Use the default admin credentials (`admin` / `admin123`) to log in.
  - **Admin Panel:** As an admin, you can navigate the sidebar to manage users, menu items, categories, and tables. You can also view sales statistics and profits.
  - **Waiters:** Create additional users with the `waiter` role from the admin panel to test the waiter-specific features.

## Project Structure

```
.
├── servers/
│   ├── db.js             # Database setup and connection (if separated)
│   ├── menu.js           # Menu-related API routes (if separated)
│   ├── orders.js         # Order-related API routes (if separated)
│   ├── users.js          # User-related API routes (if separated)
│   ├── coffee_shop.db    # The SQLite database file
│   ├── package.json
│   └── server.js         # Main backend application file
│
└── front-end/
    ├── node_modules/
    ├── public/
    ├── src/
    │   ├── api.js         # Axios instance with auth interceptor
    │   ├── App.js         # Main application component
    │   ├── components/
    │   │   ├── Admin/
    │   │   │   ├── Categoris.jsx
    │   │   │   ├── MenuItems.jsx
    │   │   │   ├── TablesManagement.jsx
    │   │   │   └── Users.jsx
    │   │   ├── Waiter/
    │   │   │   ├── Orders.jsx
    │   │   │   ├── AdminPanel.js
    │   │   │   ├── CashierPanel.js
    │   │   │   ├── KitchenPanel.js
    │   │   │   ├── Login.js
    │   │   │   └── NavBar.js
    │   │   └── WaiterPanel.jsx
    │   ├── index.js
    │   ├── index.css
    │   └── styles.css    # Tailwind CSS output
    ├── package.json
    └── README.md
```

-----
