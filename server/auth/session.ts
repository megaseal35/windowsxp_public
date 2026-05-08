import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import mysql from "mysql2";
import { SESSION_SECRET } from "../config";
import { dbConfig } from "../db";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const MySQLStore = MySQLStoreFactory(session);

const sessionPool = mysql.createPool({ ...dbConfig, connectionLimit: 2 });

const store = new MySQLStore(
  {
    createDatabaseTable: true,
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: ONE_WEEK_MS,
  },
  sessionPool,
);

declare module "express-session" {
  interface SessionData {
    admin?: boolean;
    userId?: number;
    username?: string;
  }
}

export const sessionMiddleware = session({
  name: "blog_session",
  secret: SESSION_SECRET,
  store,
  resave: false,
  saveUninitialized: false,
  rolling: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_WEEK_MS,
  },
});
