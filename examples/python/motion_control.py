"""Submit and poll Seedance Motion Control jobs through Muapi."""

import os
import time
from typing import Any

import requests

API_BASE = "https://api.muapi.ai/api/v1"


def generate(
    *,
    video_url: str,
    images_list: list[str],
    version: str = "2.5",
    prompt: str | None = None,
    duration: int = 8,
    aspect_ratio: str = "16:9",
    timeout: int = 1800,
) -> dict[str, Any]:
    """Submit a recast and wait for its result. Requires MUAPI_API_KEY."""
    api_key = os.environ["MUAPI_API_KEY"]
    if version not in {"2", "2.5"}:
        raise ValueError("version must be '2' or '2.5'")

    endpoint = f"seedance-{version}-motion-control"
    payload: dict[str, Any] = {
        "video_url": video_url,
        "images_list": images_list,
        "duration": duration,
        "aspect_ratio": aspect_ratio,
        "generate_audio": False,
    }
    if prompt:
        payload["prompt"] = prompt
    if version == "2":
        payload["quality"] = "high"
    else:
        payload["high_bitrate"] = True
        payload["seed"] = 42

    headers = {"x-api-key": api_key, "Content-Type": "application/json"}
    response = requests.post(f"{API_BASE}/{endpoint}", headers=headers, json=payload, timeout=60)
    response.raise_for_status()
    request_id = response.json()["request_id"]

    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        result_response = requests.get(
            f"{API_BASE}/predictions/{request_id}/result", headers=headers, timeout=60
        )
        result_response.raise_for_status()
        result = result_response.json()
        status = result.get("status")
        if status == "completed":
            return result
        if status == "failed":
            raise RuntimeError(f"Generation failed: {result.get('error', result)}")
        time.sleep(3)

    raise TimeoutError(f"Timed out waiting for Muapi request {request_id}")


if __name__ == "__main__":
    result = generate(
        version=os.getenv("SEEDANCE_VERSION", "2.5"),
        video_url="https://example.com/reference-performance.mp4",
        images_list=["https://example.com/new-performer.jpg"],
        prompt="Replace the dancer with the person in the reference image; preserve the room.",
    )
    print(result["output"]["video"])
