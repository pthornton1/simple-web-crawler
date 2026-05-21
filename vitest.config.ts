import { defineConfig, defaultInclude, defaultExclude } from "vitest/config";

export default defineConfig({
  test: {
    passWithNoTests: true,
    include: [...defaultInclude, "test/**/*.ts"],
    exclude: [...defaultExclude, "test/**/*.js"],
  },
  
});
