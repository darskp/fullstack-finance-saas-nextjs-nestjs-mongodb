// import { IsNotEmpty, IsString } from "class-validator";

// export class ClerkWebhookHeadersDto {

//   @IsNotEmpty()
//   @IsString()
//   "svix-id": string;

//   @IsNotEmpty()
//   @IsString()
//   "svix-timestamp": string;

//   @IsNotEmpty()
//   @IsString()
//   "svix-signature": string;
// }

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