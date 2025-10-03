import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateOrderDto } from '../../dto/CreateOrderDto';

describe('Validation System', () => {
  describe('CreateOrderDto Validation', () => {
    it('should validate correct order data', async () => {
      const validData = {
        customerName: 'John Doe',
        phoneNumber: '+1234567890',
        items: [{ menuItemId: 1, quantity: 2 }],
        paid: true,
        paymentMode: 'cash',
      };

      const dto = plainToClass(CreateOrderDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject invalid customer name', async () => {
      const invalidData = {
        customerName: 'A', // Too short
        items: [{ menuItemId: 1, quantity: 1 }],
        paid: false,
      };

      const dto = plainToClass(CreateOrderDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('customerName');
      expect(errors[0].constraints?.minLength).toContain('2 characters');
    });

    it('should reject invalid phone number format', async () => {
      const invalidData = {
        customerName: 'John Doe',
        phoneNumber: '123', // Too short
        items: [{ menuItemId: 1, quantity: 1 }],
        paid: false,
      };

      const dto = plainToClass(CreateOrderDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('phoneNumber');
      expect(errors[0].constraints?.matches).toContain('valid format');
    });

    it('should reject invalid quantity', async () => {
      const invalidData = {
        customerName: 'John Doe',
        items: [{ menuItemId: 1, quantity: 0 }], // Invalid quantity
        paid: false,
      };

      const dto = plainToClass(CreateOrderDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('items');
      // The error might be in the nested validation
      expect(errors[0].children).toBeDefined();
    });

    it('should reject invalid payment mode', async () => {
      const invalidData = {
        customerName: 'John Doe',
        items: [{ menuItemId: 1, quantity: 1 }],
        paid: true,
        paymentMode: 'credit', // Invalid payment mode
      };

      const dto = plainToClass(CreateOrderDto, invalidData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('paymentMode');
      expect(errors[0].constraints?.isEnum).toContain('"cash" or "upi"');
    });

    it('should accept valid phone number formats', async () => {
      const validPhoneNumbers = ['1234567890', '+1234567890', '9876543210'];

      for (const phone of validPhoneNumbers) {
        const validData = {
          customerName: 'John Doe',
          phoneNumber: phone,
          items: [{ menuItemId: 1, quantity: 1 }],
          paid: false,
        };

        const dto = plainToClass(CreateOrderDto, validData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });
  });
});
