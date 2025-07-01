import crypto from "crypto"

export class SigningEngine {
  private algorithm = "RSA-SHA256"
  private keyPair: { publicKey: string; privateKey: string }

  constructor() {
    this.keyPair = this.generateKeyPair()
  }

  private generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicExponent: 0x10001,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    })
    return { publicKey, privateKey }
  }

  async signData(data: string): Promise<string> {
    const signer = crypto.createSign(this.algorithm)
    signer.update(data)
    signer.end()
    return signer.sign(this.keyPair.privateKey, "base64")
  }

  async verifySignature(data: string, signature: string): Promise<boolean> {
    const verifier = crypto.createVerify(this.algorithm)
    verifier.update(data)
    verifier.end()
    return verifier.verify(this.keyPair.publicKey, signature, "base64")
  }

  exportPublicKey(): string {
    return this.keyPair.publicKey
  }

  exportPrivateKey(): string {
    return this.keyPair.privateKey
  }

  async rotateKeys(): Promise<void> {
    this.keyPair = this.generateKeyPair()
  }
}
