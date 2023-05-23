import { ApiProperty } from "@nestjs/swagger";
import { Equals, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Institution } from "modules/institution/institution.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Image from "../database/image.entity";
import { ItemErrors } from "./item.i18n";

@Entity()
export class Item {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  @ApiProperty({ description: "Артикул предмета", example: "Ш-508" })
  article: string;

  @ApiProperty()
  @Column()
  @ApiProperty({ description: "Название предмета", example: "Стул обыкновенный" })
  name: string;

  @ApiProperty({ type: () => Institution })
  @ManyToOne(() => Institution, insitution => insitution.items)
  institution: Institution;

  @OneToOne(() => Image, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "imageId" })
  image: Image;

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

  @ApiProperty()
  @IsNotEmpty({ message: ItemErrors.insitution_exists })
  @IsString({ message: ItemErrors.institution_string })
  institution: string;
}

export class EditItemDTO {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: ItemErrors.article_string })
  article?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: ItemErrors.name_string })
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: ItemErrors.institution_string })
  institution?: string;

  @Equals(undefined, { message: ItemErrors.cant_pass_imageId })
  imageId?: number;
  @Equals(undefined, { message: ItemErrors.cant_pass_image })
  image?: string;
}
