import { Exclude, Expose, Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from "class-validator";
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

  @ApiProperty()
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @ApiProperty({ type: () => FullName, description: "Фамилия - Имя - Отчество" })
  @Column("simple-json")
  fullName: FullName;

  @ApiProperty({ enum: UserRoles, default: UserRoles.TEACHER })
  @Column({
    type: "enum",
    enum: UserRoles,
    default: UserRoles.TEACHER
  })
  role: UserRoles;

  @ApiProperty()
  @Expose({ groups: ["expose"] })
  @Exclude({ toPlainOnly: true })
  @Column({ type: "varchar" })
  password: string;

  @ApiProperty({ required: false })
  @Expose({ groups: ["expose"] })
  @Column({ nullable: true, default: null })
  refreshToken: string;
}

export class CreateUserDTO {
  @ApiProperty({ description: "Фамилия - Имя - Отчество" })
  @IsNotEmpty({ message: UserErrors.fullname_empty })
  @ValidateNested({ each: true })
  @Type(() => FullName)
  fullName: FullName;

  @ApiProperty()
  @IsNotEmpty({ message: UserErrors.email_empty })
  @IsEmail({}, { message: UserErrors.email_not_email })
  email: string;

  @ApiProperty()
  @IsString({ message: UserErrors.password_string })
  password: string;
}
