import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Webhook } from "svix";
import { WebhookEvent } from "./interfaces/webhook-event.interface";
import { ClerkUserCreatedDto } from "./dto/webhook-payload.dto";
import { User } from "../users/schemas/user.schema";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ClerkService {

  constructor(
      private configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  async verifyWebhook(
    body: string | Buffer,
    headers: Record<string, string>
  ): Promise<WebhookEvent> {
    
    const rawSecret = this.configService.get<string>('CLERK_WEBHOOK_SIGNING_SECRET', '');
    const secret = rawSecret.trim();

    if (!secret) {
      console.error("DEBUG: CLERK_WEBHOOK_SIGNING_SECRET is MISSING in environment variables!");
      throw new BadRequestException("Webhook secret configuration missing");
    }

    // Safely log first and last few chars to verify matching Clerk dashboard
    const displaySecret = `${secret.substring(0, 10)}...${secret.substring(secret.length - 4)}`;
    console.log(`DEBUG: Loaded Secret: ${displaySecret}`);

    console.log(`DEBUG: Received Svix-Signature: ${headers['svix-signature']?.substring(0, 15)}...`);
    console.log(`DEBUG: Received Svix-Id: ${headers['svix-id']}`);

    const wh = new Webhook(secret);

    try {
      return wh.verify(body, headers) as WebhookEvent;
    } catch (err) {
      console.error("DEBUG: Webhook verification failed:", err.message);
      console.error("DEBUG: Target Body Length:", typeof body === 'string' ? body.length : body.byteLength);
      throw new BadRequestException(`Invalid webhook signature: ${err.message}`);
    }
  }

  async handleEvent(event: WebhookEvent): Promise<{ message: string }> {

    if (event.type === "user.created") {

      const data = event.data as ClerkUserCreatedDto;

      const email = data.email_addresses?.[0]?.email_address || null;
      let fullName = [data.first_name, data.last_name]
        .filter(Boolean)
        .join(" ");

      if (!fullName && data.username) {
        fullName = data.username;
      }

      if (!fullName) {
        fullName = "Unknown User";
      }

      const imageUrl = data.image_url || null;

      try {
        console.log("DEBUG: Webhook data received:", JSON.stringify(data, null, 2));

        const existingByClerkId = await this.userModel.findOne({ clerkId: data.id });
        if (existingByClerkId) {
          console.log(`User with clerkId ${data.id} already exists`);
          return { message: "User already exists with this Clerk ID" };
        }

        if (email) {
          const existingByEmail = await this.userModel.findOne({ email });
          if (existingByEmail) {
            console.log(`User with email ${email} already exists`);
            return { message: "User already exists with this email" };
          }
        }

        const userPayload: any = {
           clerkId: data.id,
           fullName,
        };

        if (email) userPayload.email = email;
        if (imageUrl) userPayload.imageUrl = imageUrl;

        const newUser = new this.userModel(userPayload);

        await newUser.save();

        console.log("New user created successfully:", {
          clerkId: data.id,
          fullName,
          email,
          imageUrl,
          username: data.username,
        });

        return { message: "User created successfully" };
      } catch (error) {
        console.error("Error creating user in handleEvent:", error);
        throw new BadRequestException(`Failed to create user: ${error.message}`);
      }
    }

    return { message: `Event ${event.type} received` };
  }
}