export const calculateExpirationDate = (
  currentDate: Date,
  months: number,
): Date => {
  return new Date(currentDate.setMonth(currentDate.getMonth() + months));
};
