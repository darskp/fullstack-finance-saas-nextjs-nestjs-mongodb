import { Injectable, BadRequestException } from "@nestjs/common";
import { Webhook } from "svix";
import { WebhookEvent } from "./interfaces/webhook-event.interface";
import { ClerkUserCreatedDto } from "./dto/webhook-payload.dto";

@Injectable()
export class ClerkService {

  async verifyWebhook(
    body: string | Buffer,
    headers: Record<string, string>
  ): Promise<WebhookEvent> {

    const secret = process.env.CLERK_WEBHOOK_SECRET!;
    const wh = new Webhook(secret);

    try {
      return wh.verify(body, headers) as WebhookEvent;
    } catch {
      throw new BadRequestException("Invalid webhook signature");
    }
  }

  async handleEvent(event: WebhookEvent) {

    console.log("Webhook verified");
    console.log("Event:", event.type);

    if (event.type === "user.created") {

      const user = event.data as ClerkUserCreatedDto;

      console.log("New User:", {
        clerkId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
      });

    }
  }
}