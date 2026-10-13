export function parseStringArray(value: unknown): string[] {
  let parsed = value;
  for (let attempt = 0; attempt < 3 && typeof parsed === 'string'; attempt++) {
    parsed = JSON.parse(parsed);
  }
  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
    throw new Error('Invalid product list data');
  }
  return parsed;
}

export function serializeStringArray(value: unknown): string {
  return JSON.stringify(parseStringArray(value));
}

export function serializeProduct<T extends { images: string; sizes: string; colors: string }>(product: T) {
  return {
    ...product,
    images: parseStringArray(product.images),
    sizes: parseStringArray(product.sizes),
    colors: parseStringArray(product.colors)
  };
}
