export const splitAndTrimString = (str: string = '', sep: string = ',') => {
  return str.split(sep).map(s => s.trim());
};
