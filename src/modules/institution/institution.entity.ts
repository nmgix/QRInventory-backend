import { Equals, IsArray, IsNotEmpty, IsOptional, IsString, Length, Matches } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Cabinet } from "../cabinet/cabinet.entity";
import { User } from "../user/user.entity";
import { InstitutionErrors } from "./institution.i18n";
import { Item } from "modules/item/item.entity";
import { uuidRegexp } from "helpers/formatErrors";

const nameRegexp = /^(([а-яА-ЯёЁ0-9]+)\s?)*$/;

@Entity()
export class Institution {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ApiProperty({ type: () => [Cabinet], uniqueItems: true, description: "Все кабинеты этого колледжа" })
  @OneToMany(() => Cabinet, cabinet => cabinet.institution, { cascade: true })
  cabinets: Cabinet[];

  @ApiProperty()
  @OneToMany(() => Item, item => item.institution, { cascade: true })
  items: Item[];

  @ApiProperty()
  @OneToMany(() => User, user => user.teacherInstitution, { cascade: true })
  teachers: User[];

  @ApiProperty({ type: () => [User], description: "Все админы, относящиеся к этому колледжу" })
  @ManyToOne(() => User, user => user.institutions, { onDelete: "NO ACTION", onUpdate: "CASCADE" })
  admin: User;
}

export class CreateInstitutionDTO {
  @ApiProperty()
  @IsNotEmpty({ message: InstitutionErrors.name_empty })
  @IsString({ message: InstitutionErrors.name_string })
  @Matches(nameRegexp, { message: InstitutionErrors.institution_name_regexp })
  @Length(2, 50, { message: InstitutionErrors.institution_name_length })
  name: string;
}

export class EditInstitutionDTO {
  @ApiProperty()
  @IsString()
  @Matches(uuidRegexp, { message: InstitutionErrors.institution_id_regexp })
  id: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  items: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teachers: string[];

  @ApiProperty()
  @IsOptional()
  @IsString({ message: InstitutionErrors.name_string })
  @Matches(nameRegexp, { message: InstitutionErrors.institution_name_regexp })
  @Length(2, 50, { message: InstitutionErrors.institution_name_length })
  name?: string;

  @Equals(undefined, { message: InstitutionErrors.cant_pass_admin })
  admin: string;
  @Equals(undefined, { message: InstitutionErrors.cant_pass_cabinets })
  cabinets: any[];
}
