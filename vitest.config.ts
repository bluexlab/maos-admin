import { fileURLToPath } from "url";
import { configDefaults, defineConfig } from "vitest/config";
import { loadEnv } from "vite";

const vitestConfig = ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };

  return defineConfig({
    test: {
      globals: true,
      exclude: [...configDefaults.exclude, "**/playwright/**"],
      alias: {
        "~/": fileURLToPath(new URL("./src/", import.meta.url)),
      },
      maxWorkers: 3,
      minWorkers: 2,
      poolOptions: {
        forks: {
          maxForks: 3,
          minForks: 2,
        },
      },
    },
  });
};

export default vitestConfig;
