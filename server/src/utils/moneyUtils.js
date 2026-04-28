// Store: rupees (string/number from client) → paise (integer for DB)
export const toPaise = (rupeesInput) => {
  const rupees = parseFloat(rupeesInput);
  if (!Number.isFinite(rupees)) throw new Error('Invalid amount');
  // Round to nearest paisa to handle any client float imprecision
  return Math.round(rupees * 100);
};

// Read: paise (integer from DB) → rupee string for JSON response
export const toRupees = (paise) => (paise / 100).toFixed(2);

// Aggregate: sum an array of paise integers, return rupee string
// Integer arithmetic — no float errors possible
export const sumToRupees = (paiseArray) => {
  const totalPaise = paiseArray.reduce((sum, p) => sum + p, 0);
  return toRupees(totalPaise);
};
