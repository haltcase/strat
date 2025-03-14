import { build, emptyDir } from "@deno/dnt";

import denoJson from "../deno.json" with { type: "json" };
import { join } from "jsr:@std/path@^1.0.8/unstable-join";
import { resolve } from "jsr:@std/path@1/resolve";

const toPackagePath = (path: string): string =>
	resolve(import.meta.dirname || ".", "..", path);

Deno.chdir(toPackagePath("src"));

const outDirectory = toPackagePath("npm");
const repoUrl = "https://github.com/haltcase/strat";

console.log(`Building npm package to ${outDirectory}...`);

await emptyDir(outDirectory);

await build({
	entryPoints: [toPackagePath("src/index.ts")],
	outDir: outDirectory,
	scriptModule: "umd",
	packageManager: "pnpm",

	shims: {
		deno: true,
	},
	package: {
		name: "strat",
		version: Deno.args[0] || denoJson.version,
		description: denoJson.description,
		author: "Bo Lingen <bo@haltcase.dev> (https://haltcase.dev)",
		license: "MIT",
		repository: {
			type: "git",
			url: `git+${repoUrl}.git`,
		},
		homepage: repoUrl,
		bugs: {
			url: `${repoUrl}/issues`,
		},
		keywords: [
			"string",
			"formatting",
			"python",
			"partial",
			"application",
			"language",
			"util",
			"template",
			"interpolation",
		],
		sideEffects: false,
	},
	postBuild: () => {
		Deno.copyFileSync(toPackagePath("LICENSE"), join(outDirectory, "LICENSE"));
		Deno.copyFileSync(
			toPackagePath("readme.md"),
			join(outDirectory, "readme.md"),
		);
	},
});
