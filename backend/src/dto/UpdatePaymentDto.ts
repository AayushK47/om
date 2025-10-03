import { IsBoolean, IsOptional, IsEnum } from 'class-validator';

export class UpdatePaymentDto {
  @IsBoolean({ message: 'Paid status must be a boolean' })
  paid!: boolean;

  @IsOptional()
  @IsEnum(['cash', 'upi'], { message: 'Payment mode must be either "cash" or "upi"' })
  paymentMode?: 'cash' | 'upi';
}
