export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly success = false;

  constructor(statusCode: number, message = "Something went wrong") {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
