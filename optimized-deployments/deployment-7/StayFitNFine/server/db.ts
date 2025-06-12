import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Create database connection
const connection = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root", 
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "stayfitnfine",
  connectionLimit: 10,
});

export const db = drizzle(connection);
export { connection };