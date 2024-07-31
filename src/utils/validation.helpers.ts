export const isInvalidNumber = (value: string): boolean => {
  const num = Number(value);
  return isNaN(num) || num < 0 || !isFinite(num);
};
