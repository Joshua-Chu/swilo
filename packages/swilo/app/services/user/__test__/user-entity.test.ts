import { UserEntity, UserEntityValidationError } from "@/services/user/entity";
import { UserRoleType } from "@/services/user/types";
import { describe, expect, it } from "vitest";

const mockUser = {
  id: 1,
  firstName: "Rubber",
  lastName: "Duck",
  email: "Rubber@Duck.com",
  role: "admin" as UserRoleType,
  password: "superSecret",
};

describe("UserEntity", () => {
  it("throws error when validation is satisfied.", () => {
    expect(
      () =>
        new UserEntity({
          ...mockUser,
          firstName: "",
        })
    ).toThrow(UserEntityValidationError);
  });

  it("creates new User Entity if validation is successful", () => {
    expect(
      () =>
        new UserEntity({
          ...mockUser,
        })
    ).not.toThrow(UserEntityValidationError);
  });
});
