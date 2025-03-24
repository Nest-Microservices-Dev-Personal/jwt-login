import { ApiProperty } from '@nestjs/swagger';

export interface JwtUser {
  email: string;
  fullName: string;
  sub: string;
}

export class UserClean {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  fullName: string;
}

export class UserAuth {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cC...',
    description: 'JWT Access Token',
  })
  accessToken: string;

  @ApiProperty({ type: UserClean, description: 'User details' })
  user: UserClean;
}
