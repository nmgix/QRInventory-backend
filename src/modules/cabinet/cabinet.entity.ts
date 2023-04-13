import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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
  @Column({ unique: true })
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

  @ApiProperty({ required: false })
  @IsString({ message: CabinetErrors.cabinet_number_string })
  cabinetNumber?: string;

  @ApiProperty({ type: [String], required: false, uniqueItems: true })
  teachers?: string[];

  @ApiProperty({ type: [String], required: false })
  items?: string[];
}

export class CreateCabinetDTO {
  @ApiProperty()
  @IsString({ message: CabinetErrors.cabinet_number_string })
  cabinetNumber?: string;

  @ApiProperty({ type: [String], required: false, uniqueItems: true })
  teachers?: string[];

  @ApiProperty({ type: [String], required: false })
  items?: string[];
}
