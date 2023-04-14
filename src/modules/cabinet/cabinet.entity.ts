import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IsArray, isArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Institution } from "../../institution/institution.entity";
import { Item } from "../item/item.entity";
import { User } from "../user/user.entity";
import { CabinetErrors } from "./cabinet.i18n";

@Entity()
export class Cabinet {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty()
  @IsNotEmpty({ message: CabinetErrors.cabinet_number_empty })
  @IsString({ message: CabinetErrors.cabinet_number_string })
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
  cabinetId: string;
  @ApiProperty({ type: [String] })
  teachersId: string[];
}

export class EditCabinetDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: CabinetErrors.cabinet_institution_string })
  institution?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: CabinetErrors.cabinet_number_string })
  cabinetNumber?: string;

  @ApiProperty({ type: [String], required: false, uniqueItems: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teachers?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  items?: string[];
}

export class CreateCabinetDTO {
  @ApiProperty()
  @IsNotEmpty({ message: CabinetErrors.cabinet_institution_empty })
  @IsString({ message: CabinetErrors.cabinet_institution_string })
  institution: string;

  @ApiProperty()
  @IsNotEmpty({ message: CabinetErrors.cabinet_number_empty })
  @IsString({ message: CabinetErrors.cabinet_number_string })
  cabinetNumber: string;

  @ApiProperty({ type: [String], required: false, uniqueItems: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teachers?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  items?: string[];
}
