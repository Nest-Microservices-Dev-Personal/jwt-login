import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../schemas/product.schema';

export class PaginatedProductsResponse {
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of records per page' })
  limit: number;

  @ApiProperty({ example: 25, description: 'Total number of records' })
  totalRecords: number;

  @ApiProperty({ example: 3, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ type: [Product], description: 'List of products' })
  data: Product[];
}
