// Define types without Drizzle dependencies
export interface User {
  id: string;
  age?: number;
  username: string;
  passwordHash: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

// Table names for our mock implementation
export const TableNames = {
  USER: "user",
  SESSION: "session",
} as const;

// These help replicate the table reference structure used in the original code
export const user = {
  id: "id",
  age: "age",
  username: "username",
  passwordHash: "password_hash",
};

export const session = {
  id: "id",
  userId: "user_id",
  expiresAt: "expires_at",
};
