import * as v from 'valibot'
import { FORMATS, type Format } from '../formats'

const STORAGE_KEY = 'huebo-format'
const StoredFormat = v.picklist(FORMATS)

export function readFormat(): Format {
  try {
    const stored = v.safeParse(StoredFormat, localStorage.getItem(STORAGE_KEY))

    return stored.success ? stored.output : 'Hex'
  } catch {
    return 'Hex'
  }
}

export function saveFormat(format: Format): void {
  try {
    localStorage.setItem(STORAGE_KEY, format)
  } catch {
    // Private windows and blocked storage just don't remember the choice.
  }
}
