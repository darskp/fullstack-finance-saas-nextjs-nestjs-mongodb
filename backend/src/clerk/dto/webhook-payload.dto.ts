import { IsString, IsOptional, IsArray } from "class-validator";

export class EmailAddress {
  @IsString()
  email_address: string;
}

export class ClerkUserCreatedDto {

  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsArray()
  email_addresses?: EmailAddress[];

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  username?: string;

}