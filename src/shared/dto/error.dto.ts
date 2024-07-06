import { EErrorType } from '../enums/error-type.enum';

export class ErrorDto {
  message: string | string[];
  errorType: EErrorType | string;
}
