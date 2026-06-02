const DEFAULT_KEY = "YourSuperSecretKeyForExamOnLan13";
const DEFAULT_IV = "YourSuperSecretI";

const toBytes = (text) => new TextEncoder().encode(text);

const fromBase64 = (b64) => {
  const bin = atob(b64.replace(/\s+/g, ""));
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
};

export async function decryptToken(token, keyText = DEFAULT_KEY, ivText = DEFAULT_IV) {
  const key = await crypto.subtle.importKey(
    "raw",
    toBytes(keyText),
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: toBytes(ivText) },
    key,
    fromBase64(token)
  );

  return new TextDecoder().decode(decrypted);
}
