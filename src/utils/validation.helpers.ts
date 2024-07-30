export const isInvalidNumber = (value: string): boolean => isNaN(Number(value)) || Number(value) < 0;
