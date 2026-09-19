type ClassValue = string | number | null | undefined | false | ClassValue[];

function flatten(values: ClassValue[]): string[] {
  return values.flatMap((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return flatten(value);
    return [String(value)];
  });
}

export function cn(...inputs: ClassValue[]): string {
  return flatten(inputs).join(" ");
}
