import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Roles } from "../roles/roles.decorator";
import { UserRoles } from "../user/user.entity";
import { ItemSwagger } from "../../documentation/item.docs";
// import { Csrf } from "ncsrf";
import { Public } from "../auth/auth.decorator";

@ApiTags(ItemSwagger.tag)
// @Roles(UserRoles.ADMIN)
// @Csrf()
// @Public()
@Controller("item")
export class ItemController {}
