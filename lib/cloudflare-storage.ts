interface CloudflareConfig {
  accountId: string
  apiToken: string
  bucketName: string
  customDomain?: string
}

export class CloudflareStorage {
  private config: CloudflareConfig

  constructor(config: CloudflareConfig) {
    this.config = config
  }

  async uploadImage(
    file: File,
    path: string,
  ): Promise<{
    success: boolean
    urls?: {
      original: string
      thumbnail: string
      medium: string
      large: string
    }
    error?: string
  }> {
    try {
      // Validaciones
      if (!file.type.startsWith("image/")) {
        throw new Error("El archivo debe ser una imagen")
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB máximo
        throw new Error("La imagen no puede superar 10MB")
      }

      // Generar nombre único
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`
      const fullPath = `${path}/${fileName}`

      // Subir a Cloudflare R2
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/r2/buckets/${this.config.bucketName}/objects/${fullPath}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
          },
          body: file,
        },
      )

      if (!uploadResponse.ok) {
        throw new Error("Error al subir imagen a Cloudflare")
      }

      // Generar URLs con transformaciones
      const baseUrl = this.config.customDomain
        ? `https://${this.config.customDomain}/${fullPath}`
        : `https://pub-${this.config.accountId}.r2.dev/${fullPath}`

      const urls = {
        original: baseUrl,
        thumbnail: `${baseUrl}/w=150,h=150,fit=cover,f=auto,q=80`,
        medium: `${baseUrl}/w=400,h=400,fit=cover,f=auto,q=80`,
        large: `${baseUrl}/w=800,h=800,fit=cover,f=auto,q=80`,
      }

      return {
        success: true,
        urls,
      }
    } catch (error) {
      console.error("Error uploading to Cloudflare:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Método para usar Cloudflare Images (transformaciones avanzadas)
  async uploadToCloudflareImages(file: File): Promise<{
    success: boolean
    urls?: {
      original: string
      thumbnail: string
      medium: string
      large: string
    }
    error?: string
  }> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.errors?.[0]?.message || "Error al subir imagen")
      }

      const imageId = result.result.id
      const baseUrl = `https://imagedelivery.net/${this.config.accountId}/${imageId}`

      const urls = {
        original: `${baseUrl}/public`,
        thumbnail: `${baseUrl}/w=150,h=150,fit=cover,f=auto,q=80`,
        medium: `${baseUrl}/w=400,h=400,fit=cover,f=auto,q=80`,
        large: `${baseUrl}/w=800,h=800,fit=cover,f=auto,q=80`,
      }

      return {
        success: true,
        urls,
      }
    } catch (error) {
      console.error("Error uploading to Cloudflare Images:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Generar URL optimizada
  getOptimizedUrl(originalUrl: string, width?: number, height?: number, quality = 80): string {
    const params = []

    if (width) params.push(`w=${width}`)
    if (height) params.push(`h=${height}`)
    params.push(`fit=cover`)
    params.push(`f=auto`)
    params.push(`q=${quality}`)

    return `${originalUrl}/${params.join(",")}`
  }
}

// Instancia singleton
export const cloudflareStorage = new CloudflareStorage({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  apiToken: process.env.CLOUDFLARE_API_TOKEN!,
  bucketName: process.env.CLOUDFLARE_BUCKET_NAME!,
  customDomain: process.env.CLOUDFLARE_CUSTOM_DOMAIN,
})
