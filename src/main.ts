import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001'
        : [
            'https://shelbyboldenphotography.com',
            'https://www.shelbyboldenphotography.com',
          ],
  });
  app.use(cookieParser());
  await app.listen(3000);
}

bootstrap();
