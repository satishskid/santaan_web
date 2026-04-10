import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = {};
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
      continue;
    }

    flags[key] = next;
    i += 1;
  }

  return { command: positionals[0] || "help", flags };
}

function loadEnv(envFile) {
  if (envFile) {
    dotenv.config({ path: envFile });
    return;
  }

  dotenv.config({ path: ".env.local" });
  dotenv.config();
}

function speechConfig() {
  const key = process.env.AZURE_SPEECH_KEY?.trim() || "";
  const region = process.env.AZURE_SPEECH_REGION?.trim() || "";
  const endpoint = process.env.AZURE_SPEECH_ENDPOINT?.trim() || "";
  const locale = process.env.AZURE_SPEECH_LOCALE?.trim() || "or-IN";
  const voice = process.env.AZURE_SPEECH_TTS_VOICE?.trim() || "or-IN-SubhasiniNeural";
  const outputFormat =
    process.env.AZURE_SPEECH_OUTPUT_FORMAT?.trim() || "audio-24khz-48kbitrate-mono-mp3";

  const baseEndpoint =
    endpoint || (region ? `https://${region}.tts.speech.microsoft.com` : "");

  if (!key || !baseEndpoint) {
    throw new Error(
      "Missing Azure Speech configuration. Set AZURE_SPEECH_KEY and either AZURE_SPEECH_REGION or AZURE_SPEECH_ENDPOINT."
    );
  }

  return { key, region, endpoint: baseEndpoint, locale, voice, outputFormat };
}

async function listVoices(config) {
  const response = await fetch(`${config.endpoint}/cognitiveservices/voices/list`, {
    headers: {
      "Ocp-Apim-Subscription-Key": config.key,
    },
  });

  if (!response.ok) {
    throw new Error(`Voice list request failed: ${response.status} ${response.statusText}`);
  }

  const voices = await response.json();
  const filtered = Array.isArray(voices)
    ? voices.filter((voice) => {
        const shortName = String(voice?.ShortName || "");
        const locale = String(voice?.Locale || "");
        return locale === "or-IN" || shortName.startsWith("or-IN-");
      })
    : [];

  console.log(JSON.stringify({ total: Array.isArray(voices) ? voices.length : 0, odia: filtered }, null, 2));
}

function buildSsml({ voice, text, rate = "0%", pitch = "0%" }) {
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

  return [
    '<speak version="1.0" xml:lang="or-IN" xmlns="http://www.w3.org/2001/10/synthesis">',
    `  <voice name="${voice}">`,
    `    <prosody rate="${rate}" pitch="${pitch}">${escaped}</prosody>`,
    "  </voice>",
    "</speak>",
  ].join("\n");
}

async function synthesize(config, flags) {
  const voice = String(flags.voice || config.voice);
  const text =
    String(flags.text || "").trim() ||
    "ନମସ୍କାର, ମୁଁ ସନ୍ତାନ Fertility Centre ରୁ ସ୍ୱର କହୁଛି. କହନ୍ତୁ, ଆପଣଙ୍କୁ କେମିତି help କରିପାରିବି?";
  const outFile =
    String(flags.out || "").trim() ||
    path.join(process.cwd(), "tmp", `${voice.replaceAll(":", "_")}-sample.mp3`);
  const rate = String(flags.rate || "0%");
  const pitch = String(flags.pitch || "0%");
  const ssml = buildSsml({ voice, text, rate, pitch });

  await fs.mkdir(path.dirname(outFile), { recursive: true });

  const response = await fetch(`${config.endpoint}/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": config.key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": config.outputFormat,
      "User-Agent": "santaan-web/azure-speech-spike",
    },
    body: ssml,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Synthesis request failed: ${response.status} ${response.statusText}\n${body}`);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outFile, audio);

  console.log(
    JSON.stringify(
      {
        ok: true,
        voice,
        locale: config.locale,
        outputFormat: config.outputFormat,
        outFile,
      },
      null,
      2
    )
  );
}

function printHelp() {
  console.log(`Usage:
  node src/scripts/azure-speech-spike.mjs voices [--env-file .env.local]
  node src/scripts/azure-speech-spike.mjs tts [--voice or-IN-SubhasiniNeural] [--text "..."] [--out tmp/sample.mp3]

Required env:
  AZURE_SPEECH_KEY
  AZURE_SPEECH_REGION or AZURE_SPEECH_ENDPOINT
`);
}

async function main() {
  const { command, flags } = parseArgs(process.argv);
  loadEnv(typeof flags["env-file"] === "string" ? flags["env-file"] : undefined);

  if (command === "help" || flags.help) {
    printHelp();
    return;
  }

  const config = speechConfig();

  if (command === "voices") {
    await listVoices(config);
    return;
  }

  if (command === "tts") {
    await synthesize(config, flags);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
