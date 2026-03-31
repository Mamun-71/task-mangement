import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  LoggerService,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { QueryFailedError, EntityNotFoundError } from "typeorm";

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  // Use console if logger string is given or implement standard logger
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let code = "HttpException";
    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong!";
    let errCode = null;

    switch (true) {
      case exception instanceof BadRequestException:
        status = (exception as any).getStatus();
        const exceptionResponse = (exception as any).getResponse();
        message = exceptionResponse?.message ? exceptionResponse.message : exceptionResponse;
        code = "BadRequestException";
        errCode = exceptionResponse?.errCode ? exceptionResponse.errCode : null;
        break;
      case exception instanceof UnprocessableEntityException:
        status = (exception as any).getStatus();
        message = (exception as any).getResponse().message;
        code = "UnprocessableEntityException";
        break;
      case exception instanceof HttpException:
        status = (exception as HttpException).getStatus();
        message = (exception as any).getResponse().message;
        code = "HttpException";
        break;
      case exception instanceof ForbiddenException:
        status = (exception as any).getStatus();
        message = (exception as any).getResponse().message;
        code = "ForbiddenException";
        break;
      case exception instanceof UnauthorizedException:
        status = (exception as any).getStatus();
        message = (exception as any).getResponse().message;
        code = "UnauthorizedException";
        break;
      case exception instanceof NotFoundException:
        status = HttpStatus.BAD_REQUEST;
        message = "Resource not found";
        code = (exception as any).code;
        break;
      case exception instanceof TypeError:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = (exception as any).message;
        code = (exception as any).code;
        break;
      
      // TypeORM MySQL Exceptions
      case exception instanceof QueryFailedError:
        const err = exception as any;
        if (err.code === 'ER_DUP_ENTRY') {
          message = `MYSQL ERROR: Duplicate entry found`;
          status = HttpStatus.CONFLICT;
          code = "MysqlConflictError";
        } else {
          message = err.message;
          status = HttpStatus.BAD_REQUEST;
          code = "MysqlQueryError";
        }
        break;
      case exception instanceof EntityNotFoundError:
        status = HttpStatus.NOT_FOUND;
        message = exception.message;
        code = "MysqlEntityNotFoundError";
        break;

      default:
        if (exception.code === "ENOENT") {
          status = HttpStatus.BAD_REQUEST;
          message = "File Not Found";
          code = "NotFoundException";
        }
    }

    console.error(`message: ${message}, method: ${request.method}, path : ${request.url}`);
    console.error((exception as any).stack);

    response.status(status).json(GlobalResponseError(status, message, code, request, errCode));
  }
}

const GlobalResponseError = (statusCode: number, message: string, code: string, request: Request, errorCode?: string | null): IResponseError => {
  const errorResponse: IResponseError = {
    success: false,
    status_code: statusCode,
    message,
    code,
    timestamp: new Date().toISOString(),
    path: request.url,
    method: request.method,
  };

  if (errorCode) {
    errorResponse.errCode = errorCode;
  }

  return errorResponse;
};

export interface IResponseError {
  success: boolean;
  status_code: number;
  message: string;
  code: string;
  timestamp: string;
  path: string;
  method: string;
  errCode?: string;
}
