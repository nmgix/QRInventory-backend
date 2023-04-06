import { Exclude, Type } from "class-transformer";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { IsPasswordValid } from "../../helpers/passwordValid";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserErrors } from "./user.i18n";
import { ApiProperty } from "@nestjs/swagger";

export enum UserRoles {
  ADMIN = "admin",
  TEACHER = "teacher"
}

export class FullName {
  @ApiProperty()
  @IsNotEmpty({ message: UserErrors.surname_empty })
  @IsString({ message: UserErrors.surname_string })
  surname: string;
  @ApiProperty()
  @IsNotEmpty({ message: UserErrors.name_empty })
  @IsString({ message: UserErrors.name_string })
  name: string;
  @ApiProperty()
  @IsNotEmpty({ message: UserErrors.patronymic_empty })
  @IsString({ message: UserErrors.patronymic_string })
  patronymic: string;
}

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ type: () => FullName })
  @Column("simple-json")
  fullName: FullName;

  @ApiProperty({ enum: UserRoles })
  @Column({
    type: "enum",
    enum: UserRoles,
    default: UserRoles.TEACHER
  })
  role: UserRoles;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  @Column({ type: "varchar" })
  password: string;
}

export class CreateUserDTO {
  @ApiProperty()
  @IsNotEmpty({ message: UserErrors.fullname_empty })
  @ValidateNested({ each: true })
  @Type(() => FullName)
  fullName: FullName;

  @ApiProperty()
  @IsString({ message: UserErrors.password_string })
  password: string;
}
