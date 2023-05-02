import { Equals, IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Cabinet } from "../cabinet/cabinet.entity";
import { User } from "../user/user.entity";
import { InstitutionErrors } from "./institution.i18n";
import { Item } from "modules/item/item.entity";

@Entity()
export class Institution {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ type: () => [Cabinet], uniqueItems: true, description: "Все кабинеты этого колледжа" })
  @OneToMany(() => Cabinet, cabinet => cabinet.institution)
  cabinets: Cabinet[];

  @ApiProperty()
  @OneToMany(() => Item, item => item.institution)
  items: Item[];

  @ApiProperty()
  @OneToMany(() => User, user => user.teacherInstitution)
  teachers: User[];

  @ApiProperty({ type: () => [User], description: "Все админы, относящиеся к этому колледжу" })
  @ManyToOne(() => User, user => user.institutions, { onDelete: "NO ACTION" })
  admin: User;
}

export class CreateInstitutionDTO {
  @ApiProperty()
  @IsNotEmpty({ message: InstitutionErrors.name_empty })
  @IsString({ message: InstitutionErrors.name_string })
  name: string;
}

export class EditInstitutionDTO {
  @ApiProperty()
  @IsString()
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
  name?: string;

  @Equals(undefined, { message: InstitutionErrors.cant_pass_admin })
  admin: string;
  @Equals(undefined, { message: InstitutionErrors.cant_pass_cabinets })
  cabinets: any[];
}
