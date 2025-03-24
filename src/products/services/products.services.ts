import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from '../dto/createProduct.dto';
import { Product } from '../schemas/product.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtUser } from 'src/auth/models/auth.model';
import { PaginatedProductsResponse } from '../models/paginatedProductsResponse.model';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateProductDto } from '../dto/updateProduct.dto';
import { ProductStatus } from '../models/statusProduct.model';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: LoggerService,
  ) {}

  async createProduct(
    product: CreateProductDto,
    user: JwtUser,
  ): Promise<Product> {
    try {
      const isValid = await this.productValidation(product);
      if (!isValid) {
        throw new BadRequestException('The product is not valid');
      }

      const newProduct: Partial<Product> = {
        ...product,
        owner: new Types.ObjectId(user.sub),
        validated: true,
      };

      const productAdded = await this.productModel.create(newProduct);

      return productAdded?.toObject ? productAdded.toObject() : productAdded;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'An unexpected error occurred while creating the product',
        error: error?.message || '',
        stack: error?.stack || '',
      });
    }
  }

  async getProducts(
    user: JwtUser,
    pagination: PaginationDto,
  ): Promise<PaginatedProductsResponse> {
    try {
      const { page, limit } = pagination;
      const startIndex = (page - 1) * limit;

      const ownerId = new Types.ObjectId(user.sub);

      const totalRecords = await this.productModel.countDocuments({
        owner: ownerId,
        status: ProductStatus.ACTIVE,
      });

      const totalPages = Math.ceil(totalRecords / limit);

      const products = await this.productModel
        .find({ owner: ownerId, status: ProductStatus.ACTIVE })
        .limit(limit)
        .skip(startIndex)
        .select('-_id -__v')
        .exec();

      return {
        page,
        limit,
        totalRecords,
        totalPages,
        data: products,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'An unexpected error occurred while creating the product',
        error: error?.message || '',
        stack: error?.stack || '',
      });
    }
  }

  async updateProduct(
    id: string,
    data: UpdateProductDto,
    user: JwtUser,
  ): Promise<Product> {
    try {
      const product = await this.productModel.findOne({ id });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.owner.toString() !== user.sub) {
        throw new ForbiddenException(
          'You do not have permission to update this product',
        );
      }

      Object.assign(product, data);

      const updatedProduct = await product.save();

      return updatedProduct?.toObject
        ? updatedProduct.toObject()
        : updatedProduct;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'An unexpected error occurred while creating the product',
        error: error?.message || '',
        stack: error?.stack || '',
      });
    }
  }

  async inactivateProduct(id: string, user: JwtUser): Promise<Product> {
    try {
      const product = await this.productModel.findOne({
        id,
        status: ProductStatus.ACTIVE,
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.owner.toString() !== user.sub) {
        throw new ForbiddenException(
          'You do not have permission to inactivate this product',
        );
      }

      product.status = ProductStatus.INACTIVE;
      const productDelete = await product.save();

      return productDelete?.toObject ? productDelete.toObject() : productDelete;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'An unexpected error occurred while creating the product',
        error: error?.message || '',
        stack: error?.stack || '',
      });
    }
  }

  private async productValidation(product: CreateProductDto): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isValid = product.price >= 10;

        this.logger.log({
          level: 'info',
          message: 'Product validation',
          data: {
            name: product.name,
            price: product.price,
            validationResult: isValid ? 'Approved' : 'Rejected',
          },
          timestamp: new Date().toISOString(),
        });

        resolve(isValid);
      }, 1000);
    });
  }
}
