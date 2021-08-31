import { pipe } from "fp-ts/function";
import { filter, join, map } from "ramda";

export function pad(value: any) {
  return value.toString().padStart(2, "0");
}

export function formatTime(value: number) {
  const val = value % 3600;
  const hour = Math.floor(value / 3600);

  const second = Math.floor(val % 60);
  const minute = Math.floor(val / 60);

  const time = [hour > 0 ? hour : null, minute, second];

  console.log(time);

  return pipe(
    time,
    filter((t) => t !== null),
    map((t) => (Number.isNaN(t) ? "" : t)),
    map(pad),
    join(":")
  );
}
