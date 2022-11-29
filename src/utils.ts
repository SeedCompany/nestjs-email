export type MaybeAsync<T> = T | Promise<T>;

export type Many<T> = T | readonly T[];

export const many = <T>(item: Many<T>): readonly T[] =>
  Array.isArray(item) ? item : [item as T];

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
