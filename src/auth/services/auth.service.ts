import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/service/users.service';
import { RegisterDto } from '../dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/schema/users.schema';
import { UserAuth, UserClean } from '../models/auth.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<UserClean> {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.usersService.createUser({
        ...dto,
        password: hashedPassword,
      });

      return user;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'An unexpected error occurred while creating the product',
        error: error?.message || '',
        stack: error?.stack || '',
      });
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'An unexpected error occurred while creating the product',
        error: error?.message || '',
        stack: error?.stack || '',
      });
    }
  }
  login(user: User): UserAuth {
    try {
      const payload = {
        email: user.email,
        sub: user._id,
        fullName: user.fullName,
      };
      return {
        accessToken: this.jwtService.sign(payload),
        user: { email: user.email, fullName: user.fullName },
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'An unexpected error occurred while creating the product',
        error: error?.message || '',
        stack: error?.stack || '',
      });
    }
  }
}
