export type Option<T> =
  | { readonly isSome: true; readonly value: T }
  | { readonly isSome: false };

export const some = <T>(value: T): Option<T> => ({ isSome: true, value });
export const none = <T>(): Option<T> => ({ isSome: false });

export type Result<T, E> =
  | { readonly isOk: true; readonly value: T }
  | { readonly isOk: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({
  isOk: true,
  value,
});

export const err = <E>(error: E): Result<never, E> => ({ isOk: false, error });
