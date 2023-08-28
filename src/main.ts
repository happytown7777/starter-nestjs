import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: false,
  });
  // app.enableCors({
  //   // methods: ["GET", "POST", "PUT", "DELETE"],
  //   origin: false,
  //   // credentials: true,
  // });
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
