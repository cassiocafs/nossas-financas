function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function createNonce(): Promise<{ nonce: string; hashedNonce: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = bufferToHex(bytes.buffer);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(nonce));
  return { nonce, hashedNonce: bufferToHex(digest) };
}

async function waitForGoogleIdentity(timeoutMs = 5000): Promise<NonNullable<Window["google"]>> {
  const start = Date.now();
  while (!window.google?.accounts?.id) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(
        "Não foi possível carregar o login do Google. Verifique sua conexão e tente novamente.",
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return window.google;
}

export async function signInWithGoogleIdentity(
  clientId: string,
): Promise<{ credential: string; nonce: string }> {
  const google = await waitForGoogleIdentity();
  const { nonce, hashedNonce } = await createNonce();

  return new Promise((resolve, reject) => {
    google.accounts.id.initialize({
      client_id: clientId,
      nonce: hashedNonce,
      callback: (response) => resolve({ credential: response.credential, nonce }),
    });

    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        reject(
          new Error(
            "Não foi possível abrir o login do Google. Tente novamente.",
          ),
        );
      }
    });
  });
}
