import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {FormatData, MemUsage} from "@/types/fusion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toGiB = (data: FormatData | [string, string] | undefined, fixed = 1): number => {
  if (!data) return 0
  let [strNum, unit] = data
  if (unit === "B") {
    return toFixed(parseFloat(strNum) / 1024 / 1024 / 1024, fixed)
  } else if (unit === "KiB") {
    return toFixed(parseFloat(strNum) / 1024 / 1024, fixed)
  } else if (unit === "MiB") {
    return toFixed(parseFloat(strNum) / 1024, fixed)
  } else if (unit === "GiB") {
    return toFixed(parseFloat(strNum), fixed)
  } else if (unit === "MiB") {
    return toFixed(parseFloat(strNum) / 1024, fixed)
  } else if (unit === "TiB") {
    return toFixed(parseFloat(strNum) * 1024, fixed)
  }
  return 0
}

export const toMiB = ([strNum, unit]: [string, string]): number => {
  if (!strNum || !unit) return 0
  if (unit === "B") {
    return parseInt(strNum) / 1024 / 1024
  } else if (unit === "KiB") {
    return parseInt(strNum) / 1024
  } else if (unit === "MiB") {
    return parseInt(strNum)
  } else if (unit === "GiB") {
    return parseInt(strNum) * 1024
  } else if (unit === "TiB") {
    return parseInt(strNum) * 1024 * 1024
  }
  return 0
}

export const toKiB = ([strNum, unit]: [string, string]): number => {
  if (!strNum || !unit) return 0
  if (unit === "B") {
    return parseInt(strNum) / 1024
  } else if (unit === "KiB") {
    return parseInt(strNum)
  } else if (unit === "MiB") {
    return parseInt(strNum) * 1024
  } else if (unit === "GiB") {
    return parseInt(strNum) * 1024 * 1024
  } else if (unit === "TiB") {
    return parseInt(strNum) * 1024 * 1024 * 1024
  }
  return 0
}

export const kiBToMaxUnit = (kiB: number | string | undefined, fixed = 1): [string, string] => {
  if (typeof kiB === "string") {
    kiB = parseInt(kiB)
  }
  if (!kiB) {
    return ["0", ""]
  } else if (kiB < 1024) {
    return [kiB.toFixed(fixed), "KB"]
  } else if (kiB < 1024 * 1024) {
    return [(kiB / 1024).toFixed(fixed), "MB"]
  } else if (kiB < 1024 * 1024 * 1024) {
    return [(kiB / 1024 / 1024).toFixed(fixed), "GB"]
  } else {
    return [(kiB / 1024 / 1024 / 1024).toFixed(fixed), "TB"]
  }
}

export const computedMemoryUsagePercentage = (usage: MemUsage): string => {
  if (!usage) return '0'
  return (toGiB(usage.total) !== 0 ? toGiB(usage.used) / toGiB(usage.total) * 100 : 0).toFixed(1)
}

export const formatToString = (data: FormatData | [string, string] | undefined): string => {
  if (data) {
    let [value, unit] = data
    let newUnit: string = unit
    if (unit === 'KiB') newUnit = 'KB'
    if (unit === 'MiB') newUnit = 'MB'
    if (unit === 'GiB') newUnit = 'GB'
    if (unit === 'TiB') newUnit = 'TB'
    return unit ? `${value} ${newUnit}` : value
  }
  return ''
}

export const toFixed = (num: number | string | undefined, fixed = 1): number => {
    if (typeof num === "string") {
        num = parseFloat(num)
    }
    if (!num) {
        return 0
    }
    return parseFloat(num.toFixed(fixed))
}
