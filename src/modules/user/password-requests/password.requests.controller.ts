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
  UseFilters,
  UseGuards
} from "@nestjs/common";
import * as dayjs from "dayjs";
import { getRandomValues } from "crypto";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserSwagger } from "documentation/user.docs";
import { GlobalException } from "helpers/global.exceptions";
import { Public } from "modules/auth/auth.decorator";
import { AuthService } from "modules/auth/auth.service";
import { Roles } from "modules/roles/roles.decorator";
import { User, UserRoles } from "../user.entity";
import { UserErrors } from "../user.i18n";
import { UserService } from "../user.service";
import { PasswordRequestErrors, PasswordRequestMessages } from "./password.requests.i18n";
import { PasswordRequestsService } from "./password.requests.service";
import { CreateTicketDTO } from "./ticket.entity";
import { AdminInstitutionGuard, InstitutionExistsGuard } from "./password.requests.guards";
import { SupportMailService } from "modules/mail/support.mail.service";
import { dateDiff } from "helpers/dates";

// https://stackoverflow.com/questions/50438986/how-to-create-nested-routes-with-parameters-using-nestjs

@ApiTags(UserSwagger.subtag)
@Controller("user/tickets/:institutionId")
@UseGuards(InstitutionExistsGuard)
@UseFilters(
  new GlobalException(
    UserErrors.user_data_input_error,
    UserErrors.user_data_input_error,
    UserErrors.user_not_found
  )
)
// тут должна быть middleware что учреждение существует
export class PasswordRequestsController {
  constructor(
    private passwordRequestService: PasswordRequestsService,
    private userService: UserService,
    private authService: AuthService,
    private supportMailService: SupportMailService
  ) {}

  @Roles(UserRoles.ADMIN)
  @Get("all")
  @UseGuards(AdminInstitutionGuard)
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

  @Roles(UserRoles.ADMIN)
  @Get(":id")
  @UseGuards(AdminInstitutionGuard)
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

  @Public()
  @Post("/create")
  @HttpCode(200)
  @ApiBody({
    type: CreateTicketDTO,
    description: "Почта учителя, администратору её сменить нельзя"
  })
  @ApiOperation({ summary: "Создание нового тикета" })
  @ApiResponse({ status: 200, description: "Новый тикет" })
  async createTicket(@Param("institutionId") institutionId: string, @Body() dto: CreateTicketDTO) {
    const [data, total] = await this.userService.get(institutionId, 1, 0, dto.email);
    const user: User = data[0];
    if (!user) throw new BadRequestException(UserErrors.user_not_found);

    let currentDate = new Date();
    let datesDifference = dateDiff(currentDate, user.nextAvailableRequestDate);
    if (user.nextAvailableRequestDate.getTime() > currentDate.getTime())
      throw new BadRequestException(
        PasswordRequestErrors.request_denied_available_date +
          (datesDifference > 1
            ? `. Доступно через ${datesDifference} дня.`
            : datesDifference === 1
            ? ". Доступно завтра."
            : ". Доступно сегодня, попробуйте позже.")
      );

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

  // тут должна быть middleware что к выбраному учрждению у администратора есть доступ (middleware с services)
  @Roles(UserRoles.ADMIN)
  @Delete(":id")
  @UseGuards(AdminInstitutionGuard)
  @HttpCode(200)
  @ApiParam({ name: "id", description: "Id учреждения", type: String })
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

  // тут должна быть middleware что к выбраному учрждению у администратора есть доступ (middleware с services)
  @Roles(UserRoles.ADMIN)
  @UseGuards(AdminInstitutionGuard)
  @HttpCode(200)
  @Post(":id/approve")
  @ApiParam({ name: "id", description: "Id учреждения", type: String })
  @ApiOperation({ summary: "Удаление существующего тикета" })
  @ApiResponse({ status: 200 })
  async approveRequest(@Param("institutionId") institutionId: string, @Param("id") id: string) {
    const existingTicket = await this.passwordRequestService.getTicket(institutionId, id);
    if (!existingTicket) throw new BadRequestException(PasswordRequestErrors.ticket_not_found);
    let [data, total] = await this.userService.get(institutionId, 1, 0, existingTicket.email);
    let user: User = data[0];
    if (!user) {
      await this.passwordRequestService.deleteTicket(existingTicket.id);
      throw new BadRequestException(UserErrors.user_not_found + ", запрос удалён");
    }

    const newPassword = getRandomValues(new BigUint64Array(1))[0].toString(36);
    try {
      await this.authService.internalUpdatePassword({ id: user.id, password: newPassword });
    } catch (error) {
      throw new Error(PasswordRequestErrors.password_not_updated);
    }

    let nextDate = dayjs();
    let nextAvailableRequestDate = nextDate.add(3, "days").toDate();
    await this.passwordRequestService.deleteTicket(existingTicket.id);
    await this.userService.update(user.id, { nextAvailableRequestDate });

    let mail = await this.supportMailService.resetPasswordResponse(
      user.fullName,
      existingTicket.created_date,
      nextAvailableRequestDate,
      user.email,
      newPassword
    );

    return { message: PasswordRequestMessages.password_updated };
  }
}
