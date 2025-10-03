import { IsString, IsOptional, IsArray, IsBoolean, IsEnum, ValidateNested, MinLength, MaxLength, IsInt, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsInt({ message: 'Menu item ID must be a valid integer' })
  @Min(1, { message: 'Menu item ID must be greater than 0' })
  menuItemId!: number;

  @IsInt({ message: 'Quantity must be a valid integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(100, { message: 'Quantity cannot exceed 100' })
  quantity!: number;
}

export class CreateOrderDto {
  @IsString({ message: 'Customer name must be a string' })
  @MinLength(2, { message: 'Customer name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Customer name cannot exceed 100 characters' })
  customerName!: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^[\+]?[1-9][\d]{6,14}$/, { 
    message: 'Phone number must be a valid format (7-15 digits, can start with +)' 
  })
  phoneNumber?: string;

  @IsArray({ message: 'Items must be an array' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsBoolean({ message: 'Paid status must be a boolean' })
  paid!: boolean;

  @IsOptional()
  @IsEnum(['cash', 'upi'], { message: 'Payment mode must be either "cash" or "upi"' })
  paymentMode?: 'cash' | 'upi';
}
