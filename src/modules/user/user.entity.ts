import { Exclude, Expose } from "class-transformer";
import { Equals, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserErrors } from "./user.i18n";
import { ApiProperty } from "@nestjs/swagger";
import { Institution } from "../institution/institution.entity";
import Image from "../database/image.entity";

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

  @ApiProperty()
  @OneToMany(() => Institution, institution => institution.admin)
  institutions: Institution[];

  @ApiProperty({ type: () => Institution })
  @ManyToOne(() => Institution, institution => institution.teachers, { nullable: true })
  teacherInstitution: Institution;

  @OneToOne(() => Image, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "avatarId" })
  avatar: Image;

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

  @ApiProperty()
  @IsString({ message: UserErrors.insitution_string })
  teacherInstitution: string;
}

export class UpdateUserDTO {
  @ApiProperty({ description: "ФИО", required: false })
  @IsOptional()
  @IsNotEmpty({ message: UserErrors.fullname_empty })
  @IsString({ message: UserErrors.fullname_string })
  fullName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: UserErrors.email_empty })
  @IsEmail({}, { message: UserErrors.email_not_email })
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: UserErrors.password_string })
  oldPassword?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: UserErrors.password_string })
  newPassword?: string;

  @Equals(undefined, { message: UserErrors.cant_pass_avatarId })
  avatarId: number;
  @Equals(undefined, { message: UserErrors.cant_pass_avatar })
  avatar: string;
  @Equals(undefined, { message: UserErrors.cant_pass_institutions })
  institutions: any[];
  @Equals(undefined, { message: UserErrors.cant_pass_refreshToken })
  refreshToken: string;
  // teacherInstitution: Institution;
}

export type InternalUpdateUserDTO = UpdateUserDTO & { id: string };
