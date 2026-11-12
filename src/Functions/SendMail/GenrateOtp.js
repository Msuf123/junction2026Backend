function generateOtpNumber() {
  let finalNumber = 0;
  for (let i = 0; i < 6; i++) {
    const randomDigit = (Math.random() * 9) | 0;
    const paserValue = Math.pow(10, i);

    finalNumber += randomDigit * paserValue;
  }

  return Number(String(finalNumber).padEnd(6, "0"));
}
module.exports = { generateOtpNumber };
