import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckEnvPage() {
  // Get environment variables (only works on server components)
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || "Not set"
  const privateKeyExists = !!process.env.GOOGLE_PRIVATE_KEY
  const jwtSecretExists = !!process.env.JWT_SECRET

  // Check private key format if it exists
  let privateKeyInfo = "Not set"
  if (privateKeyExists) {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY || ""
    privateKeyInfo = {
      length: privateKey.length,
      hasBeginMarker: privateKey.includes("-----BEGIN PRIVATE KEY-----"),
      hasEndMarker: privateKey.includes("-----END PRIVATE KEY-----"),
      firstChars: privateKey.substring(0, 20) + "...",
      lastChars: "..." + privateKey.substring(privateKey.length - 20),
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Check</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Google Sheets Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[1fr_2fr] gap-2">
              <dt className="font-medium">Client Email:</dt>
              <dd>{clientEmail}</dd>

              <dt className="font-medium">Private Key:</dt>
              <dd>{privateKeyExists ? "Set" : "Not set"}</dd>

              {privateKeyExists && (
                <>
                  <dt className="font-medium">Private Key Length:</dt>
                  <dd>{privateKeyInfo.length} characters</dd>

                  <dt className="font-medium">Has BEGIN Marker:</dt>
                  <dd>{privateKeyInfo.hasBeginMarker ? "Yes" : "No"}</dd>

                  <dt className="font-medium">Has END Marker:</dt>
                  <dd>{privateKeyInfo.hasEndMarker ? "Yes" : "No"}</dd>

                  <dt className="font-medium">First Characters:</dt>
                  <dd className="font-mono text-xs">{privateKeyInfo.firstChars}</dd>

                  <dt className="font-medium">Last Characters:</dt>
                  <dd className="font-mono text-xs">{privateKeyInfo.lastChars}</dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>JWT Secret</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{jwtSecretExists ? "Set" : "Not set"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
