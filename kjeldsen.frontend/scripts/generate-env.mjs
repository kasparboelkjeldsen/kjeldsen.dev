import { SecretClient } from "@azure/keyvault-secrets";
import fs from "fs/promises";
import path from "path";
import process from "process";
import { ClientSecretCredential } from "@azure/identity";
import 'dotenv/config'

const mappingFilePath = path.resolve("./secrets-keys.json");
const outputEnvPath = path.resolve("./.env");

const keyVaultUrl = "https://kjdevkv.vault.azure.net/";

console.log(process.env.AZURE_TENANT_ID)

const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);
const client = new SecretClient(keyVaultUrl, credential);

const run = async () => {
  console.log("🔍 Reading secret mappings from", mappingFilePath);

  const json = await fs.readFile(mappingFilePath, "utf-8");
  const secrets = JSON.parse(json);

  let output = "";

  for (const entry of secrets) {
    const key = entry.key;
    const as = entry.as;

    try {
      const result = await client.getSecret(key);
      output += `${as}=${result.value}\n`;
      console.log(`✅ Loaded ${key} → ${as}`);
    } catch (err) {
      console.warn(`⚠️ Failed to load ${key}: ${err.message}`);
    }
  }

  await fs.writeFile(outputEnvPath, output, "utf-8");
  console.log("📦 .env written to", outputEnvPath);
};

run().catch((err) => {
  console.error("💥 Failed to generate .env:", err);
  process.exit(1);
});
