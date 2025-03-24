import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersService } from '../../../src/users/service/users.service';

@ValidatorConstraint({ name: 'UserExistConstraint', async: true })
@Injectable()
export class UserExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userService: UsersService) {}
  async validate(email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);

    return !user;
  }

  defaultMessage(): string {
    return 'Email $value already exists';
  }
}
