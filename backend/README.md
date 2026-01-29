# Backend

Node.js + TypeScript backend for the AI-powered supplementary learning platform.

## Purpose

Single orchestration layer responsible for:
- Authentication & authorization
- CMS APIs (upload, tag, browse)
- Chat orchestration & intent routing
- AI request construction and response handling
- Session & conversation persistence

## Setup

See root README.md for setup instructions.

## Architecture

This backend is the single control plane. Frontend communicates with this service, which then orchestrates calls to the AI backend.
