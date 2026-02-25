#!/usr/bin/env node
/**
 * Generates realistic AI portrait images for the 5 ColdCall Pro personas using DALL·E 3.
 * Saves them to public/personas/ so the app can use local, consistent images.
 *
 * Run once: node scripts/generate-persona-images.mjs
 * Requires OPENAI_API_KEY in .env.local (or in env).
 */

import "./setup-fetch.mjs";
import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "personas");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.warn("No .env.local found; using process.env.OPENAI_API_KEY");
    return process.env.OPENAI_API_KEY;
  }
  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(/OPENAI_API_KEY=(.+)/);
  const key = match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
  return key || process.env.OPENAI_API_KEY;
}

function downloadUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

const PERSONAS = [
  {
    id: "gatekeeper",
    name: "Mark Davidson",
    prompt:
      "Professional corporate headshot photograph of a fictional man in his early 40s, short brown hair, wearing a dress shirt, neutral expression, direct gaze. Soft studio lighting, plain gray background, photorealistic, 8k, high quality. Head and shoulders only.",
  },
  {
    id: "skeptic",
    name: "Rachel Torres",
    prompt:
      "Professional corporate headshot photograph of a fictional woman in her late 30s, dark hair, professional attire, intelligent and thoughtful expression. Soft studio lighting, plain neutral background, photorealistic, 8k, high quality. Head and shoulders only.",
  },
  {
    id: "friendly-dead-end",
    name: "Tom Ashworth",
    prompt:
      "Professional corporate headshot photograph of a fictional man in his mid 30s, friendly smile, approachable, wearing business casual shirt. Soft studio lighting, plain gray background, photorealistic, 8k, high quality. Head and shoulders only.",
  },
  {
    id: "hostile",
    name: "Diana Kessler",
    prompt:
      "Professional corporate headshot photograph of a fictional woman in her late 40s, executive presence, sharp expression, no-nonsense, wearing a blazer. Soft studio lighting, plain neutral background, photorealistic, 8k, high quality. Head and shoulders only.",
  },
  {
    id: "warm-referral",
    name: "James Obi",
    prompt:
      "Professional corporate headshot photograph of a fictional man in his mid 30s, warm but professional expression, wearing a dress shirt. Soft studio lighting, plain gray background, photorealistic, 8k, high quality. Head and shoulders only.",
  },
];

async function generateAndSave(openai, persona) {
  const res = await openai.images.generate({
    model: "dall-e-3",
    prompt: persona.prompt,
    n: 1,
    size: "1024x1024",
    quality: "hd",
    style: "natural",
    response_format: "url",
  });

  const url = res.data?.[0]?.url;
  if (!url) throw new Error("No image URL in response");

  const buffer = await downloadUrl(url);
  const outPath = path.join(outDir, `${persona.id}.png`);
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved ${persona.name} -> ${outPath}`);
}

async function main() {
  const apiKey = loadEnv();
  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY. Set it in .env.local or the environment.");
    process.exit(1);
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    console.log(`Created ${outDir}`);
  }

  const openai = new OpenAI({ apiKey });

  for (const persona of PERSONAS) {
    try {
      await generateAndSave(openai, persona);
      await new Promise((r) => setTimeout(r, 1500));
    } catch (e) {
      console.error(`Failed for ${persona.name}:`, e.message);
      process.exit(1);
    }
  }

  console.log("\nDone. Persona images are in public/personas/");
}

main();
