import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
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
  @IsNumber({ allowInfinity: false, maxDecimalPlaces: 3000, allowNaN: false })
  @Column({ unique: true })
  cabinetNumber: number;

  @ApiProperty({ type: [User], uniqueItems: true })
  @ManyToMany(() => User, user => user.id, { cascade: true, eager: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable()
  teachers: User[];

  @ApiProperty({ type: [Item], uniqueItems: true })
  @ManyToMany(() => Item, item => item.id, { cascade: true, eager: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable()
  items: Item[];
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
  @IsNumber({ allowInfinity: false, maxDecimalPlaces: 3000, allowNaN: false })
  cabinetNumber?: number;

  @ApiProperty({ type: [String], required: false, uniqueItems: true })
  teachers?: string[];

  @ApiProperty({ type: [String], required: false })
  items?: string[];
}

export class CreateCabinetDTO {
  @ApiProperty()
  @IsNumber({ allowInfinity: false, maxDecimalPlaces: 3000, allowNaN: false })
  cabinetNumber?: number;

  @ApiProperty({ type: [String], required: false, uniqueItems: true })
  teachers?: string[];

  @ApiProperty({ type: [String], required: false })
  items?: string[];
}
