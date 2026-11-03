export async function prepareImage(file, avatar = false) {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw Error("Выберите JPEG, PNG или WebP.");
  if (file.size > 12 * 1024 * 1024)
    throw Error("Изображение должно быть меньше 12 МБ.");
  const image = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  try {
    const canvas = document.createElement("canvas"),
      max = avatar ? 320 : 1280,
      scale = Math.min(1, max / Math.max(image.width, image.height));
    canvas.width = avatar ? 320 : Math.round(image.width * scale);
    canvas.height = avatar ? 320 : Math.round(image.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#201d28";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (avatar) {
      let side = Math.min(image.width, image.height);
      ctx.drawImage(
        image,
        (image.width - side) / 2,
        (image.height - side) / 2,
        side,
        side,
        0,
        0,
        320,
        320,
      );
    } else ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (let q = 0.86; q >= 0.36; q -= 0.1) {
      let data = canvas.toDataURL("image/jpeg", q);
      if (data.length < (avatar ? 160000 : 680000)) return data;
    }
    throw Error("Изображение слишком сложное. Выберите файл поменьше.");
  } finally {
    image.close();
  }
}
export function imageSource(value) {
  return /^\/api\/media\/[\w-]+$/.test(value || "") ||
    /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value || "")
    ? value
    : null;
}
