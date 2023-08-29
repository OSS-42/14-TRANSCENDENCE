import {  Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { PongModule } from './pong/pong.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MulterModule } from '@nestjs/platform-express';



@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true
  }) ,
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'uploads'),
  }),
  MulterModule.register({
    dest: join(__dirname, '..', 'uploads'),
  }),
  AuthModule, 
  UserModule,
  PrismaModule,
  ChatModule,
  PongModule],
})
export class AppModule {}
