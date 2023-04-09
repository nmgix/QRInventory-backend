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
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsEmail()
  @Column({ unique: true })
  email: string;

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
  // @Expose({ groups: ["role:teacher", "role:admin"] })
  @Expose({ groups: ["expose"] })
  @Exclude({ toPlainOnly: true })
  @Column({ type: "varchar" })
  password: string;

  @ApiProperty({ required: false })
  // @Expose({ groups: ["role:teacher", "role:admin"] })
  @Expose({ groups: ["expose"] })
  @Column({ nullable: true })
  refreshToken: string;
}

export class CreateUserDTO {
  @ApiProperty()
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
