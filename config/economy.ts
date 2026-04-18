export const economyConfig = {
  totalSupply: 25_000_000_000,

  reserve: 25_000_000_000,
  circulating: 0,
  burned: 0,
  locked: 0,

  baseReward: 10,
  baseFoodPrice: 5,
  transactionFee: 0.05,

  activeCurrency: "points" as "points" | "token",
  tokenEnabled: false,
  nftEnabled: false,
};

export function getRewardRate(reserve: number, totalSupply: number) {
  const reserveRatio = reserve / totalSupply;

  if (reserveRatio > 0.7) return 1.2;
  if (reserveRatio > 0.4) return 1;
  if (reserveRatio > 0.2) return 0.8;
  return 0.6;
}

export function getPriceRate(reserve: number, totalSupply: number) {
  const reserveRatio = reserve / totalSupply;

  if (reserveRatio > 0.7) return 0.9;
  if (reserveRatio > 0.4) return 1;
  if (reserveRatio > 0.2) return 1.2;
  return 1.5;
}