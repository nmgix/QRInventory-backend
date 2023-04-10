import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseFilters, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../roles/roles.decorator";
import { UserRoles } from "../user/user.entity";
import { ItemSwagger } from "../../documentation/item.docs";
// import { Csrf } from "ncsrf";
import { Public } from "../auth/auth.decorator";
import { GlobalException } from "../../helpers/GlobalException";
import { ItemErrors } from "./item.i18n";
import { ItemService } from "./item.service";
import { CreateItemDTO, EditItemDTO, Item } from "./item.entity";

@ApiTags(ItemSwagger.tag)
// @Roles(UserRoles.ADMIN)
@UseFilters(new GlobalException(ItemErrors.item_query_fail, ItemErrors.item_query_fail))
@UseInterceptors(ClassSerializerInterceptor)
@Controller("item")
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Public()
  @Get("all")
  @ApiOperation({ summary: "Получение всех предметов" })
  @ApiResponse({ status: 200, description: "Найденые предметы", type: [Item] })
  @HttpCode(200)
  async getAllItems() {
    return this.itemService.getAll();
  }

  @Public()
  @Get(":searchString")
  @ApiOperation({ summary: "Получение предмета по айди либо артикулу" })
  @ApiResponse({ status: 200, description: "Найденый предмет", type: Item })
  @HttpCode(200)
  async getById(@Param() searchString: string) {
    return this.itemService.getBy(searchString);
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

  @Roles(UserRoles.ADMIN)
  @Delete(":searchString")
  @ApiOperation({ summary: "Удаление предмета по id или артикулу" })
  @ApiResponse({ status: 200, description: "Статус удален ли предмет или не найден" })
  @HttpCode(200)
  async deleteItem(@Param() searchString: string) {
    const result = await this.itemService.deleteBy(searchString);
    return {
      message: ItemErrors[result.affected > 0 ? "item_deleted" : "item_not_found"]
    };
  }
}
