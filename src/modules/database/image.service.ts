import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Image from "./image.entity";
import { ImageErrors } from "./image.i18n";

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>
  ) {}

  async uploadImage(dataBuffer: Buffer, filename: string) {
    const newFile = await this.imagesRepository.create({
      filename,
      data: dataBuffer
    });
    await this.imagesRepository.save(newFile);
    return newFile;
  }

  async getImageById(fileId: number) {
    const file = await this.imagesRepository.findOne({ where: { id: fileId } });
    if (!file) {
      throw new BadRequestException(ImageErrors.file_not_found);
    }
    return file;
  }

  async deteleImageById(fileId: number) {
    const deleteResult = await this.imagesRepository.delete({ id: fileId });
    if (!deleteResult.affected) {
      throw new BadRequestException(ImageErrors.file_not_found);
    }
    return true;
  }
}
