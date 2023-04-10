import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
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

  @Column({ nullable: true, default: null })
  @ApiProperty({ description: "Ссылка на фотографию", required: false })
  image: string;
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
  @IsOptional()
  @IsNotEmpty({ message: ItemErrors.image_string })
  @IsString({ message: ItemErrors.name_string })
  image: string;
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

  @ApiProperty({ required: false })
  @IsString({ message: ItemErrors.name_string })
  image: string;
}
