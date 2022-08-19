import fg from "fast-glob";
import { readFile, writeFile } from "fs/promises";
import type { IElement } from "happy-dom";
import { Window } from "happy-dom";
import { join, sep } from "path";
import ts, { factory } from "typescript";

export type Config = {
  spritesPath: string;
  spriteTypesOutputPath: string;
  spriteOutputPath: string;
};

type Sprite = {
  id: string;
  relativePath: string;
  path: string;
  contents: string;
};

const config: Config = {
  spritesPath: "./app/sprites",
  spriteTypesOutputPath: "./app/SpriteProps.ts",
  spriteOutputPath: "./app/sprites.svg",
};

async function main() {
  await updateSprites();
}

async function updateSprites() {
  const entries = await fg(["**/*.svg"], { cwd: config.spritesPath });

  const sprites: Sprite[] = await Promise.all(
    entries.map(async (e) => {
      const path = join(config.spritesPath, e);
      const contents = await readFile(path, { encoding: "utf-8" });
      const id = e.replace(sep, ":").replace(".svg", "").trim();

      return {
        id,
        relativePath: e,
        path,
        contents,
      };
    })
  );

  const spriteContents = generateSprite(sprites);
  const spritePropsContents = generateSpriteProps(sprites);
  await Promise.all([
    writeFile(config.spriteOutputPath, spriteContents),
    writeFile(config.spriteTypesOutputPath, spritePropsContents),
  ]);

  console.log(`✅ Successfully generated sprite for ${sprites.length} SVGs.`);
}

function generateSprite(sprites: Pick<Sprite, "contents" | "id">[]): string {
  const window = new Window();
  const document = window.document;
  const body = document.body;
  const svg = document.createElement("svg");
  body.appendChild(svg);

  sprites.forEach((e) => {
    const fragment = document.createDocumentFragment();
    fragment.append(e.contents);

    const symbol = replaceElement(
      fragment.querySelector("svg"),
      document.createElement("symbol")
    );

    symbol.setAttribute("id", e.id);

    svg.appendChild(symbol);
  });

  return document.body.querySelector("svg").outerHTML;
}

function generateSpriteProps(sprites: Pick<Sprite, "id">[]): string {
  const nodes = factory.createNodeArray([
    factory.createVariableStatement(
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createVariableDeclarationList(
        [
          factory.createVariableDeclaration(
            factory.createIdentifier("spriteNames"),
            undefined,
            undefined,
            factory.createAsExpression(
              factory.createArrayLiteralExpression(
                sprites.map((s) => factory.createStringLiteral(s.id)),
                false
              ),
              factory.createTypeReferenceNode(
                factory.createIdentifier("const"),
                undefined
              )
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    ),
    factory.createTypeAliasDeclaration(
      undefined,
      undefined,
      factory.createIdentifier("SpriteName"),
      undefined,
      factory.createIndexedAccessTypeNode(
        factory.createTypeQueryNode(
          factory.createIdentifier("spriteNames"),
          undefined
        ),
        factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
      )
    ),
    factory.createTypeAliasDeclaration(
      undefined,
      [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      factory.createIdentifier("SpriteProps"),
      undefined,
      factory.createIntersectionTypeNode([
        factory.createTypeLiteralNode([
          factory.createPropertySignature(
            undefined,
            factory.createIdentifier("name"),
            undefined,
            factory.createTypeReferenceNode(
              factory.createIdentifier("SpriteName"),
              undefined
            )
          ),
        ]),
        factory.createIndexedAccessTypeNode(
          factory.createTypeReferenceNode(
            factory.createQualifiedName(
              factory.createIdentifier("JSX"),
              factory.createIdentifier("IntrinsicElements")
            ),
            undefined
          ),
          factory.createLiteralTypeNode(factory.createStringLiteral("svg"))
        ),
      ])
    ),
  ]);

  const file = ts.createSourceFile(
    "source.ts",
    "",
    ts.ScriptTarget.ESNext,
    false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const res = printer.printList(ts.ListFormat.MultiLine, nodes, file);
  return res;
}

function replaceElement(existing: IElement, replacement: IElement) {
  replacement.append(...existing.children.map((c) => c.cloneNode(true)));

  existing
    .getAttributeNames()
    .map((n) => existing.getAttributeNode(n))
    .forEach((a) => {
      replacement.setAttributeNode(a);
    });

  existing.replaceWith(replacement);

  return replacement;
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    console.log("❌ Sprite compilation failed");
  });
}
