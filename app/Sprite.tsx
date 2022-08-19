import type { SpriteProps } from "~/SpriteProps";
import spriteSrc from "~/sprites.svg";

export default function Sprite({ style, name, ...svgProps }: SpriteProps) {
  return (
    <svg {...svgProps}>
      <use href={`${spriteSrc}#${name}`} />
    </svg>
  );
}
