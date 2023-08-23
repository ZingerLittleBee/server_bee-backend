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

export const kiBToMaxUnit = (kiB: number | string | undefined): [string, string] => {
  if (typeof kiB === "string") {
    kiB = parseInt(kiB)
  }
  if (!kiB) {
    return ["0", ""]
  } else if (kiB < 1024) {
    return [kiB.toFixed(1), "KB"]
  } else if (kiB < 1024 * 1024) {
    return [(kiB / 1024).toFixed(1), "MB"]
  } else if (kiB < 1024 * 1024 * 1024) {
    return [(kiB / 1024 / 1024).toFixed(1), "GB"]
  } else {
    return [(kiB / 1024 / 1024 / 1024).toFixed(1), "TB"]
  }
}

export const computedMemoryUsagePercentage = (usage: MemUsage): string => {
  if (!usage) return '0'
  return (toGiB(usage.total) !== 0 ? toGiB(usage.used) / toGiB(usage.total) * 100 : 0).toFixed(1)
}

export const formatToString = (data: FormatData | [string, string]): string => {
  if (data) {
    const [value, unit] = data
    return unit ? `${value} ${unit}` : value
  }
  return ''
}
