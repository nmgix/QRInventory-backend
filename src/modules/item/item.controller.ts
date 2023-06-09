import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseFilters,
  UseInterceptors
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../roles/roles.decorator";
import { UserRoles } from "../user/user.entity";
import { ItemSwagger } from "../../documentation/item.docs";
import { Public } from "../auth/auth.decorator";
import { GlobalException } from "../../helpers/global.exceptions";
import { ItemErrors } from "./item.i18n";
import { ItemService } from "./item.service";
import { CreateItemDTO, EditItemDTO, Item } from "./item.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthedRequest } from "modules/auth/types";

@ApiTags(ItemSwagger.tag)
@Controller("item")
@UseFilters(new GlobalException(ItemErrors.item_query_fail, ItemErrors.item_query_fail, ItemErrors.item_not_found))
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Get("all")
  @HttpCode(200)
  @ApiOperation({ summary: "Получение всех предметов" })
  @ApiQuery({ name: "institution", required: true, description: "Учреждение по которому искать (id)" })
  @ApiQuery({ name: "take", required: false, description: "Сколько записей взять" })
  @ApiQuery({ name: "skip", required: false, description: "Сколько записей пропустить" })
  @ApiResponse({ status: 200, description: "Найденые предметы", type: [Item] })
  async getAllItems(@Req() req: AuthedRequest, @Query() { take, skip }, @Query("institution") institution: string) {
    const [data, total] = await this.itemService.getAll(req.user.id, institution, take, skip);
    return {
      items: data,
      total
    };
  }

  @Public()
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: "Получение всех подходящих предметов по айди либо артикулу" })
  @ApiQuery({ name: "institution", description: "id учреждения", required: false })
  @ApiQuery({ name: "id", description: "id получаемого предмета", required: false })
  @ApiQuery({ name: "article", description: "article получаемого предмета", required: false })
  @ApiQuery({ name: "take", required: false, description: "Сколько записей взять" })
  @ApiQuery({ name: "skip", required: false, description: "Сколько записей пропустить" })
  @ApiResponse({ status: 200, description: "Найденые предметы", type: Item })
  async findItems(@Query() { take, skip }, @Query("institution") institution?: string, @Query("id") id?: string, @Query("article") article?: string) {
    const [data, total] = await this.itemService.findMatching(institution, take, skip, id, article);

    if (id) {
      return data[0];
    } else {
      return {
        items: data,
        total
      };
    }
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Post("create")
  @ApiOperation({ summary: "Создание предмета в БД" })
  @ApiResponse({ status: 201, description: "Созданный предмет", type: Item })
  @HttpCode(200)
  async createItem(@Body() dto: CreateItemDTO, @Req() req: AuthedRequest) {
    return this.itemService.create(req.user.id, dto);
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Patch("edit")
  @ApiOperation({ summary: "Изменение предмета в БД" })
  @ApiResponse({ status: 200, description: "Созданный предмет", type: Item })
  @HttpCode(200)
  async editItem(@Body() dto: EditItemDTO, @Req() req: AuthedRequest) {
    return this.itemService.update(req.user.id, dto);
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Post("image")
  @ApiOperation({ summary: "Загрузка фотографии предмета" })
  @ApiQuery({ name: "id", description: "Id предмета" })
  @ApiResponse({ status: 201, description: "Сообщение об успешной загрузке фотографии" })
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(200)
  async addImage(
    @Query("id") id: string,
    @Req() req: AuthedRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }), new FileTypeValidator({ fileType: ".(png|jpeg|jpg|gif)" })],
        fileIsRequired: false
      })
    )
    file?: Express.Multer.File
  ) {
    const result = await this.itemService.addImage(req.user.id, id, file?.buffer, file?.originalname);

    if (!result) return { message: "Фотография удалена" };

    return {
      message: `Фотография загружена, id: ${result.id}`
    };
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Delete(":id")
  @ApiOperation({ summary: "Удаление предмета по id" })
  @ApiResponse({ status: 200, description: "Статус удален ли предмет или не найден" })
  @HttpCode(200)
  async deleteItem(@Param("id") id: string, @Req() req: AuthedRequest) {
    const result = await this.itemService.deleteBy(req.user.id, id);
    return {
      message: ItemErrors[result.affected > 0 ? "item_deleted" : "item_not_found"]
    };
  }
}
