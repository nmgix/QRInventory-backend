import { Request } from "express";
import { UserRoles } from "../user/user.entity";

export type UserRequestData = { id: string; role: UserRoles };
export type AuthedRequest = Request & { user: UserRequestData };
export enum Tokens {
  access_token = "access_token",
  refresh_token = "refresh_token"
}
