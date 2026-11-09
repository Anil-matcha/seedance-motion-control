/** Submit and poll Seedance Motion Control jobs through Muapi (Node.js 18+). */

const API_BASE = "https://api.muapi.ai/api/v1";

// version -> endpoint: seedance-{version}-motion-control
const VERSIONS = ["2", "2.5", "2.5-intl", "2.5-spicy", "2-spicy"];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generate({
  videoUrl,
  imagesList = [],
  version = "2.5",
  prompt,
  duration = 8,
  aspectRatio = "16:9",
  timeoutMs = 30 * 60 * 1000,
}) {
  const apiKey = process.env.MUAPI_API_KEY;
  if (!apiKey) throw new Error("Set MUAPI_API_KEY first");
  if (!VERSIONS.includes(version)) throw new Error(`version must be one of ${VERSIONS.join(", ")}`);

  const endpoint = `seedance-${version}-motion-control`;
  const payload = {
    video_url: videoUrl,
    images_list: imagesList,
    duration,
    aspect_ratio: aspectRatio,
    generate_audio: false,
    ...(prompt ? { prompt } : {}),
    ...(version.split("-")[0] === "2" // "2" and "2-spicy" use the Seedance 2 request shape
      ? { quality: "high" }
      : { high_bitrate: true, seed: 42 }),
  };
  const headers = { "x-api-key": apiKey, "Content-Type": "application/json" };
  const submit = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!submit.ok) throw new Error(`Submit failed (${submit.status}): ${await submit.text()}`);
  const { request_id: requestId } = await submit.json();

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const response = await fetch(`${API_BASE}/predictions/${requestId}/result`, { headers });
    if (!response.ok) throw new Error(`Poll failed (${response.status}): ${await response.text()}`);
    const result = await response.json();
    if (result.status === "completed") return result;
    if (result.status === "failed") throw new Error(`Generation failed: ${result.error ?? JSON.stringify(result)}`);
    await sleep(3000);
  }
  throw new Error(`Timed out waiting for Muapi request ${requestId}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await generate({
    version: process.env.SEEDANCE_VERSION ?? "2.5",
    videoUrl: "https://example.com/reference-performance.mp4",
    imagesList: ["https://example.com/new-performer.jpg"],
    prompt: "Replace the dancer with the person in the reference image; preserve the room.",
  });
  console.log(result.output.video);
}
