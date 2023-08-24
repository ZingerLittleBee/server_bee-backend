import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {FormatData, MemUsage} from "@/types/fusion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toGiB = ([strNum, unit]: [string, string]): number => {
  if (!strNum || !unit) return 0
  if (unit === "B") {
    return parseInt(strNum) / 1024 / 1024 / 1024
  } else if (unit === "KiB") {
    return parseInt(strNum) / 1024 / 1024
  } else if (unit === "MiB") {
    return parseInt(strNum) / 1024
  } else if (unit === "GiB") {
    return parseInt(strNum)
  } else if (unit === "MiB") {
    return parseInt(strNum) / 1024
  } else if (unit === "TiB") {
    return parseInt(strNum) * 1024
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

export const formatToString = (data: FormatData | [string, string]): string => {
  if (data) {
    let [value, unit] = data
    if (unit === 'KiB') unit = 'KB'
    if (unit === 'MiB') unit = 'MB'
    if (unit === 'GiB') unit = 'GB'
    if (unit === 'TiB') unit = 'TB'
    return unit ? `${value} ${unit}` : value
  }
  return ''
}
