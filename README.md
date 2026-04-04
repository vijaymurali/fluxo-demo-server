# fluxo-demo-server

Xtream Codes-compatible demo server for [Fluxo](https://github.com/vijaymurali/fluxo) App Store review.

## What this is

A minimal Deno Deploy server that speaks the Xtream Codes API protocol,
serving copyright-free MP4 demo content for Apple App Review.

## Demo credentials

| Field | Value |
|---|---|
| Server URL | `https://fluxo-demo-server.deno.dev` |
| Username | `fluxodemo` |
| Password | `review2026` |

## Content

Three copyright-free clips from [Coverr](https://coverr.co) (free license, no attribution required):

- `content/channel1.mp4` — Popcorn (3.5 MB)
- `content/channel2.mp4` — Ocean / Boat (5.7 MB)
- `content/channel3.mp4` — Mountains in fog (12 MB)

## Deploy

Connect this repo to [Deno Deploy](https://deno.com/deploy) with entry point `main.ts`.
