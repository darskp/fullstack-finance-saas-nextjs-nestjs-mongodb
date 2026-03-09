import { IsString, IsOptional } from "class-validator";

export class ClerkUserCreatedDto {

  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

}