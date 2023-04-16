import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import DatabaseFile from "./database.file.entity";
import { DatabaseFileErrors } from "./database.file.i18n";

@Injectable()
export class DatabaseFileService {
  constructor(
    @InjectRepository(DatabaseFile)
    private databaseFilesRepository: Repository<DatabaseFile>
  ) {}

  async uploadDatabaseFile(dataBuffer: Buffer, filename: string) {
    const newFile = await this.databaseFilesRepository.create({
      filename,
      data: dataBuffer
    });
    await this.databaseFilesRepository.save(newFile);
    return newFile;
  }

  async getFileById(fileId: number) {
    const file = await this.databaseFilesRepository.findOne({ where: { id: fileId } });
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  async deteleFileById(fileId: number) {
    const deleteResult = await this.databaseFilesRepository.delete({ id: fileId });
    if (!deleteResult.affected) {
      throw new NotFoundException(DatabaseFileErrors.file_not_found);
    }
    return true;
  }
}
