# Seedance Motion Control API examples

Recast the performers in an existing video while keeping its motion, choreography, blocking, camera work, and location. This repository documents the two Seedance Motion Control endpoints available through the [Muapi API](https://muapi.ai).

## Related Projects

- [Awesome AI Video Models](https://github.com/Anil-matcha/awesome-ai-video-models) — compare video generation models and APIs.
- [Muapi](https://muapi.ai) — one API for generative media models.

## What this repo covers

| Muapi endpoint | Character images | Clip duration | Endpoint-specific options | Starting generation price* |
| --- | ---: | ---: | --- | ---: |
| [`seedance-2-motion-control`](https://muapi.ai/playground/seedance-2-motion-control) | Up to 9 | 4–15 sec | `quality`: `high` or `basic`; `generate_audio` | From $0.21/sec + preprocessing |
| [`seedance-2.5-motion-control`](https://muapi.ai/playground/seedance-2.5-motion-control) | Up to 30 | 4–30 sec | `seed`, `high_bitrate`, `generate_audio` | From $0.34/sec + preprocessing |

Both variants require `video_url`. `images_list` contains the new performer reference images in the order they should appear. `prompt` is optional; when omitted, performer roles are inferred from the source and references. The output aspect ratio can be set independently of the source framing. Preprocessing adds a cost that scales with the source video length, so check the [live Muapi page](https://muapi.ai/seedance-motion-control) for current pricing before a large batch.

Seedance 2.5 supports `adaptive`, `16:9`, `9:16`, `1:1`, `4:3`, `3:4`, `21:9`, and `9:21`. Seedance 2 supports `21:9`, `16:9`, `4:3`, `1:1`, `3:4`, and `9:16`. Both default to `16:9`, a five-second output, and audio generation off. Seedance 2 defaults to `quality: high`; Seedance 2.5 defaults to standard bitrate. The 2.5 seed accepts `-1` for random or an integer through `4294967295` for reproducible generation.

## Quick start

Create a [Muapi API key](https://muapi.ai/access-keys), then set it in your environment:

```sh
export MUAPI_API_KEY="your_api_key"
```

Submit a task (replace the example URLs with publicly reachable assets):

```sh
curl -X POST https://api.muapi.ai/api/v1/seedance-2.5-motion-control \
  -H "x-api-key: $MUAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"video_url":"https://example.com/reference-performance.mp4","images_list":["https://example.com/new-performer.jpg"],"prompt":"Replace the dancer with the person in the reference image; preserve the room and choreography.","aspect_ratio":"16:9","duration":8,"high_bitrate":true,"seed":42}'
```

The submit response contains a `request_id`. Poll it until the task finishes:

```sh
curl https://api.muapi.ai/api/v1/predictions/REQUEST_ID/result \
  -H "x-api-key: $MUAPI_API_KEY"
```

When `status` is `completed`, the result includes the generated video URL. See [cURL examples](examples/curl/), [Python](examples/python/), and [JavaScript](examples/javascript/).

## Request and response

Submit JSON to `POST https://api.muapi.ai/api/v1/{endpoint}` with `x-api-key` and `Content-Type: application/json` headers.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `video_url` | string | Yes | Publicly reachable source performance video. |
| `images_list` | string[] | No | Character reference image URLs; maximum 9 for Seedance 2 and 30 for 2.5. |
| `prompt` | string | No | Short recast instruction. Roles are inferred if omitted. |
| `aspect_ratio` | string | No | Output framing; supported values differ slightly by version (see above). |
| `duration` | integer | No | Seconds: 4–15 for Seedance 2; 4–30 for 2.5. Default: 5. |
| `quality` | string | Seedance 2 only | `high` (default) or `basic`. |
| `high_bitrate` | boolean | Seedance 2.5 only | Defaults to `false`; larger output files when enabled. |
| `seed` | integer | Seedance 2.5 optional | `-1` for random, or `0`–`4294967295` for reproducibility. |
| `generate_audio` | boolean | No | Defaults to `false`. |

Example submit response: `{"request_id":"REQUEST_ID"}`. Poll `GET https://api.muapi.ai/api/v1/predictions/{request_id}/result`; the completed output contains a `video` URL. A task can also report `failed`; handle that state in your integration rather than polling forever.

## Choosing a version

Choose Seedance 2 when a 15-second maximum and up to 9 character references are enough, or when its `quality` speed/quality selector is useful. Choose Seedance 2.5 for clips up to 30 seconds, up to 30 references, reproducible seeds, and high-bitrate output. This is a capability comparison based on Muapi's exposed request fields; it is not a quality benchmark.

## Examples

- [cURL: submit either version and poll](examples/curl/)
- [Python: requests-based submit and poll helper](examples/python/)
- [JavaScript: built-in fetch submit and poll helper](examples/javascript/)

## References

- [Seedance Motion Control overview and version comparison](https://muapi.ai/seedance-motion-control)
- [Seedance 2 Motion Control playground/API](https://muapi.ai/playground/seedance-2-motion-control)
- [Seedance 2.5 Motion Control playground/API](https://muapi.ai/playground/seedance-2.5-motion-control)
- [Muapi API keys](https://muapi.ai/access-keys)

*Prices are Muapi's listed starting rates at the time this README was written. Preprocessing is additional and varies with reference-video length; current rates are on the linked Muapi pages.

## Disclaimer

Seedance is a ByteDance model family. This community example repository is an independent integration guide and is not affiliated with or endorsed by ByteDance. API access and billing are provided by Muapi.
