
/**
 * Converts a base64 string to a File object.
 * @param base64 The base64 encoded string.
 * @param filename The desired filename for the output File.
 * @param mimeType The MIME type of the file.
 * @returns A Promise that resolves with the created File object.
 */
export const base64ToFile = async (base64: string, filename: string, mimeType: string): Promise<File> => {
  const res = await fetch(`data:${mimeType};base64,${base64}`);
  const blob = await res.blob();
  return new File([blob], filename, { type: mimeType });
};
