import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateProductDto } from '../dto/createProduct.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../../src/common/decorators/currentUser.decorator';
import { JwtUser } from '../../../src/auth/models/auth.model';
import { Product } from '../schemas/product.schema';
import { ProductService } from '../services/products.services';
import { PaginatedProductsResponse } from '../models/paginatedProductsResponse.model';
import { PaginationDto } from '../../../src/common/dto/pagination.dto';
import { UpdateProductDto } from '../dto/updateProduct.dto';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Products list with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of products per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Products list with pagination',
    type: PaginatedProductsResponse,
  })
  listProducts(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: JwtUser,
  ): Promise<PaginatedProductsResponse> {
    return this.productService.getProducts(user, pagination);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Add new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: Product,
  })
  createProduct(
    @Body() data: CreateProductDto,
    @CurrentUser() user: JwtUser,
  ): Promise<Product> {
    return this.productService.createProduct(data, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Update a product',
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Product Id',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product update successfully',
    type: Product,
  })
  updateProduct(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
    @CurrentUser() user: JwtUser,
  ): Promise<Product> {
    return this.productService.updateProduct(id, data, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Delete a product',
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Product Id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    type: Product,
  })
  inactivateProduct(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<Product> {
    return this.productService.inactivateProduct(id, user);
  }
}
