import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // desativa erro de any
      "@typescript-eslint/no-unused-vars": "off", // desativa erro de variável não usada
      "@next/next/no-img-element": "off", // desativa aviso do <img>
    },
  },
];

export default eslintConfig;
