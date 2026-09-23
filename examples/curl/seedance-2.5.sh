#!/usr/bin/env sh
set -eu

: "${MUAPI_API_KEY:?Set MUAPI_API_KEY first}"

# Submit: replace video_url and images_list with publicly reachable assets.
curl -X POST https://api.muapi.ai/api/v1/seedance-2.5-motion-control \
  -H "x-api-key: $MUAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"video_url":"https://example.com/reference-performance.mp4","images_list":["https://example.com/new-performer.jpg"],"prompt":"Replace the dancer with the person in the reference image; keep the same room and choreography.","aspect_ratio":"16:9","duration":8,"high_bitrate":true,"seed":42,"generate_audio":false}'

# Poll with:
# curl "https://api.muapi.ai/api/v1/predictions/REQUEST_ID/result" -H "x-api-key: $MUAPI_API_KEY"
