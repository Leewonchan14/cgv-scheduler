export const delay = (ms: number) => {
  return new Promise<void>((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};
