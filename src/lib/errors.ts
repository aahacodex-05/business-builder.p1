/** A problem to show to whoever caused it, with the HTTP status the API answers with. */
export class StaffError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}
