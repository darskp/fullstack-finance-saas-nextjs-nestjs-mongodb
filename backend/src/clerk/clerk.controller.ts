import { Controller, Post, Body, Headers, BadRequestException } from "@nestjs/common";
import { ClerkService } from "./clerk.service";
import type { WebhookEvent, WebhookResponse } from "./interfaces/webhook-event.interface";

@Controller("api/clerk/webhooks")
export class ClerkController {

    constructor(private readonly clerkService: ClerkService) { }

    @Post("register")
    async registerWebhook(
        @Body() body: WebhookEvent,
        // @Req() req: Request,
        @Headers("svix-id") svixId: string,
        @Headers("svix-timestamp") svixTimestamp: string,
        @Headers("svix-signature") svixSignature: string,
    ): Promise<WebhookResponse> {
        if (!svixId || !svixTimestamp || !svixSignature) {
            throw new BadRequestException("Missing Svix webhook headers");
        }

        const payload = JSON.stringify(body);
        console.log("payload",payload);
        
        //   const payload = req.rawBody
        const event = await this.clerkService.verifyWebhook(payload, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        });

        const result = await this.clerkService.handleEvent(event as WebhookEvent);

        return {
            success: true,
            message: result.message,
        };
    }
}