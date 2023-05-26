import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString, Length, Matches } from "class-validator";
import { uuidRegexp } from "helpers/formatErrors";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Institution } from "../institution/institution.entity";
import { Item } from "../item/item.entity";
import { User } from "../user/user.entity";
import { CabinetErrors } from "./cabinet.i18n";

const cabinetNumbetRegexp = /^[а-яА-ЯёЁ0-9]+(-[а-яА-ЯёЁ0-9]+)*$/;

@Entity()
export class Cabinet {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty()
  @Column()
  cabinetNumber: string;

  @ApiProperty({ type: [User], uniqueItems: true })
  @ManyToMany(() => User, user => user.id, { cascade: true, eager: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable()
  teachers: User[];

  @ApiProperty({ type: [Item], uniqueItems: true })
  @ManyToMany(() => Item, item => item.id, { cascade: true, eager: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable()
  items: Item[];

  @Exclude()
  @ApiProperty({ type: () => Institution, uniqueItems: true })
  @ManyToOne(() => Institution, institution => institution.cabinets)
  institution: Institution;
}

export class AddTeachersDTO {
  @ApiProperty()
  @IsString({ message: CabinetErrors.cabinet_uuid_string })
  @Matches(uuidRegexp, { message: CabinetErrors.cabinet_uuid_regexp })
  cabinetId: string;

  @ApiProperty({ type: [String] })
  @IsArray({ message: CabinetErrors.cabinet_field_array })
  @IsString({ message: CabinetErrors.cabinet_teachers, each: true })
  teachersId: string[];
}

export class EditCabinetDTO {
  @ApiProperty()
  @IsString({ message: CabinetErrors.cabinet_id_string })
  @Matches(uuidRegexp, { message: CabinetErrors.cabinet_id_regexp })
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: CabinetErrors.cabinet_institution_string })
  @Matches(uuidRegexp, { message: CabinetErrors.cabinet_institution_regexp })
  institution?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: CabinetErrors.cabinet_number_string })
  @Matches(cabinetNumbetRegexp, { message: CabinetErrors.cabinet_number_regexp })
  @Length(1, 10, { message: CabinetErrors.cabinet_number_length })
  cabinetNumber?: string;

  @ApiProperty({ type: [String], required: false, uniqueItems: true })
  @IsOptional()
  @IsArray({ message: CabinetErrors.cabinet_field_array })
  @IsString({ message: CabinetErrors.cabinet_teachers, each: true })
  teachers?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray({ message: CabinetErrors.cabinet_field_array })
  @IsString({ message: CabinetErrors.cabinet_items, each: true })
  items?: string[];
}

export class CreateCabinetDTO {
  @ApiProperty()
  @IsNotEmpty({ message: CabinetErrors.cabinet_institution_empty })
  @IsString({ message: CabinetErrors.cabinet_institution_string })
  @Matches(uuidRegexp, { message: CabinetErrors.cabinet_institution_regexp })
  institution: string;

  @ApiProperty()
  @IsNotEmpty({ message: CabinetErrors.cabinet_number_empty })
  @IsString({ message: CabinetErrors.cabinet_number_string })
  @Matches(cabinetNumbetRegexp, { message: CabinetErrors.cabinet_number_regexp })
  @Length(1, 10, { message: CabinetErrors.cabinet_number_length })
  cabinetNumber: string;

  @ApiProperty({ type: [String], required: false, uniqueItems: true })
  @IsOptional()
  @IsArray({ message: CabinetErrors.cabinet_field_array })
  @IsString({ message: CabinetErrors.cabinet_teachers, each: true })
  teachers?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray({ message: CabinetErrors.cabinet_field_array })
  @IsString({ message: CabinetErrors.cabinet_items, each: true })
  items?: string[];
}
