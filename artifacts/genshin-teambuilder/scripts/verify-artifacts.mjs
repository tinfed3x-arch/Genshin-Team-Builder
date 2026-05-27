const d = require("./src/data/genshin-data.json");
const newArtifacts = ["Celestial Gift", "Disenchantment in Deep Shadow", "Prayers for Destiny", "Prayers for Illumination", "Prayers for Wisdom", "Prayers to Springtime"];
console.log("=== Data file check ===");
for (const name of newArtifacts) {
  const inList = d.artifactNames.includes(name);
  const hasData = !!d.artifacts[name];
  console.log(`${name}: in list=${inList}, has data=${hasData}`);
}
console.log("\n=== genshin.ts check ===");
const fs = require("fs");
const src = fs.readFileSync("src/lib/genshin.ts", "utf8");
for (const name of newArtifacts) {
  console.log(`${name} in ARTIFACT_NAMES:`, src.includes(`"${name}"`));
}
