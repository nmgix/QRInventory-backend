import { Exclude, Expose, Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserErrors } from "./user.i18n";
import { ApiProperty } from "@nestjs/swagger";
import { Institution } from "../institution/institution.entity";
import DatabaseFile from "../database/database.file.entity";

export enum UserRoles {
  ADMIN = "admin",
  TEACHER = "teacher"
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

  @ApiProperty()
  @Column()
  fullName: string;

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

  @OneToMany(() => Institution, institution => institution.admin)
  institutions: Institution[];

  @OneToOne(() => DatabaseFile, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "avatarId" })
  avatar: DatabaseFile;

  @Column({ nullable: true })
  avatarId?: number;
}

export class CreateUserDTO {
  @ApiProperty({ description: "ФИО" })
  @IsNotEmpty({ message: UserErrors.fullname_empty })
  @IsString({ message: UserErrors.fullname_string })
  fullName: string;

  @ApiProperty()
  @IsNotEmpty({ message: UserErrors.email_empty })
  @IsEmail({}, { message: UserErrors.email_not_email })
  email: string;

  @ApiProperty()
  @IsString({ message: UserErrors.password_string })
  password: string;
}

export class UpdateUserDTO {
  @ApiProperty({ description: "ФИО" })
  @IsOptional()
  @IsNotEmpty({ message: UserErrors.fullname_empty })
  @IsString({ message: UserErrors.fullname_string })
  fullName?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty({ message: UserErrors.email_empty })
  @IsEmail({}, { message: UserErrors.email_not_email })
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: UserErrors.password_string })
  oldPassword?: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: UserErrors.password_string })
  newPassword?: string;
}

export type InternalUpdateUserDTO = UpdateUserDTO & { id: string };
