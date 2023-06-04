import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class SupportMailService {
  constructor(private readonly mailerService: MailerService) {}

  //   async resetPasswordRequest(email: string, institutionName: string) {
  //     const request = await this.mailerService.sendMail({
  //       to: `${process.env.MAIL}@${process.env.DOMAIN}`,
  //       from: `${process.env.MAIL}@${process.env.DOMAIN}`,
  //       subject: "Заявка на восстановление пароля",
  //       text: `Почта запрашивающего: ${email}, учреждение: ${institutionName}`,
  //       html: `<div><p>Почта запрашивающего: ${email}</p><p>Учреждение: ${institutionName}</p></div>`
  //     });
  //     return
  //   }
  async resetPasswordResponse(
    fio: string,
    requestDate: Date,
    nextAvailableRequestDate: Date,
    emailTo: string,
    password: string
  ) {
    let requestDateFormatted = requestDate.toLocaleDateString("ru", {
      day: "numeric",
      weekday: "long",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric"
    });
    let nextAvailableRequestDateFormatted = nextAvailableRequestDate.toLocaleDateString("ru", {
      day: "numeric",
      weekday: "long",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric"
    });

    const request = await this.mailerService.sendMail({
      to: `${emailTo}`,
      from: `${process.env.MAIL}@${process.env.DOMAIN}`,
      //   from: adminEmail,
      subject: "Восстановление пароля",
      text: `Добрый день, дорогой(ая) ${fio}, вы произвели запрос на восстановление пароля от аккаунта: ${requestDateFormatted}. Ваша почта: ${emailTo}, ваш новый пароль: ${password}. Следующее восстановление пароля будет доступно: ${nextAvailableRequestDateFormatted}`,
      html: `
      <div>
        <h3>Добрый день, дорогой(ая) ${fio}</h3>
        <p>Вы произвели запрос на восстановление пароля от аккаунта: <b>${requestDateFormatted}</b>.</p>
        <p>Ваша почта: <b>${emailTo}</b>, ваш новый пароль: <b>${password}</b>.</p>
        <p>Следующее восстановление пароля будет доступно: <b>${nextAvailableRequestDateFormatted}</b>.</p>
      </div>`
    });
    return request;
  }
}
