export default class AppError {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly code: number;

  constructor(message: string, interalErrorCode: number, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
    this.code = interalErrorCode;
  }
}
