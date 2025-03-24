import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '../models/statusProduct.model';

@Schema({
  timestamps: true,
})
export class Product extends Document {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Product ID',
  })
  @Prop({ type: String, default: () => crypto.randomUUID(), unique: true })
  id?: string;

  @ApiProperty({
    example: 'Laptop Dell XPS 13',
    description: 'Product Name',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ example: 1200, description: 'Product price' })
  @Prop({ required: true })
  price: number;

  @ApiProperty({
    example: '60f7f9e0f2a0c800174e4a7b',
    description: 'User owner',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @ApiProperty({
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    description: 'Product status',
  })
  @Prop({ type: String, enum: ProductStatus, default: ProductStatus.ACTIVE })
  status?: ProductStatus;

  @ApiProperty({ example: true, description: 'Product valid' })
  @Prop({ required: false })
  validated: boolean;

  @ApiProperty({
    example: '2025-03-21T13:00:00.000Z',
    description: 'Created At',
  })
  createdAt?: Date;

  @ApiProperty({
    example: '2025-03-22T13:00:00.000Z',
    description: 'Updated At',
  })
  updatedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
