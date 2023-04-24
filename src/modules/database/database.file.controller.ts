import { Controller, Get, HttpCode, Param, ParseIntPipe, Res, StreamableFile } from "@nestjs/common";
import { Readable } from "typeorm/platform/PlatformTools";
import { DatabaseFileService } from "./database.file.service";
import { Response } from "express";
import { Public } from "../auth/auth.decorator";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DocumentFileSwagger } from "documentation/document.file.docs";

// https://wanago.io/2021/11/01/api-nestjs-storing-files-postgresql-database/

@ApiTags(DocumentFileSwagger.tag)
@Controller("database-file")
export class DatabaseFileController {
  constructor(private readonly databaseFileService: DatabaseFileService) {}

  @Public()
  @ApiOperation({ summary: "Получение фотографии по айди" })
  @ApiResponse({ status: 200, description: "Фотография в виде stream", type: StreamableFile })
  @Get(":id")
  @HttpCode(200)
  async getDatabaseFileById(@Param("id", ParseIntPipe) id: number, @Res({ passthrough: true }) response: Response) {
    const file = await this.databaseFileService.getFileById(id);
    const stream = Readable.from(file.data);

    response.set({
      "Content-Disposition": `inline; filename="${file.filename}"`,
      "Content-Type": "image"
    });

    return new StreamableFile(stream);
  }
}
