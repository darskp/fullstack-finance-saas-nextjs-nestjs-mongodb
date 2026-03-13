import { IsNotEmpty, IsString } from "class-validator";

export class ClerkWebhookHeadersDto {

  @IsNotEmpty()
  @IsString()
  svixId: string;

  @IsNotEmpty()
  @IsString()
  svixTimestamp: string;

  @IsNotEmpty()
  @IsString()
  svixSignature: string;

}