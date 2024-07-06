import { Request } from 'express';

export interface IHttpRequest extends Request {
  __id: string;
}
