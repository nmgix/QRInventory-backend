import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseFilters, UseInterceptors } from "@nestjs/common";
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
  async getAllItems() {
    return this.itemService.getAll();
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

  @Roles(UserRoles.ADMIN)
  @Post("create")
  @ApiOperation({ summary: "Создание предмета в БД" })
  @ApiResponse({ status: 201, description: "Созданный предмет", type: Item })
  @HttpCode(201)
  async createItem(@Body() dto: CreateItemDTO) {
    return this.itemService.create(dto);
  }

  @Roles(UserRoles.ADMIN)
  @Post("edit")
  @ApiOperation({ summary: "Изменение предмета в БД" })
  @ApiResponse({ status: 200, description: "Созданный предмет", type: Item })
  @HttpCode(200)
  async editItem(@Body() dto: EditItemDTO) {
    return this.itemService.update(dto);
  }

  @Roles(UserRoles.ADMIN, UserRoles.TEACHER)
  @Post("image")
  @ApiOperation({ summary: "Загрузка фотографии предмета" })
  @ApiQuery({ name: "id", description: "Id предмета" })
  @ApiResponse({ status: 201, description: "Сообщение об успешной загрузке фотографии" })
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(201)
  async addImage(@Query("id") id: string, @UploadedFile() file: Express.Multer.File) {
    const result = await this.itemService.addImage(id, file.buffer, file.originalname);
    return {
      message: `Фотография загружена, id: ${result.id}`
    };
  }

  @Roles(UserRoles.ADMIN)
  @Delete(":searchString")
  @ApiOperation({ summary: "Удаление предмета по id или артикулу" })
  @ApiResponse({ status: 200, description: "Статус удален ли предмет или не найден" })
  @HttpCode(200)
  async deleteItem(@Param("searchString") searchString: string) {
    const result = await this.itemService.deleteBy(searchString);
    return {
      message: ItemErrors[result.affected > 0 ? "item_deleted" : "item_not_found"]
    };
  }
}
