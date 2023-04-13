import { IsNotEmpty, IsString } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Cabinet } from "../modules/cabinet/cabinet.entity";
import { User } from "../modules/user/user.entity";
import { InstitutionErrors } from "./institution.i18n";

@Entity()
export class Institution {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ type: () => [Cabinet], uniqueItems: true, description: "Все кабинеты этого колледжа" })
  @OneToMany(() => Cabinet, cabinet => cabinet.id, { cascade: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  cabinets: Cabinet[];

  @ApiProperty({ type: () => [User], description: "Все админы, относящиеся к этому колледжу" })
  @ManyToOne(() => User, user => user.id, { cascade: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  admin: User;
}

export class CreateInstitutionDTO {
  @IsNotEmpty({ message: InstitutionErrors.name_empty })
  @IsString({ message: InstitutionErrors.name_string })
  name: string;
}
