export async function generateKey() {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(data, key) {
  // Convert string to Uint8Array if necessary
  const encoder = new TextEncoder();
  const encodedData = typeof data === 'string' ? encoder.encode(data) : data;

  // AES-GCM requires a 12-byte initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedData
  );

  return {
    iv,
    encryptedData: encryptedBuffer,
  };
}

export async function decryptData(encryptedData, key) {
  // encryptedData should be the object returned by encryptData: { iv, encryptedData }
  const { iv, encryptedData: buffer } = encryptedData;

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    buffer
  );

  return decryptedBuffer;
}
