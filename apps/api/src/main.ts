import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app/app.module';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: true, credentials: true });
  const preferredPort = parseInt(process.env['PORT'] || '3333', 10);
  const fallbackPort = preferredPort === 3333 ? 3334 : preferredPort + 1;
  try {
    await app.listen(preferredPort);
    console.log(`API listening on http://localhost:${preferredPort}`);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === 'EADDRINUSE' && preferredPort === 3333) {
      await app.listen(fallbackPort);
      console.log(`Port 3333 in use; API listening on http://localhost:${fallbackPort}`);
      console.log('To use the dashboard proxy, set "target" in apps/dashboard/proxy.conf.json to this port.');
    } else {
      throw err;
    }
  }
}

bootstrap();
