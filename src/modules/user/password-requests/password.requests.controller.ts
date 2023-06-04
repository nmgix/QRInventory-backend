import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UseFilters
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserSwagger } from "documentation/user.docs";
import { GlobalException } from "helpers/global.exceptions";
import { AuthedRequest } from "modules/auth/types";
import { InstitutionService } from "modules/institution/institution.service";
import { Roles } from "modules/roles/roles.decorator";
import { User, UserRoles } from "../user.entity";
import { UserErrors } from "../user.i18n";
import { UserService } from "../user.service";
import { PasswordRequestErrors, PasswordRequestMessages } from "./password.requests.i18n";
import { PasswordRequestsService } from "./password.requests.service";
import { CreateTicketDTO } from "./ticket.entity";

// https://stackoverflow.com/questions/50438986/how-to-create-nested-routes-with-parameters-using-nestjs

@ApiTags(UserSwagger.subtag)
@Roles(UserRoles.ADMIN)
@Controller("user/tickets/:institutionId")
@UseFilters(
  new GlobalException(
    UserErrors.user_data_input_error,
    UserErrors.user_data_input_error,
    UserErrors.user_not_found
  )
)
export class PasswordRequestsController {
  constructor(
    private passwordRequestService: PasswordRequestsService,
    // private institutionService: InstitutionService,
    private userService: UserService
  ) {}
  @Get("all")
  @HttpCode(200)
  @ApiOperation({ summary: "Получение всех тикетов учреждения" })
  @ApiParam({ name: "institutionId", description: "Id учреждения", type: String })
  @ApiResponse({ status: 200, description: "Все тикеты" })
  async getAllTickets(@Param("institutionId") institutionId: string) {
    // @Req() req: AuthedRequest,
    const [data, total] = await this.passwordRequestService.getAllInstitutionTickets(institutionId);

    return {
      tickets: data,
      total: total
    };
  }

  @Get(":id")
  @HttpCode(200)
  @ApiParam({ name: "institutionId", description: "Id учреждения", type: String })
  @ApiParam({ name: "id", description: "Id тикета в учреждении", type: String })
  @ApiOperation({ summary: "Получение конкретного тикета" })
  @ApiResponse({ status: 200, description: "Текущий тикет" })
  async getTicket(@Param("institutionId") institutionId: string, @Param("id") id: string) {
    const ticket = await this.passwordRequestService.getTicket(institutionId, id);
    if (!ticket) throw new BadRequestException(PasswordRequestErrors.ticket_not_found);
    return ticket;
  }

  @Post("/create")
  @HttpCode(200)
  @ApiBody({
    type: CreateTicketDTO,
    description: "Почта учителя, администратору её сменить нельзя"
  })
  @ApiOperation({ summary: "Создание нового тикета" })
  @ApiResponse({ status: 200, description: "Новый тикет" })
  async createTicket(@Body() dto: CreateTicketDTO) {
    const [data, total] = await this.userService.get(undefined, 1, 0, dto.email);
    const user: User = data[0];
    if (!user) throw new BadRequestException(UserErrors.user_not_found);

    const existingTicket = await this.passwordRequestService.getTicket(
      user.teacherInstitution.id,
      undefined,
      user.email
    );
    if (existingTicket) throw new BadRequestException(PasswordRequestErrors.ticket_exists);

    const newTicket = await this.passwordRequestService.createTicket(
      user.email,
      user.teacherInstitution.id
    );
    if (!newTicket)
      throw new InternalServerErrorException(
        PasswordRequestErrors.ticket_not_created,
        "Произошла внутренняя ошибка"
      );

    return { message: PasswordRequestMessages.ticket_created + `, аккаунт: ${user.email}` };
  }

  @Delete(":id")
  @HttpCode(200)
  @ApiOperation({ summary: "Удаление существующего тикета" })
  @ApiResponse({ status: 200 })
  async deleteTicket(@Param("id") id: string) {
    const deleteResult = await this.passwordRequestService.deleteTicket(id);

    return {
      message:
        deleteResult.affected === 0
          ? PasswordRequestErrors.ticket_not_found
          : PasswordRequestMessages.ticket_deleted
    };
  }
}
