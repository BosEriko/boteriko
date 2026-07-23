import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  
  app.enableCors({ origin: true });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Import and mount existing Express app at root
  const routes = require('../config/routes.js');
  app.use(routes.express);

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, '0.0.0.0');
  console.log(`✅ Connected to API Server. PORT: ${PORT}`);

  routes.socket(app.getHttpServer());
}
if (require.main === module) {
  bootstrap();
}
