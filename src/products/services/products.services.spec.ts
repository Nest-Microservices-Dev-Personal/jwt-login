import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ProductService } from '../services/products.services';
import { Product } from '../schemas/product.schema';
import { JwtUser } from 'src/auth/models/auth.model';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

const mockProductModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(() => ({
    limit: jest.fn(() => ({
      skip: jest.fn(() => ({
        select: jest.fn(() => ({
          exec: jest
            .fn()
            .mockResolvedValue([{ name: 'Test Product', price: 20 }]),
        })),
      })),
    })),
  })),
};

const mockLogger = {
  log: jest.fn(),
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const dto = { name: 'Test Product', price: 20 };
      const user: JwtUser = {
        sub: '60d5ec49f72b7c001c8dc123',
        email: 'test@example.com',
        fullName: 'Test Product',
      };
      const createdProduct = {
        ...dto,
        owner: new Types.ObjectId(user.sub),
        validated: true,
      };

      mockProductModel.create.mockResolvedValue(createdProduct);
      const result = await service.createProduct(dto as any, user);

      expect(result).toEqual(createdProduct);
    });

    it('should throw BadRequestException if product is invalid', async () => {
      const dto = { name: 'Invalid Product', price: 5 };
      const user: JwtUser = {
        sub: '60d5ec49f72b7c001c8dc123',
        email: 'test@example.com',
        fullName: 'Test Product',
      };

      await expect(service.createProduct(dto as any, user)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const id = '60d5ec49f72b7c001c8dc123';
      const user: JwtUser = {
        sub: '60d5ec49f72b7c001c8dc123',
        email: 'test@example.com',
        fullName: 'Test Product',
      };
      const updateData = { price: 30 };
      const product = {
        id,
        owner: user.sub,
        price: 20,
        save: jest.fn().mockResolvedValue(updateData),
      };

      mockProductModel.findOne.mockResolvedValue(product);
      const result = await service.updateProduct(id, updateData as any, user);

      expect(result).toEqual(updateData);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductModel.findOne.mockResolvedValue(null);

      await expect(
        service.updateProduct('invalid', {} as any, {
          sub: '60d5ec49f72b7c001c8dc123',
          email: 'test@example.com',
          fullName: 'Test Product',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('inactivateProduct', () => {
    it('should inactivate a product', async () => {
      const id = '60d5ec49f72b7c001c8dc123';
      const user: JwtUser = {
        sub: '60d5ec49f72b7c001c8dc123',
        email: 'test@example.com',
        fullName: 'Test Product',
      };
      const product = {
        id,
        owner: user.sub,
        status: 'active',
        save: jest.fn().mockResolvedValue({ status: 'inactive' }),
      };

      mockProductModel.findOne.mockResolvedValue(product);
      const result = await service.inactivateProduct(id, user);

      expect(result.status).toBe('inactive');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductModel.findOne.mockResolvedValue(null);

      await expect(
        service.inactivateProduct('invalid', {
          sub: '60d5ec49f72b7c001c8dc123',
          email: 'test@example.com',
          fullName: 'Test Product',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
