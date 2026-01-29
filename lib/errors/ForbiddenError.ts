import { CustomError } from "./CustomError";

export class ForbiddenError extends CustomError {
  statusCode = 403;

  constructor(public message: string = "Forbidden") {
    super(message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  serializeError() {
    return [{ message: this.message }];
  }
}
