export const spriteNames = [
  "outline:academic-cap",
  "outline:adjustments",
  "outline:annotation",
  "outline:archive",
  "solid:academic-cap",
  "solid:adjustments",
  "solid:annotation",
  "solid:archive",
] as const;
type SpriteName = typeof spriteNames[number];
export type SpriteProps = {
  name: SpriteName;
} & JSX.IntrinsicElements["svg"];
