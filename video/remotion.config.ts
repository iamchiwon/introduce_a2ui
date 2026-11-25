import { Config } from "@remotion/cli/config";

Config.setEntryPoint("src/Root.tsx");
Config.overrideWebpackConfig((config) => ({
  ...config,
  module: {
    ...config.module,
    rules: [
      ...(config.module?.rules ?? []),
      { test: /\.swift$/, type: "asset/source" },
    ],
  },
}));
