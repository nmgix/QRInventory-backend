import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { AuthErrors } from "./auth.i18n";

export class AuthLoginDTO {
  @IsNotEmpty({ message: AuthErrors.id_empty })
  @IsNumber({ allowInfinity: false, maxDecimalPlaces: 3000, allowNaN: false }, { message: AuthErrors.id_number })
  id: number;
  @IsNotEmpty({ message: AuthErrors.password_empty })
  @IsString({ message: AuthErrors.password_empty })
  password: string;
}
