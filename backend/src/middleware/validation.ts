import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(dtoClass, req.body);
      const errors: ValidationError[] = await validate(dto);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => {
          const constraints = error.constraints;
          return {
            field: error.property,
            message: constraints ? Object.values(constraints)[0] : 'Invalid value'
          };
        });

        return res.status(400).json({
          error: errorMessages[0].message,
          details: errorMessages
        });
      }

      // Attach the validated DTO to the request
      req.body = dto;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({ error: 'Validation error occurred' });
    }
  };
};
