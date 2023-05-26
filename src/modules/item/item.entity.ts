import { ApiProperty } from "@nestjs/swagger";
import { Equals, IsNotEmpty, IsOptional, IsString, isStrongPassword, Length, Matches } from "class-validator";
import { uuidRegexp } from "helpers/formatErrors";
import { Institution } from "modules/institution/institution.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Image from "../database/image.entity";
import { ItemErrors } from "./item.i18n";

const itemArticleRegexp = /^[а-яА-ЯёЁ0-9]+(-[а-яА-ЯёЁ0-9]+)*$/;
const nameRegexp = /^(([а-яА-ЯёЁ0-9]+)\s?)*$/;

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
  @Matches(itemArticleRegexp, { message: ItemErrors.item_article_regexp })
  @Length(7, 40, { message: ItemErrors.item_article_length })
  article: string;

  @ApiProperty()
  @IsNotEmpty({ message: ItemErrors.name_empty })
  @IsString({ message: ItemErrors.name_string })
  @Matches(nameRegexp, { message: ItemErrors.item_name_regexp })
  @Length(5, 40, { message: ItemErrors.item_name_length })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: ItemErrors.insitution_exists })
  @IsString({ message: ItemErrors.institution_string })
  @Matches(uuidRegexp, { message: ItemErrors.item_institution_regexp })
  institution: string;
}

export class EditItemDTO {
  @ApiProperty()
  @Matches(uuidRegexp, { message: ItemErrors.item_id_regexp })
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: ItemErrors.article_string })
  @Matches(itemArticleRegexp, { message: ItemErrors.item_article_regexp })
  @Length(7, 40, { message: ItemErrors.item_article_length })
  article?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: ItemErrors.name_string })
  @Matches(nameRegexp, { message: ItemErrors.item_name_regexp })
  @Length(5, 40, { message: ItemErrors.item_name_length })
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: ItemErrors.institution_string })
  @Matches(uuidRegexp, { message: ItemErrors.item_institution_regexp })
  institution?: string;

  @Equals(undefined, { message: ItemErrors.cant_pass_imageId })
  imageId?: number;
  @Equals(undefined, { message: ItemErrors.cant_pass_image })
  image?: string;
}
