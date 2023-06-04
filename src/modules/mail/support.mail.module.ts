import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { SupportMailService } from "./support.mail.service";

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: "mail.hosting.reg.ru",
          secure: true,
          port: 465,
          auth: {
            user: `${process.env.MAIL}@${process.env.DOMAIN}`,
            pass: process.env.MAIL_PASSWORD
          }
        },
        defaults: {
          from: `"QRInventory Support" <${process.env.MAIL}@${process.env.DOMAIN}>`
        }
      })
    })
  ],
  providers: [SupportMailService],
  controllers: [],
  exports: [SupportMailService]
})
export class SupportMailModule {}
