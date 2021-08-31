import { pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import { map, filter, join } from "ramda";

export function pad(value: string | number) {
  return value.toString().padStart(2, "0");
}

export function formatTime(value: number) {
  const val = value % 3600;
  const hour = Math.floor(value / 3600);

  const second = Math.floor(val % 60);
  const minute = Math.floor(val / 60);

  const time = [hour > 0 ? hour : "", minute, second];

  return pipe(time, filter(Boolean), map(pad), join(":"));
}
