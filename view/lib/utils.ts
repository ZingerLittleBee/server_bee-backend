import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {FormatData, MemUsage} from "@/types/fusion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toGiB = ([strNum, unit]: [string, string]): number => {
  if (!unit) return 0
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

export const computedMemoryUsagePercentage = (usage: MemUsage): string => {
  if (!usage) return '0'
  return (toGiB(usage.total) !== 0 ? toGiB(usage.used) / toGiB(usage.total) * 100 : 0).toFixed(1)
}

export const formatToString = (data: FormatData): string => {
  if (data) {
    const [value, unit] = data
    return unit ? `${value} ${unit}` : value
  }
  return ''
}
