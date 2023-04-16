import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import DatabaseFile from "../database/database.file.entity";
import { ItemErrors } from "./item.i18n";

@Entity()
export class Item {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  @ApiProperty({ description: "Артикул предмета", example: "Ш-508" })
  article: string;

  @Column()
  @ApiProperty({ description: "Название предмета", example: "Стул обыкновенный" })
  name: string;

  @OneToOne(() => DatabaseFile, { nullable: true })
  @JoinColumn({ name: "imageId" })
  image: DatabaseFile;

  @Column({ nullable: true })
  imageId?: number;
}

export class CreateItemDTO {
  @ApiProperty()
  @IsNotEmpty({ message: ItemErrors.article_empty })
  @IsString({ message: ItemErrors.article_string })
  article: string;

  @ApiProperty()
  @IsNotEmpty({ message: ItemErrors.name_empty })
  @IsString({ message: ItemErrors.name_string })
  name: string;
}

export class EditItemDTO {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  @IsString({ message: ItemErrors.article_string })
  article?: string;

  @ApiProperty({ required: false })
  @IsString({ message: ItemErrors.name_string })
  name: string;
}
