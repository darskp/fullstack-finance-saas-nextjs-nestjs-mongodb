import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Webhook } from "svix";
import { WebhookEvent } from "./interfaces/webhook-event.interface";
import { ClerkUserCreatedDto } from "./dto/webhook-payload.dto";
import { User } from "../users/schemas/user.schema";

@Injectable()
export class ClerkService {

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

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

  async handleEvent(event: WebhookEvent): Promise<{ message: string }> {

    console.log("Webhook verified");
    console.log("Event:", event.type);

    if (event.type === "user.created") {

      const data = event.data as ClerkUserCreatedDto;

      const email = data.email_addresses?.[0]?.email_address || null;
      const fullName = [data.first_name, data.last_name]
        .filter(Boolean)
        .join(" ");
      const imageUrl = data.image_url || null;

      const existingByClerkId = await this.userModel.findOne({ clerkId: data.id });
      if (existingByClerkId) {
        console.log(`User with clerkId ${data.id} already exists`);
        return { message: "User email already exists" };
      }

      if (email) {
        const existingByEmail = await this.userModel.findOne({ email });
        if (existingByEmail) {
          console.log(`User with email ${email} already exists`);
          return { message: "User email already exists" };
        }
      }

      const newUser = new this.userModel({
        clerkId: data.id,
        fullName: fullName || "Unknown User",
        email,      // null if not provided
        imageUrl,   // null if not provided
      });

      await newUser.save();

      console.log("New user created:", {
        clerkId: data.id,
        fullName,
        email,
        imageUrl,
      });

      return { message: "User created successfully" };
    }

    return { message: `Event ${event.type} received` };
  }
}