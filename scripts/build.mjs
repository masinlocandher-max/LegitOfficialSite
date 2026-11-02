import { cp, mkdir, rm } from "node:fs/promises";
const target = new URL("../dist/studio/", import.meta.url);
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(new URL("../studio/", import.meta.url), target, { recursive: true });
console.log(
  "Built dist/studio. Deploy through the customer application; acquisition routing is unchanged.",
);
