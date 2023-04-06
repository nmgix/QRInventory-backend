import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../modules/user/user.entity';
import { Cabinet } from '../cabinet/cabinet.entity';
import { Item } from '../item/item.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host:
          configService.get('NODE_ENV') === 'development'
            ? 'localhost'
            : configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [User, Cabinet, Item],
        synchronize: true,
        // migrationsRun: true,
        // migrations: ['dist/modules/database/migrations/*{.ts,.js}'],
      }),
    }),
  ],
})
export class DatabaseModule {}

export const TypeOrmTestingModule = () => [
  ConfigModule.forRoot({ envFilePath: ['.env'], isGlobal: true }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      host:
        configService.get('NODE_ENV') === 'development'
          ? 'localhost'
          : configService.get('POSTGRES_TEST_HOST'),
      port: configService.get('POSTGRES_TEST_PORT'),
      username: configService.get('POSTGRES_TEST_USER'),
      password: configService.get('POSTGRES_TEST_PASSWORD'),
      database: configService.get('POSTGRES_TEST_DB'),
      entities: [User, Cabinet, Item],
      synchronize: true,
    }),
  }),
  TypeOrmModule.forFeature([User, Cabinet, Item]),
];
