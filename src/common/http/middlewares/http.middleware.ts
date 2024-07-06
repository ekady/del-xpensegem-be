import { NestMiddleware } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';

export class HttpMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: (error?: any) => void) {
    req.__id = uuidV4();
    next();
  }
}
