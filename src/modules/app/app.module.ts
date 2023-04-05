import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/modules/database/database.module';
import { CabinetModule } from '../cabinet/cabinet.module';
import { ItemModule } from '../item/item.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ['.env'], isGlobal: true }),
    DatabaseModule,
    UserModule,
    CabinetModule,
    ItemModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
