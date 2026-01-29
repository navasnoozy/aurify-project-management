import { CustomError } from "./CustomError";

export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(
    public message: string,
    public field?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeError() {
    const error: { message: string; field?: string } = { message: this.message };
    if (this.field) {
      error.field = this.field;
    }
    return [error];
  }
}
