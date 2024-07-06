import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  getSchemaPath,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';

import { ResponseDto } from '../dto';

export const ApiResProperty = <TModel extends Type<any>>(
  model: TModel | TModel[],
  statusCode: number,
  { isDisableAuth = false, defaultStructure = true } = {},
) => {
  const models = Array.isArray(model) ? model : [model];
  const data = Array.isArray(model)
    ? { type: 'array', items: { $ref: getSchemaPath(model[0]) } }
    : { $ref: getSchemaPath(model) };
  const apiAuth = isDisableAuth ? ApiSecurity({}) : ApiBearerAuth();
  const properties = defaultStructure
    ? {
        data,
        statusCode: {
          default: statusCode,
        },
      }
    : {};
  return applyDecorators(
    apiAuth,
    ApiExtraModels(ResponseDto, ...models),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties,
          },
        ],
      },
    }),
    ApiUnauthorizedResponse({ description: 'Not authenticated' }),
    ApiForbiddenResponse({ description: 'Access denied' }),
    ApiNotFoundResponse({ description: 'Not found' }),
    ApiInternalServerErrorResponse({ description: 'Server error' }),
  );
};
