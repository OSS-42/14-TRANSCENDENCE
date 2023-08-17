import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,
  }),
  );

  const config = new DocumentBuilder()
  .setTitle('Transcendence APi')
  .setDescription('the description of the API')
  .setVersion('1.0')
  .addTag('auth')
  .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT', // Specify the bearer format
  })
  .build()

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/', app, document);
  app.enableCors({origin: ['http://localhost:3000',"https://api.intra.42.fr/"],
  credentials: true,});
  await app.listen(3001);
}
bootstrap();
