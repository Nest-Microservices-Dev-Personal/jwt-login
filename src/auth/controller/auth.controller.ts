import {
  Controller,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { LocalAuthGuard } from '../strategy/LocalAuthGuard';
import { User } from '../../users/schema/users.schema';
import { UserAuth, UserClean } from '../models/auth.model';
import { CurrentUser } from '../../../src/common/decorators/currentUser.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    type: UserClean,
  })
  async register(@Body() dto: RegisterDto): Promise<UserClean> {
    return this.authService.register(dto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    type: UserAuth,
  })
  @UseGuards(LocalAuthGuard)
  login(@CurrentUser() user: User): UserAuth {
    return this.authService.login(user);
  }
}
