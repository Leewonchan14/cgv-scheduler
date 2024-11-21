export function toggleListItem<T>(
  arr: T[],
  target: T,
  compareFn: (t: T) => unknown,
): T[] {
  const idx = arr.findIndex((item) => compareFn(item) === compareFn(target));
  if (idx === -1) {
    return [...arr, target];
  }
  return arr.filter((_, i) => i !== idx);
}
