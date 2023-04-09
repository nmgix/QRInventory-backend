import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { UserErrors } from "../user/user.i18n";
import { AuthErrors } from "./auth.i18n";

export class AuthLoginDTO {
  @ApiProperty()
  @IsNotEmpty({ message: UserErrors.email_empty })
  @IsEmail({}, { message: UserErrors.email_not_email })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: AuthErrors.password_empty })
  @IsString({ message: AuthErrors.password_empty })
  password: string;
}
