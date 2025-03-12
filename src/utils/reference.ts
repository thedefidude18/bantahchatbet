export const generateReference = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix.toUpperCase()}_${timestamp}_${random}`;
};