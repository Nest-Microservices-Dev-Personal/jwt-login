import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserAuth } from 'src/auth/models/auth.model';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserAuth => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
