import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { UserAuth, UserClean } from '../models/auth.model';
import { User } from '../../users/schema/users.schema';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn().mockResolvedValue({
      email: 'test@example.com',
      fullName: 'Test User',
    } as UserClean),
    login: jest.fn().mockReturnValue({
      accessToken: 'mockToken',
      user: { email: 'test@example.com' },
    } as UserAuth),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return sanitized user data', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'securePassword',
        fullName: 'Test User',
      };
      const result = await authController.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        email: 'test@example.com',
        fullName: 'Test User',
      });
    });
  });

  describe('login', () => {
    it('should login a user and return a JWT token', () => {
      const mockUser = { email: 'test@example.com' } as User;
      const result = authController.login(mockUser);

      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        accessToken: 'mockToken',
        user: { email: 'test@example.com' },
      });
    });
  });
});
