# AI Backend

FastAPI + Python backend for AI-powered features.

## Purpose

Sandboxed and stateless AI service responsible for:
- RAG-based retrieval over course materials
- Theory and lab code generation
- Prompt templates and controlled tools
- Mandatory validation (code syntax, grounding, rule-based checks)

## Setup

See root README.md for setup instructions.

## Architecture

This service is sandboxed and stateless. It receives requests from the backend service only and returns structured results with validation.
