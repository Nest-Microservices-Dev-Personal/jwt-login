import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/users.schema';

const mockUser = {
  email: 'test@example.com',
  fullName: 'Test User',
};

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<User>;

  const mockUserModel = {
    create: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await service.findByEmail(mockUser.email);
      expect(result).toEqual(mockUser);
      expect(userModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
    });

    it('should return null if no user is found', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await service.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create and return a sanitized user', async () => {
      const result = await service.createUser(mockUser);

      expect(userModel.create).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
