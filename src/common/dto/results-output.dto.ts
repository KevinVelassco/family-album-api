import { ApiProperty } from '@nestjs/swagger';

export class ResultsOutputDto<Model> {
  @ApiProperty()
  readonly count: number;

  @ApiProperty()
  readonly results: Model[];
}
