import { Exclude, Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { IsPasswordValid } from '../../helpers/passwordValid';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserErrors } from './user.i18n';

export enum UserRoles {
  ADMIN = 'admin',
  TEACHER = 'teacher',
}

export class FullName {
  @IsNotEmpty({ message: UserErrors.surname_empty })
  @IsString({ message: UserErrors.surname_string })
  surname: string;
  @IsNotEmpty({ message: UserErrors.name_empty })
  @IsString({ message: UserErrors.name_string })
  name: string;
  @IsNotEmpty({ message: UserErrors.patronymic_empty })
  @IsString({ message: UserErrors.patronymic_string })
  patronymic: string;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-json')
  fullName: FullName;

  @Column({
    type: 'enum',
    enum: UserRoles,
    default: UserRoles.TEACHER,
  })
  role: UserRoles;

  @Exclude({ toPlainOnly: true })
  @Column()
  password: string;
}

export class UserDTO {
  id: string;

  @IsNotEmpty({ message: UserErrors.fullname_empty })
  @ValidateNested()
  @Type(() => FullName)
  fullName: FullName;

  role: UserRoles;

  @IsPasswordValid()
  @IsString({ message: UserErrors.password_string })
  password: string;
}
