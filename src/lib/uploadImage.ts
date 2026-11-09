/** Envia a imagem direto ao armazenamento pela URL assinada e devolve o endereço público. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const presign = await fetch("/api/v1/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type, folder }),
  });
  const data = await presign.json();
  if (!presign.ok) throw new Error(data.message || "Não foi possível preparar o envio.");

  const upload = await fetch(data.url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!upload.ok) throw new Error("O envio da imagem falhou.");
  return data.publicUrl;
}
