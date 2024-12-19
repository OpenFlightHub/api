

// typescript compatible version of Object.keys()
export const objectKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>

// typescript compatible version of Object.assign()
export const assignObject = Object.assign as <T extends object, U extends object>(obj: T, other: U) => T & U

