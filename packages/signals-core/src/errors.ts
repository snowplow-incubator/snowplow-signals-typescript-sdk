export class SignalsAPIError extends Error {
  status: number;
  response: any;

  constructor(status: number, response: any) {
    super(`[Signals] ${status} ${response}`);
    this.status = status;
    this.response = response;
  }
}
