const NGN_TO_USD_RATE = 1500; // You might want to fetch this from an API

export const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
};

export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const convertNGNtoUSD = (amountNGN: number): number => {
  return amountNGN / NGN_TO_USD_RATE;
};