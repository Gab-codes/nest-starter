import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Build auth system' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Implement JWT with refresh tokens',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
