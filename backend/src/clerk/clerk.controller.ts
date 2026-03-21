import { Controller, Post, Body, Headers, BadRequestException, Req } from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { ClerkService } from "./clerk.service";
import type { WebhookEvent, WebhookResponse } from "./interfaces/webhook-event.interface";

@Controller("api/clerk/webhooks")
export class ClerkController {

    constructor(private readonly clerkService: ClerkService) { }

    @Post("register")
    async registerWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Body() body: WebhookEvent,
        @Headers("svix-id") svixId: string,
        @Headers("svix-timestamp") svixTimestamp: string,
        @Headers("svix-signature") svixSignature: string,
    ): Promise<WebhookResponse> {
        if (!svixId || !svixTimestamp || !svixSignature) {
            throw new BadRequestException("Missing Svix webhook headers");
        }

        if (!req.rawBody) {
            throw new BadRequestException("Raw body not found");
        }
        const payload = req.rawBody.toString();
        // console.log("payload", payload);

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