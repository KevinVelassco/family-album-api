import { ApiProperty } from '@nestjs/swagger';

export class TokensOutputDto {
  @ApiProperty()
  readonly access_token: string;

  @ApiProperty()
  readonly refresh_token: string;
}
