export const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const getRandomIntWithExceptions = (min, max, exceptions) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  let possibleNumbers = [];

  for (let i = min; i <= max; i++) {
      if (!exceptions.includes(i)) {
          possibleNumbers.push(i);
      }
  }

  if (possibleNumbers.length === 0) {
      throw new Error("No valid numbers available in the range.");
  }

  const randomIndex = Math.floor(Math.random() * possibleNumbers.length);
  return possibleNumbers[randomIndex];
}
