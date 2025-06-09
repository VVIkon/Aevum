export function isPassword(str: string): boolean {
  return str.length >= 6
}

export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export function isString(str: unknown): str is string {
  return (
    typeof str === 'string' ||
    (typeof str === 'object' &&
      str !== null &&
      Object.prototype.toString.call(str) === '[object String]')
  );
}

export function isArray(arg: unknown): boolean {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}

export function isEmail(str: unknown): boolean {
    if (typeof str !== "string") return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(str);
}

export function uuid(length = 32) {
  const num = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  let str = ''
  for (let i = 0; i < length; i++) {
    str += num.charAt(Math.floor(Math.random() * num.length))
  }
  return str
}

export function decode(url: string): string {
    return decodeURIComponent(decodeURIComponent(url))
}

export function encode(url: string): string {
    return encodeURIComponent(encodeURIComponent(url))
}

