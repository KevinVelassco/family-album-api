import { HttpStatus } from '@nestjs/common';
import { DatabaseErrorCode } from '../constants';

interface DatabaseException {
  statusCode: number;
  message: string;
  error: string;
}

export function databaseException(error: any): DatabaseException | null {
  if (error.code === DatabaseErrorCode.UNIQUE_CONSTRAINT) {
    return {
      statusCode: HttpStatus.CONFLICT,
      message: error.detail,
      error: 'Conflict',
    };
  }

  if (error.code === DatabaseErrorCode.VALUE_TOO_LONG) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'some property exceeds the allowed length',
      error: 'Bad Request',
    };
  }

  return null;
}
