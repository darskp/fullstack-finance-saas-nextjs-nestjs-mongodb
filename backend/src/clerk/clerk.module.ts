import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClerkService } from './clerk.service';
import { ClerkController } from './clerk.controller';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ClerkController],
  providers: [ClerkService],
})
export class ClerkModule { }
