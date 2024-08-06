export const reverse = <T>(arr: T[]): T[] => {
  const reversedArr = [];

  for (let i = arr.length - 1; i >= 0; i--) {
    reversedArr.push(arr[i]);
  }

  return reversedArr;
};

export const maxByFn = <T>(
  arr: T[],
  fn: (item: T) => number
): T | undefined => {
  let max: T | undefined;

  arr.forEach((item) => {
    if (max === undefined || fn(item) > fn(max)) {
      max = item;
    }
  });

  return max;
};

// export const getNLargestByFn = <T>(
//   arr: T[],
//   fn: (item: T) => number,
//   n: number
// ): T[] => {
//   if (n <= 0) {
//     return [];
//   }

//   const ascendingArr = arr.sort((a, b) => fn(a) - fn(b));

//   if (n >= ascendingArr.length) {
//     return ascendingArr;
//   }

//   return ascendingArr.slice(-n);
// };

export const getLargerThanByFn = <T>(
  arr: T[],
  fn: (item: T) => number,
  threshold: number
): T[] => {
  return arr.filter((item) => fn(item) >= threshold);
};

export const padOneZero = (n: number): string => {
  if (n < 10) {
    return `0${n}`;
  } else {
    return `${n}`;
  }
};

export const nWeeksBefore = (when: Date, nWeeks: number): Date => {
  return new Date(when.valueOf() - 1000 * 60 * 60 * 24 * 7 * nWeeks);
};

export const nHoursBefore = (when: Date, nHours: number): Date => {
  return new Date(when.valueOf() - 1000 * 60 * 60 * nHours);
};

export const nDaysBefore = (when: Date, nDays: number): Date => {
  return new Date(when.valueOf() - 1000 * 60 * 60 * 24 * nDays);
};

export const nHoursAfter = (when: Date, nHours: number): Date => {
  return new Date(when.valueOf() + 1000 * 60 * 60 * nHours);
};

export const nMinutesAfter = (when: Date, nMinutes: number): Date => {
  return new Date(when.valueOf() + 1000 * 60 * nMinutes);
};

export const capitalize = (s: string) => {
  if (s.length === 0) {
    return s;
  }

  const firstLetter = s.charAt(0);
  const rest = s.slice(1);

  return `${firstLetter.toUpperCase()}${rest.toLowerCase()}`;
};

export const getNearestItemByFn = <T>(
  arr: T[],
  fn: (item: T) => number,
  target: number
): T | undefined => {
  let found: T | undefined;
  let diff: number | undefined;

  arr.forEach((item) => {
    const mappedValue = fn(item);

    const thisDiff = Math.abs(mappedValue - target);
    if (diff === undefined || thisDiff < diff) {
      found = item;
      diff = thisDiff;
    }
  });

  return found;
};

export const formatPercent = (p: number | undefined, abs?: boolean): string => {
  if (p === undefined) {
    return "";
  } else {
    return `${abs ? Math.abs(Math.round(p * 100)) : Math.round(p * 100)}%`;
  }
};
