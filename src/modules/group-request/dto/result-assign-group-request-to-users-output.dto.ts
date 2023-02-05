import { ApiProperty } from '@nestjs/swagger';

export class ResultAssignGroupRequestToUsersOutputDto {
  @ApiProperty({ default: 'OK' })
  readonly result: 'OK';

  @ApiProperty({
    description: 'Number of users to whom a group request was sent.',
  })
  readonly count: number;
}
