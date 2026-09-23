export function normalizeSql(value) {
  return value
    .replace(/--.*$/gm, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/;\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function evaluateSql(challenge, input) {
  const normalized = normalizeSql(input);
  if (!normalized) return false;
  return challenge.required.every((pattern) => pattern.test(normalized));
}
