import { Institution } from "../../institution/institution.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";
import { UserErrors } from "../user.i18n";

@Entity()
export class PasswordRequestTicket {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Institution, institution => institution.tickets, { cascade: true })
  institution: Institution;

  @Column()
  email: string;

  @CreateDateColumn()
  created_date: Date;
}

export class CreateTicketDTO {
  @ApiProperty({ description: "Почта учителя" })
  @IsEmail({}, { message: UserErrors.email_not_email })
  email: string;
}
