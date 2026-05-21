const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    environment: "node",
    include: ["Test/**/*.js"],
    clearMocks: true,
    globals: true,
  },
});
