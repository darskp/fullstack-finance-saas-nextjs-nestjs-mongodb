import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';
import { ChatDto } from './dto/chat.dto';
import { ClerkAuthGuard } from '../clerk/clerk-auth.guard';
import { CurrentUser } from '../clerk/current-user.decorator';

@Controller('api/ai-chat')
@UseGuards(ClerkAuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post()
  async handleChat(@Body() body: ChatDto, @CurrentUser() user: any) {
    return this.aiChatService.handleMessage(body.message, user.id, body.payload);
  }
}
