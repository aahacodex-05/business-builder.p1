/** An error whose message is safe to show the user. */
export const userError = (status, message) => Object.assign(new Error(message), { status, expose: true });
