import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './products.controller';
import { ProductService } from '../services/products.services';
import { JwtUser } from 'src/auth/models/auth.model';
import { CreateProductDto } from '../dto/createProduct.dto';
import { UpdateProductDto } from '../dto/updateProduct.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Product } from '../schemas/product.schema';
import { PaginatedProductsResponse } from '../models/paginatedProductsResponse.model';

describe('ProductController', () => {
  let productController: ProductController;
  let productService: ProductService;

  const mockUser: JwtUser = {
    sub: 'user123',
    email: 'test@example.com',
    fullName: 'test',
  };
  const mockProduct: Product = {
    id: 'product123',
    name: 'Sample Product',
    price: 100,
  } as Product;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            getProducts: jest
              .fn()
              .mockResolvedValue({ data: [mockProduct], total: 1 }),
            createProduct: jest.fn().mockResolvedValue(mockProduct),
            updateProduct: jest.fn().mockResolvedValue(mockProduct),
            inactivateProduct: jest.fn().mockResolvedValue(mockProduct),
          },
        },
      ],
    }).compile();

    productController = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(productController).toBeDefined();
  });

  describe('listProducts', () => {
    it('should return paginated product list', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const result: PaginatedProductsResponse =
        await productController.listProducts(paginationDto, mockUser);
      expect(productService.getProducts).toHaveBeenCalledWith(
        mockUser,
        paginationDto,
      );
      expect(result).toEqual({ data: [mockProduct], total: 1 });
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const createDto: CreateProductDto = {
        name: 'New Product',
        price: 150,
      };
      const result: Product = await productController.createProduct(
        createDto,
        mockUser,
      );
      expect(productService.createProduct).toHaveBeenCalledWith(
        createDto,
        mockUser,
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const updateDto: UpdateProductDto = { name: 'Updated Product' };
      const result: Product = await productController.updateProduct(
        'product123',
        updateDto,
        mockUser,
      );
      expect(productService.updateProduct).toHaveBeenCalledWith(
        'product123',
        updateDto,
        mockUser,
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('inactivateProduct', () => {
    it('should delete a product', async () => {
      const result: Product = await productController.inactivateProduct(
        'product123',
        mockUser,
      );
      expect(productService.inactivateProduct).toHaveBeenCalledWith(
        'product123',
        mockUser,
      );
      expect(result).toEqual(mockProduct);
    });
  });
});
