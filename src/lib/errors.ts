/** Domain errors shared across the service layer. */

export class AppError extends Error {
  constructor(
    message: string,
    readonly code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT',
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const unauthorized = (msg = 'ログインが必要です') =>
  new AppError(msg, 'UNAUTHORIZED');
export const forbidden = (msg = 'この操作は許可されていません') =>
  new AppError(msg, 'FORBIDDEN');
export const notFound = (msg = '対象が見つかりません') =>
  new AppError(msg, 'NOT_FOUND');
export const validationError = (msg: string) => new AppError(msg, 'VALIDATION');
export const conflict = (msg: string) => new AppError(msg, 'CONFLICT');

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}
