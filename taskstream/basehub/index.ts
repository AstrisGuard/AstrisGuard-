import { ExecutionEngine, createEngineWithDefaults } from "./executionEngine"
import { SigningEngine } from "./signingEngine"

async function main() {
  const engine = createEngineWithDefaults()
  const signEngine = new SigningEngine()

  const results = await engine.executeAll()
  for (const r of results) {
    if (r.success) {
      console.log(`Task ${r.taskId} succeeded:`, r.payload)
    } else {
      console.error(`Task ${r.taskId} failed:`, r.payload)
    }
  }

  const dataToSign = JSON.stringify(results)
  const signature = await signEngine.signData(dataToSign)
  console.log("Signature:", signature)

  const verified = await signEngine.verifySignature(dataToSign, signature)
  console.log("Verified:", verified)
}

main().catch(err => {
  console.error("Fatal error:", err)
})
