import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from "./customErrors";

export class ErrorFactory {
  static badRequest(message: string) {
    return new BadRequestError(message);
  }

  static internal(message: string) {
    return new InternalServerError(message);
  }

  static unauthorized(message: string) {
    return new UnauthorizedError(message);
  }

  static conflict(message: string) {
    return new ConflictError(message);
  }

  static notFound(message: string) {
    return new NotFoundError(message);
  }

  static forbidden(message: string) {
    return new ForbiddenError(message);
  }

  static validation(message: string) {
    return new ValidationError(message);
  }
}
