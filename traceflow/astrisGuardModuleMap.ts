import * as EngineCore from "./astrisGuardEngineCore"
import * as VaultHandler from "./astrisGuardVaultHandler"
import * as IntelliLink from "./astrisGuardIntelliLink"

/**
 * Named exports for direct imports
 */
export { EngineCore, VaultHandler, IntelliLink }

/**
 * Registry of all modules by key
 */
type ModuleRegistry = {
  engineCore: typeof EngineCore
  vaultHandler: typeof VaultHandler
  intelliLink: typeof IntelliLink
}

export const moduleRegistry: ModuleRegistry = {
  engineCore: EngineCore,
  vaultHandler: VaultHandler,
  intelliLink: IntelliLink,
}

/**
 * The valid keys for loadModule()
 */
export type ModuleName = keyof ModuleRegistry

/**
 * Dynamically load one of the registered modules
 * @param name – the module key to load
 * @throws if the key isn’t found
 */
export function loadModule<Name extends ModuleName>(name: Name): ModuleRegistry[Name] {
  const mod = moduleRegistry[name]
  if (!mod) {
    throw new Error(`Module "${name}" not found`)
  }
  return mod
}
