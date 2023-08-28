import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as Express from 'express';
import * as cors from 'cors';
import { ExpressAdapter } from '@nestjs/platform-express';

const server = Express();
server.use(cors());
server.get('/', (req, res) => res.send('ok'));
server.get('/_ah/health', (req, res) => res.send('ok'));
server.get('/_ah/start', (req, res) => res.send('ok'));


async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
