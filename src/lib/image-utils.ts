export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Не удалось прочитать файл"));
      }
    };
    reader.onerror = () => reject(reader.error || new Error("Ошибка чтения файла"));
    reader.readAsDataURL(file);
  });
}

export async function processImageFile(
  file: File,
  maxDimension = 512,
  quality = 0.8
): Promise<string> {
  const dataUrl = await fileToDataUrl(file);

  if (typeof window === "undefined" || !window.HTMLCanvasElement) {
    return dataUrl;
  }

  // Preserve animated GIFs
  if (file.type === "image/gif") {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // If already small in dimensions and file size, keep original
      if (width <= maxDimension && height <= maxDimension && file.size < 150 * 1024) {
        resolve(dataUrl);
        return;
      }

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Fill with white in case of transparent PNG converted to JPEG
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Always compress to JPEG for optimal size and Ollama vision processing
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      // Fallback to original data URL if image rendering fails
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

