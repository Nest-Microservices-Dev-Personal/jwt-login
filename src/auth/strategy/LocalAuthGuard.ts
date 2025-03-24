import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from '../dto/login.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    const loginDto = plainToInstance(LoginDto, body);

    const errors = await validate(loginDto);
    if (errors.length > 0) {
      throw new UnauthorizedException(errors);
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
