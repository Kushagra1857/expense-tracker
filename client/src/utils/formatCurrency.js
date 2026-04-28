const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

// amount is a string like "4250.75" received from the API
export const formatINR = (amount) => formatter.format(parseFloat(amount));
