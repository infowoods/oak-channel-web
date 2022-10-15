export function formatNum(val) {
  return Number(val)
    .toFixed(8)
    .replace(/\.?0+$/, '')
}

export function formatAdd(a, b) {
  return formatNum(Number(a) + Number(b))
}
