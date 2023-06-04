import { Exclude, Expose } from "class-transformer";
import {
  Equals,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  isStrongPassword,
  Length,
  Matches
} from "class-validator";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { UserErrors } from "./user.i18n";
import { ApiProperty } from "@nestjs/swagger";
import { Institution } from "../institution/institution.entity";
import Image from "../database/image.entity";
import { uuidRegexp } from "../../helpers/formatErrors";
import { IsPasswordValid } from "../../helpers/passwordValid";

export enum UserRoles {
  ADMIN = "admin",
  TEACHER = "teacher"
}

// const fullNameRegexp = /^([а-яА-ЯёЁ]{2,}\s([а-яА-ЯёЁ]{2,})\s?([а-яА-ЯёЁ]{1,})?)$/;
const fullNameRegexp =
  /^[А-ЯЁ][а-яё]+([-][А-ЯЁ][а-яё]+)?\s[А-ЯЁ][а-яё]+([-][А-ЯЁ][а-яё]+)?(\s[А-ЯЁ][а-яё]+([-][А-ЯЁ][а-яё]+)?)?$/;

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
  @ManyToOne(() => Institution, institution => institution.teachers, {
    nullable: true,
    cascade: true
  })
  teacherInstitution: Institution;

  @OneToOne(() => Image, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "avatarId" })
  avatar: Image;

  @Column({ nullable: true })
  avatarId?: number;

  // lastRecoveredPassword: Date
}

export class CreateUserDTO {
  @ApiProperty({ description: "ФИО" })
  @IsNotEmpty({ message: UserErrors.fullname_empty })
  @IsString({ message: UserErrors.fullname_string })
  @Matches(fullNameRegexp, { message: UserErrors.user_fullname_regexp })
  @Length(7, 40, { message: UserErrors.user_fullname_length })
  fullName: string;

  @ApiProperty()
  @IsNotEmpty({ message: UserErrors.email_empty })
  @IsEmail({}, { message: UserErrors.email_not_email })
  email: string;

  @ApiProperty()
  @IsString({ message: UserErrors.password_string })
  // @IsStrongPassword({ minLength: 8 }, { message: UserErrors.password_weak })
  @IsPasswordValid({ message: UserErrors.password_invalid_format })
  @Length(8, 30, { message: UserErrors.user_password_length })
  password: string;

  @ApiProperty()
  @IsString({ message: UserErrors.insitution_string })
  @Matches(uuidRegexp, { message: UserErrors.user_teacher_institution_id_regexp })
  teacherInstitution: string;
}

export class UpdateUserDTO {
  @ApiProperty({ description: "ФИО", required: false })
  @IsOptional()
  @IsNotEmpty({ message: UserErrors.fullname_empty })
  @IsString({ message: UserErrors.fullname_string })
  @Matches(fullNameRegexp, { message: UserErrors.user_fullname_regexp })
  @Length(7, 40, { message: UserErrors.user_fullname_length })
  fullName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty({ message: UserErrors.email_empty })
  @IsEmail({}, { message: UserErrors.email_not_email })
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: UserErrors.password_string })
  @Length(8, 30, { message: UserErrors.user_password_length })
  oldPassword?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: UserErrors.password_string })
  // @IsStrongPassword({ minLength: 8 }, { message: UserErrors.password_weak })
  @IsPasswordValid({ message: UserErrors.password_invalid_format })
  @Length(8, 30, { message: UserErrors.user_password_length })
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
