import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "../db/schema.js";
import z from "zod";

const baseUserSchema = createInsertSchema(usersTable, {
  email: z.email("Invalid email format"),
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
});

export const registerUserSchema = baseUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isPremium: true,
});
export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object({
  email: z.email()
});
export type loginUserInput = z.infer<typeof loginUserSchema>;