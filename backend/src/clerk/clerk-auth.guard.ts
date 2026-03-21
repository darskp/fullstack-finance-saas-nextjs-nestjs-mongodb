import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private configService: ConfigService){}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

  try {
      const CLERK_SECRET_KEY = this.configService.get<string>('CLERK_SECRET_KEY', '');
      const session = await verifyToken(token, {
        secretKey:CLERK_SECRET_KEY,
      });

      request.user = { id: session.sub };

      return true;
    } catch (error) {
      console.error('Clerk authentication error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
