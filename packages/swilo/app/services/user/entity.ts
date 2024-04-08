import {
  userSchemaForValidation,
  type UserRoleType,
  type UserType,
} from "@/services/user/types";
import { ZodError } from "zod";

type ValidatedFields =
  | "id"
  | "firstName"
  | "lastName"
  | "email"
  | "password"
  | "role";

export class UserEntityValidationError extends Error {
  private errors: Record<ValidatedFields, string | undefined>;

  constructor(errors: Record<ValidatedFields, string | undefined>) {
    super("An error occured validating a user entity");
    this.errors = errors;
  }

  getErrors() {
    return this.errors;
  }
}

export class UserEntity {
  private id: number;
  private firstName: string | null;
  private lastName: string | null;
  private email: string;
  private password: string;
  private role: UserRoleType;

  constructor({ id, firstName, lastName, email, role, password }: UserType) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.role = role;

    this.validate();
  }

  private validate() {
    try {
      userSchemaForValidation.parse(this);
    } catch (err) {
      const error = err as ZodError;
      const errors = error.flatten().fieldErrors;
      throw new UserEntityValidationError({
        id: errors.id?.[0],
        firstName: errors.firstName?.[0],
        lastName: errors.lastName?.[0],
        email: errors.email?.[0],
        password: errors.password?.[0],
        role: errors.role?.[0],
      });
    }
  }
}
