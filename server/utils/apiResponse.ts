export class ApiResponse<T = unknown> {
  public readonly success: boolean;

  constructor(
    public readonly statusCode: number,
    public readonly data: T,
    public readonly message: string = "Success"
  ) {
    this.success = statusCode < 400;
  }
}
