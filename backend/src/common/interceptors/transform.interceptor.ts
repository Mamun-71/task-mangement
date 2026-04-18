import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  timestamp: string;
}

// Wraps every successful response in a consistent envelope:
// { success, status_code, message, data, timestamp }
// Error responses are shaped by CustomExceptionFilter instead.
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        status_code: statusCode,
        message: data?.message ?? 'Request successful',
        data: data?.message ? undefined : data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
