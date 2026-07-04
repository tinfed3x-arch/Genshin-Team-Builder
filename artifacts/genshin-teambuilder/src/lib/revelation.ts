// Witch's Revelation Passive data for characters.
// This is a new in-game feature not yet captured by genshin-db.
// Data sourced from the Genshin Impact Fandom wiki (https://genshin-impact.fandom.com/wiki/Witch%27s_Revelation_Passive).

export const REVELATION_CHARACTERS = new Set([
  "Beidou",
  "Cyno",
  "Diona",
  "Qiqi",
  "Wriothesley",
  "Yae Miko",
  "Yumemizuki Mizuki",
]);

export const isRevelation = (name: string | null): boolean =>
  name != null && REVELATION_CHARACTERS.has(name);

export type RevelationData = {
  name: string;
  description: string;
};

export const REVELATION_DATA: Record<string, RevelationData> = {
  Beidou: {
    name: "Witch's Revelation: Polaris",
    description:
      "When holding down on the Elemental Skill Tidecaller, 1 stack of power will accumulate every 0.8s, even when not under attack. This increases the DMG dealt at the point of unleashing.\nAdditionally, holding down to unleash Tidecaller and hitting the opponent also gives extra boosts based on the power accumulated: every stack active decreases Beidou's Elemental Skill CD by 4s, as well as regenerates 8 Elemental Energy for her. This effect can trigger once every 15s.\nAdditionally, when inside a Polestar Field, Beidou will enter the Radiance: Stellar-Conduct state.",
  },
  Cyno: {
    name: "Witch's Revelation: A Star With Which to Start the Journey",
    description:
      "If Cyno unleashes the Elemental Skill Secret Rite: Chasmic Soulfarer while not in the Pactsworn Pathclearer state, he will enter Pactsworn Pathclearer for 6s.\nAdditionally, when in a Polestar Field, Cyno will enter the Radiance: Stellar-Conduct state.",
  },
  Diona: {
    name: "Witch's Revelation: Choice Treasures",
    description:
      "Within 20s after using the Elemental Skill Icy Paws, Diona will also fire off three Icy Paws when party members trigger Superconduct, Stellar-Conduct, or Cryo Swirl reactions. Icy Paws fired this way cannot generate Elemental Particles, nor will they generate a shield upon hitting opponents. This effect can occur once every 3.5s.\nAdditionally, when inside a Polestar Field, Diona will enter the Radiance: Stellar-Conduct state.",
  },
  Qiqi: {
    name: "Witch's Revelation: Seven Sacred Treasures",
    description:
      "The cooldown of the Elemental Skill Adeptus Art: Herald of Frost is reduced to 15s.\nRadiance: Stellar-Conduct: While the Herald of Frost is on the field, characters in Qiqi's party have their Superconduct, Stellar-Conduct, and Cryo Swirl Reaction DMG increased by 50%.\nAdditionally, when inside a Polestar Field, Qiqi will enter the Radiance: Stellar-Conduct state.",
  },
  Wriothesley: {
    name: "Witch's Revelation: There Shall Be an Unveiling for Injustice",
    description:
      "Radiance: Stellar-Conduct: The Ascension Talent \"There Shall Be a Plea for Justice\" is changed to the following:\nWhen Wriothesley's HP is less than 60%, he will obtain a \"Gracious Rebuke: Unveiling.\" This enhances the next Charged Attack of his Normal Attack: Forceful Fists of Frost into Luster: Vaulting Fist, which will not consume Stamina and restores 30% Max HP to Wriothesley upon hit. Wriothesley can gain HP in this way once every 2s.\nAdditionally, the third and fifth strikes of Repelling Fist enhanced by Chilling Penalty will deal 60% and 80% of their original Cryo DMG respectively, while Luster: Vaulting Fist will deal 100% of its original AoE Cryo DMG. The aforementioned DMG is considered as Stellar-Conduct DMG, and Wriothesley deals 30% increased Stellar-Conduct DMG.\nAdditionally, when inside a Polestar Field, Wriothesley will enter the Radiance: Stellar-Conduct state.",
  },
  "Yae Miko": {
    name: "Witch's Revelation: Edict of Cleansing",
    description:
      "When your party members trigger Superconduct, it will be changed to Stellar-Conduct, and your party members' Base Stellar-Conduct DMG will be increased based on Sandrone's ATK: Every 100 ATK she has increases the Base Stellar-Conduct DMG by 0.7%. The maximum increase that can be gained this way is 14%.\nAdditionally, when Sandrone is within a Polestar Field, she will enter the Radiance: Stellar-Conduct state.",
  },
  "Yumemizuki Mizuki": {
    name: "Witch's Revelation: Vast Be the Dream",
    description:
      "When Yumemizuki Mizuki triggers a Swirl reaction while in the Dreamdrifter state, the next instance of periodic AoE Anemo DMG she deals to nearby enemies during that same state will be increased by 1,000% of her Elemental Mastery. The aforementioned effect can trigger once every 2.5s.\nAdditionally, while Yumemizuki Mizuki is in the Dreamdrifter state, the Elemental Mastery of nearby party characters is increased by 10% of Yumemizuki Mizuki's Elemental Mastery.",
  },
};

export const getRevelationData = (name: string | null): RevelationData | null => {
  if (!name) return null;
  return REVELATION_DATA[name] ?? null;
};
