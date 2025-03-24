import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../../users/service/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { User } from 'src/users/schema/users.schema';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockedAccessToken'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should hash password and create a new user', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: '123456',
        fullName: 'Test User',
      };
      const mockUser = { ...dto, password: 'hashedPassword' } as User;
      usersService.createUser = jest.fn().mockResolvedValue(mockUser);

      const result = await authService.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(usersService.createUser).toHaveBeenCalledWith({
        ...dto,
        password: 'hashedPassword',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'hashedPassword',
      } as User;
      usersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(
        'test@example.com',
        '123456',
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', mockUser.password);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmail = jest.fn().mockResolvedValue(null);

      await expect(
        authService.validateUser('test@example.com', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'hashedPassword',
      } as User;
      usersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return a JWT token and user info', () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        fullName: 'Test User',
      } as User;
      const result = authService.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser._id,
        fullName: mockUser.fullName,
      });
      expect(result).toEqual({
        accessToken: 'mockedAccessToken',
        user: { email: mockUser.email, fullName: mockUser.fullName },
      });
    });
  });
});
