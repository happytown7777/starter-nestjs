import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: true,
    credentials: true,
  });

  if (process.argv.includes('--seed')) {
    const seedService = app.get(SeedService);
    await seedService.seedDatabase();
    console.log('Database seeded successfully.');
    return app.close();
  }

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
