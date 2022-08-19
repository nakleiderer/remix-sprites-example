import Sprite from "~/Sprite";
import { spriteNames } from "~/SpriteProps";

export default function Index() {
  return (
    <main className="max-w-7xl mx-auto p-8">
      <h1 className="font-bold text-3xl">Remix Sprites Example</h1>
      <ul className="grid gap-12 mt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {spriteNames.map((s, idx) => (
          <li
            className="flex flex-col justify-center items-center gap-3"
            key={s}
          >
            <div className="border border-gray-100 border-2 rounded-md px-8 py-4">
              <Sprite
                className={`w-5 h-5 text-blue-500 ${
                  idx % 2 === 0 ? "text-green-500" : "text-blue-500"
                }`}
                name={s}
              />
            </div>
            <p className="text-center font-mono text-sm">{s}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
