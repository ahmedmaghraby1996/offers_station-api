import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If token is valid, user will be set
    // If no token or invalid, just return null instead of throwing error
    if (err || !user) {
      return null;
    }
    return user;
  }
}
