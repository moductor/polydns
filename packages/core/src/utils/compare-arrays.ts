import { isDeepStrictEqual } from "util";

export function deepIncludes<T>(arr: T[], val: T) {
  return !!arr.find((cur) => isDeepStrictEqual(val, cur));
}

export function getAddedItems<T>(oldArr: T[], newArr: T[]) {
  return newArr.filter((val) => !deepIncludes(oldArr, val));
}

export function getRemovedItems<T>(oldArr: T[], newArr: T[]) {
  return oldArr.filter((val) => !deepIncludes(newArr, val));
}

export function diffArrays<T>(oldArr: T[], newArr: T[]) {
  return {
    added: getAddedItems(oldArr, newArr),
    removed: getRemovedItems(oldArr, newArr),
  } as ArrayDiff<T>;
}

export type ArrayDiff<T> = {
  added: T[];
  removed: T[];
};
