import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ClerkModule } from './clerk/clerk.module';
import { IncomeModule } from './users/income/income/income.module';


@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI!), ClerkModule, IncomeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
