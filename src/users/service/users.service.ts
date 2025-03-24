import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/users.schema';
import { UserClean } from 'src/auth/models/auth.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      return this.userModel.findOne({ email }).exec();
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'An unexpected error occurred while creating the product',
        error: error?.message || '',
        stack: error?.stack || '',
      });
    }
  }

  async createUser(userData: Partial<User>): Promise<UserClean> {
    try {
      const user = await this.userModel.create(userData);
      return { email: user.email, fullName: user.fullName };
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'An unexpected error occurred while creating the product',
        error: error?.message || '',
        stack: error?.stack || '',
      });
    }
  }
}
