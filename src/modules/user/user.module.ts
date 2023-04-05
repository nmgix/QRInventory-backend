import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CabinetModule } from '../cabinet/cabinet.module';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CabinetModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
