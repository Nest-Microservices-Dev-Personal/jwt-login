import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: 'Laptop', description: 'Product Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 15, description: 'Product Price' })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsPositive({ message: 'The price must be positive' })
  price: number;
}
