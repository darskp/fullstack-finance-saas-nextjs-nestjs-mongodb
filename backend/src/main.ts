import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mongoose from 'mongoose';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    //means the pipe will apply to all controllers and routes globally.
    new ValidationPipe(
      // It validates DTO classes
      {
        whitelist:true, //🔐 Prevents unwanted or malicious fields.
        forbidNonWhitelisted:true, //👉 Instead of silently removing extra fields, it throws an error.
        transform:true,//👉 Automatically converts request data to the DTO type.
      }
    )
  )

  app.setGlobalPrefix('api');

  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3001';

  app.enableCors({
    origin: allowedOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend is running on: http://localhost:${port}/api`);


  mongoose.connection.once('open', () => {
    console.log("MongoDB connected successfully 🚀");
  });
}
bootstrap();
