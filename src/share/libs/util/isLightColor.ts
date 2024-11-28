export function isLightColor(hex: string): boolean {
  // HEX 코드가 3자리일 경우 6자리로 변환
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  // HEX 코드에서 RGB 값 추출
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // YIQ 공식 사용
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // YIQ 값이 128 이상이면 밝은 색, 그렇지 않으면 어두운 색
  return yiq >= 128;
}
