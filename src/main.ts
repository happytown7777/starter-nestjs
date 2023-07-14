import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  // app.enableCors({
  //   methods: ["GET", "POST", "PUT", "DELETE"],
  //   origin: 'http://localhost:3000',
  //   credentials: true,
  // });
  // await app.listen(8000);
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: 'http://haruhana.com/',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
