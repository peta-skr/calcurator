export default {
  preset: "ts-jest/presets/default-esm", // ESM用プリセット
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};
