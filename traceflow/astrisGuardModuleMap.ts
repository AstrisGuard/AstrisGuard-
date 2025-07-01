export * from "./astrisGuardEngineCore"
export * from "./astrisGuardVaultHandler"
export * from "./astrisGuardIntelliLink"

import * as EngineCore from "./astrisGuardEngineCore"
import * as VaultHandler from "./astrisGuardVaultHandler"
import * as IntelliLink from "./astrisGuardIntelliLink"

export const moduleRegistry: Record<string, any> = {
  EngineCore,
  VaultHandler,
  IntelliLink,
}

export function loadModule(name: keyof typeof moduleRegistry) {
  const module = moduleRegistry[name]
  if (!module) {
    throw new Error(`Модуль ${name} не найден`)
  }
  return module
}
