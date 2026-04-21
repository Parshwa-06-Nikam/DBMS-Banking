# Enterprise Banking & Concurrency Lab

A full-stack database management system (DBMS) project designed to simulate and demonstrate real-world enterprise banking scenarios and database concurrency control.

## Project Overview

This project simulates a banking environment where multiple transactions (Web Transfers, ATM Withdrawals, and Batch processing) occur concurrently. The main goal is to explore transaction isolation levels and observe how a relational database handles concurrent access, locks, and potential deadlocks in a real-world scenario.

## Features

- **Live Balances Dashboard:** View simulated real-time updates for user account balances and active loans.
- **Web Transfer Terminal:** Simulate P2P account transfers. Select different transaction isolation levels (READ COMMITTED, REPEATABLE READ, SERIALIZABLE) to explore concurrency behaviors.
- **ATM Kiosk Simulator:** Simulate cash withdrawals considering multiple constraints (Card status, Daily limits, ATM cash availability, and Account balance) with table and row-level locking.
- **Batch Processing:** Run End-of-Day EMI Batch Processing jobs that interact with numerous accounts simultaneously, enforcing strict consistency.
- **Concurrency & Deadlock Detection:** System execution logs track and display transaction anomalies, lock wait timeouts, and deadlocks in real-time as they occur during concurrent actions.
- **Notifications Inbox:** Simulates an inbox receiving SMS/Email alerts triggered by API transactions.

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Axios, Lucide React icons
- **Backend:** Node.js, Express.js
- **Database:** MySQL (via `mysql2` driver)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) installed on your machine.
- Local or remote running instance of MySQL.

### 1. Database Setup
1. Create a MySQL database for the project.
2. Initialize the schema using the provided SQL initialization scripts located in the backend folder.
3. In the `backend` directory, create a `.env` file with your database credentials (e.g., `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend server should start on `http://localhost:5005`.

### 3. Frontend Setup
Open a new terminal window or tab.
```bash
cd frontend
npm install
npm run dev
```
The frontend should start on standard Vite port (e.g. `http://localhost:5173`). Open the URL in your browser to access the application.

## Learning Objectives
- Understanding ACID properties in practice.
- Testing the differences between **READ COMMITTED**, **REPEATABLE READ**, and **SERIALIZABLE** isolation levels.
- Observing **Locks** (e.g., `FOR UPDATE`) and identifying **Deadlocks** when dealing with competitive resources like an ATM or account balance.
