import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ClerkModule } from './clerk/clerk.module';


@Module({
  imports: [ MongooseModule.forRoot(MONGODB_URI), ClerkModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
