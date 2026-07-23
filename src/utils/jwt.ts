export interface JwtPayload {
  sub: string
  employeeId: number
  roles: string[]
  permissions: string[]
  jti: string
  iat: number
  exp: number
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function parsePayload(token: string): unknown {
  const [, payloadSegment] = token.split('.')

  if (!payloadSegment) {
    return null
  }

  const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const bytes = Uint8Array.from(window.atob(padded), (character) => character.charCodeAt(0))

  return JSON.parse(new TextDecoder().decode(bytes)) as unknown
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const value = parsePayload(token)

    if (!value || typeof value !== 'object') {
      return null
    }

    const payload = value as Partial<JwtPayload>
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.employeeId !== 'number' ||
      !isStringArray(payload.roles) ||
      !isStringArray(payload.permissions) ||
      typeof payload.jti !== 'string' ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number'
    ) {
      return null
    }

    return payload as JwtPayload
  } catch {
    return null
  }
}
