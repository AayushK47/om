import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'completed'], { 
    message: 'Status must be either "pending" or "completed"' 
  })
  status!: 'pending' | 'completed';
}
