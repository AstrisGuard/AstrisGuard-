
export interface SanitizedTransferPayload {
  amount: number
  assetId: string
  destination: string
  gasless: boolean
}

export interface ValidationError {
  field: keyof SanitizedTransferPayload
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

const ADDRESS_REGEX = /^[A-Za-z0-9]{32,64}$/
const ASSET_REGEX = /^[A-Z0-9]{3,10}$/

export function validateTransferData(
  payload: SanitizedTransferPayload
): ValidationResult {
  const errors: ValidationError[] = []

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    errors.push({ field: 'amount', message: 'amount must be a positive number' })
  }

  if (typeof payload.assetId !== 'string' || !ASSET_REGEX.test(payload.assetId)) {
    errors.push({ field: 'assetId', message: 'assetId format is invalid' })
  }

  if (typeof payload.destination !== 'string' || !ADDRESS_REGEX.test(payload.destination)) {
    errors.push({ field: 'destination', message: 'destination address is invalid' })
  }

  if (typeof payload.gasless !== 'boolean') {
    errors.push({ field: 'gasless', message: 'gasless must be boolean' })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function assertValidTransferData(
  payload: SanitizedTransferPayload
): void {
  const result = validateTransferData(payload)
  if (!result.valid) {
    const msgs = result.errors.map(e => `${e.field}: ${e.message}`).join('; ')
    throw new Error(`Transfer data validation failed: ${msgs}`)
  }
}
