Here's the `README.md` with placeholders for your screenshots:

```markdown
# Transaction Management API

Welcome to the Transaction Management API! This project lets you manage your financial transactions (like income and expenses) while securing access with user authentication through JWT tokens. You can register users, log in, and perform all CRUD operations on transactions. It's built with Node.js, Express, and SQLite, making it lightweight and simple to use.

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)

## Setup Instructions

### 1. Clone the repository
First, you'll need to clone this repository to your local machine:

```bash
git clone https://github.com/Rohit-Palavanchu/flowwaibackend
cd flowwaibackend
```

### 2. Install dependencies
Make sure you have Node.js installed. Then, install the required packages:

```bash
npm install
```

### 3. Set up the environment
You'll need to create a `.env` file at the root of your project to store your environment variables. Here's a sample:

```
JWT_SECRET=your_jwt_secret
PORT=3000
```

Feel free to change `JWT_SECRET` to something more secure.

### 4. Initialize the database
The project uses SQLite, so you don't need a separate database server. The database schema will be automatically created when the app starts, but you can manually initialize it by running the following SQL commands:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK( type IN ('income', 'expense') ) NOT NULL
);

CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT CHECK( type IN ('income', 'expense') ) NOT NULL,
    category INTEGER NOT NULL,
    amount REAL NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    userId INTEGER,
    FOREIGN KEY (category) REFERENCES categories(id),
    FOREIGN KEY (userId) REFERENCES users(id)
);
```

You can also fill the `categories` table with some default data like:

```sql
INSERT INTO categories (name, type) VALUES ('Salary', 'income'), ('Rent', 'expense');
```

### 5. Running the Application

To start the server, simply run:

```bash
npm start
```

By default, the server will run on `http://localhost:3000`, but you can change the port by setting the `PORT` environment variable in your `.env` file.

## API Documentation

### Authentication
The API uses JWT tokens for securing routes. After registering and logging in, you'll receive a token that should be sent in the `Authorization` header as a `Bearer` token for all protected routes.

### Endpoints

#### 1. Register a User
**POST** `/transaction/register`

Create a new user account.

**Body**:
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response**:
- `201 Created`: User registered successfully.
- `400 Bad Request`: Username or password missing, or user already exists.

#### _Screenshot:_
![User Registration Screenshot](https://github.com/user-attachments/assets/94d07e22-e93d-435a-8a94-e8da08abe405)

---

#### 2. Login
**POST** `/transaction/login`

Authenticate and get a JWT token.

**Body**:
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response**:
- `200 OK`: Login successful, returns a JWT token.
- `401 Unauthorized`: Invalid username or password.

#### _Screenshot:_
![Login Page Screenshot](https://github.com/user-attachments/assets/b320fea5-936f-4a78-ae3b-d1dec6e78f75)
---

#### 3. Add a Transaction (Protected)
**POST** `/transaction/transactions`

Add a new transaction (income or expense).

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Body**:
```json
{
  "type": "expense",
  "category": 1,
  "amount": 500,
  "date": "2024-10-22",
  "description": "Groceries"
}
```

**Response**:
- `201 Created`: Transaction added successfully.
- `400 Bad Request`: Missing or invalid data.

#### _Screenshot:_
![Add Transaction Screenshot](https://github.com/user-attachments/assets/d9c86832-c570-4b62-b1d7-ef4c4fac3a65)

---

#### 4. Get All Transactions (Protected, with Pagination)
**GET** `/transaction/transactions?page=1&limit=10`

Retrieve all transactions with optional pagination.

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
- `200 OK`: Returns a list of transactions.
- `500 Internal Server Error`: Issue retrieving transactions.

#### _Screenshot:_
![Get Transactions Screenshot](https://github.com/user-attachments/assets/c9d525cf-ed3c-484d-be69-4d42723a7277)

---

#### 5. Get a Transaction by ID (Protected)
**GET** `/transaction/transactions/:id`

Retrieve a single transaction by its ID.

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
- `200 OK`: Returns the transaction details.
- `404 Not Found`: Transaction not found.

#### _Screenshot:_
![Transaction Detail Screenshot](https://github.com/user-attachments/assets/98048dbd-ff6a-4cc1-ac4f-6594ad123ef7)

---

#### 6. Update a Transaction (Protected)
**PUT** `/transaction/transactions/:id`

Update an existing transaction by its ID.

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Body**:
```json
{
  "type": "expense",
  "category": 2,
  "amount": 250,
  "date": "2024-10-23",
  "description": "Updated description"
}
```

**Response**:
- `200 OK`: Transaction updated successfully.
- `404 Not Found`: Transaction not found.

#### _Screenshot:_
![Update Transaction Screenshot](https://github.com/user-attachments/assets/0f8d7c06-1364-4431-980e-f0bbb411380e)
---

#### 7. Delete a Transaction (Protected)
**DELETE** `/transaction/transactions/:id`

Delete a transaction by its ID.

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
- `200 OK`: Transaction deleted successfully.
- `404 Not Found`: Transaction not found.

#### _Screenshot:_
![Delete Transaction Screenshot](https://github.com/user-attachments/assets/c9be753f-7efe-47f1-a9ec-75a9965212ee)

---

#### 8. Transaction Summary (Protected)
**GET** `/transaction/summary`

Retrieve a summary of your transactions, such as total income, total expenses, and balance. You can filter by date or category.

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
- `200 OK`: Returns the transaction summary.
- `500 Internal Server Error`: Issue retrieving the summary.

#### _Screenshot:_
![Transaction Summary Screenshot](https://github.com/user-attachments/assets/aede4525-53a2-488a-91bb-844c124fd2d6)



---
## Notes
- Ensure that you handle your JWT tokens securely. Do not expose them in client-side code.
- Adjust the database settings and environment variables as needed for production use.

### Example Token Usage
In every API call after login, pass the token like this:

```
Authorization: Bearer <JWT_TOKEN>
```

That's it! You're ready to manage your transactions 🚀. Feel free to expand this API or customize it to your needs.
```
