import { Body, ClassSerializerInterceptor, Controller, Delete, FileTypeValidator, Get, HttpCode, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Query, Req, UploadedFile, UseFilters, UseInterceptors } from "@nestjs/common";
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
  @ApiOperation({ summary: "Получение всех предметов" })
  @ApiResponse({ status: 200, description: "Найденые предметы", type: [Item] })
  @HttpCode(200)
  async getAllItems(@Req() req: AuthedRequest) {
    return this.itemService.getAll(req.user.id);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Получение предмета по айди либо артикулу" })
  @ApiResponse({ status: 200, description: "Найденый предмет", type: Item })
  @ApiQuery({ name: "id", description: "id получаемого предмета", required: false })
  @ApiQuery({ name: "article", description: "article получаемого предмета", required: false })
  @HttpCode(200)
  async getById(@Query("id") id?: string, @Query("article") article?: string) {
    return this.itemService.getBy(id, article);
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Post("create")
  @ApiOperation({ summary: "Создание предмета в БД" })
  @ApiResponse({ status: 201, description: "Созданный предмет", type: Item })
  @HttpCode(201)
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
  @HttpCode(201)
  async addImage(
    @Query("id") id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), new FileTypeValidator({ fileType: ".(png|jpeg|jpg|gif)" })]
      })
    )
    file: Express.Multer.File,
    @Req() req: AuthedRequest
  ) {
    const result = await this.itemService.addImage(req.user.id, id, file.buffer, file.originalname);
    return {
      message: `Фотография загружена, id: ${result.id}`
    };
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Delete(":searchString")
  @ApiOperation({ summary: "Удаление предмета по id или артикулу" })
  @ApiResponse({ status: 200, description: "Статус удален ли предмет или не найден" })
  @HttpCode(200)
  async deleteItem(@Param("searchString") searchString: string, @Req() req: AuthedRequest) {
    const result = await this.itemService.deleteBy(req.user.id, searchString);
    return {
      message: ItemErrors[result.affected > 0 ? "item_deleted" : "item_not_found"]
    };
  }
}
