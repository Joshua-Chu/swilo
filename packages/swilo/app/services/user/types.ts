import { selectUserSchema, userSchema } from "@/services/user/schema";
import z from "zod";

export const userSchemaForValidation = selectUserSchema;
export type UserRoleType = typeof userSchema.$inferSelect.role;
export type UserType = z.infer<typeof selectUserSchema>;
