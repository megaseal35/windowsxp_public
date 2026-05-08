import type { RowDataPacket } from "mysql2/promise";
import { pool } from "../db";

export interface User {
  id: number;
  username: string;
  passwordHash: string;
  isAdmin: boolean;
}

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  is_admin: number;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    isAdmin: row.is_admin === 1,
  };
}

export async function findAdminByUsername(username: string): Promise<User | null> {
  const [rows] = await pool.query<UserRow[]>(
    `SELECT id, username, password_hash, is_admin
     FROM users
     WHERE username = ? AND is_admin = TRUE
     LIMIT 1`,
    [username.trim().toLowerCase()],
  );
  return rows.length === 0 ? null : rowToUser(rows[0]);
}
