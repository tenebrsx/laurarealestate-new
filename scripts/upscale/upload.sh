#!/usr/bin/env bash
# Upload upscaled listing photos to Firebase Storage (bucket of project laura-realestate).
# Requires: gcloud auth login (account with access to the project). Long cache: files are immutable per image id.
set -euo pipefail
BUCKET="${BUCKET:-laura-realestate.firebasestorage.app}"
DIR="${WORK:-$(dirname "$0")/work}/out/listings"
gcloud storage rsync -r "$DIR" "gs://$BUCKET/listings" \
  --cache-control="public, max-age=31536000, immutable" --content-type=image/webp
echo "Uploaded. Set NEXT_PUBLIC_UPSCALED_IMAGE_BASE=https://firebasestorage.googleapis.com/v0/b/$BUCKET/o and rebuild."
