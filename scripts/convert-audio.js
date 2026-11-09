import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

// Runs on the host, not in the container, because it uses the locally installed ffmpeg.
const SOURCE_DIR = "assets-src/audio";
const OUTPUT_DIR = "public/assets/audio";
const TARGET_LUFS = -16;
// Sample peak limit of -2 dBFS leaves headroom for inter-sample peaks and encoder overshoot.
const PEAK_LIMIT = 0.794;
const SAMPLE_RATE = "44100";
// EBU R128 loudness needs at least 400 ms of audio, so shorter clips are measured as a loop.
const MIN_MEASURE_SECONDS = 3;
const CODECS = { ogg: "libvorbis", mp3: "libmp3lame" };
const DEFAULT_QUALITY = { ogg: "4", mp3: "4" };
const QUALITY = { music: { ogg: "2", mp3: "6" } };

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} failed:\n${result.stderr}`);
  }
  return result;
}

function measureLoudness(input) {
  const probe = ["-v", "error", "-show_entries", "format=duration"];
  const { stdout } = run("ffprobe", [...probe, "-of", "csv=p=0", input]);
  const loop =
    Number(stdout) < MIN_MEASURE_SECONDS
      ? ["-stream_loop", "-1", "-t", String(MIN_MEASURE_SECONDS)]
      : [];
  const measure = ["-af", "loudnorm=print_format=json", "-f", "null", "-"];
  const { stderr } = run("ffmpeg", [...loop, "-i", input, ...measure]);
  const start = stderr.lastIndexOf("{");
  const end = stderr.lastIndexOf("}") + 1;
  return Number(JSON.parse(stderr.slice(start, end)).input_i);
}

rmSync(OUTPUT_DIR, { recursive: true, force: true });
mkdirSync(OUTPUT_DIR, { recursive: true });

const sources = readdirSync(SOURCE_DIR).filter((file) => file.endsWith(".mp3"));
for (const file of sources) {
  const name = path.basename(file, ".mp3");
  const input = path.join(SOURCE_DIR, file);
  const loudness = measureLoudness(input);
  const gain = (TARGET_LUFS - loudness).toFixed(2);
  const filter = `volume=${gain}dB,alimiter=limit=${PEAK_LIMIT}:level=0`;
  const quality = QUALITY[name] ?? DEFAULT_QUALITY;

  for (const [extension, codec] of Object.entries(CODECS)) {
    const output = path.join(OUTPUT_DIR, `${name}.${extension}`);
    const audioOnly = ["-map", "0:a", "-map_metadata", "-1"];
    const encode = ["-c:a", codec, "-q:a", quality[extension]];
    run("ffmpeg", [
      "-y",
      "-i",
      input,
      ...audioOnly,
      "-af",
      filter,
      "-ar",
      SAMPLE_RATE,
      ...encode,
      output,
    ]);
  }
  console.log(`${name}: ${loudness} LUFS, gain ${gain} dB`);
}
