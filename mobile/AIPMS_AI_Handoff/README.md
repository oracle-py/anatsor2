# AIPMS Application — AI Agent Handoff

This package is the implementation brief for the **AIPMS** mobile and web application.

**Full product name:** Anatsor Integrated Poultry Management System  
**Application name:** AIPMS  
**Example physical device ID:** `AIPMS1234`

## Start here

Give this entire folder or ZIP archive to the coding agent and use this instruction:

> Build the production AIPMS application described in `specs/BUILD_SPEC.md`. Reproduce the supplied functional mockup in `mockup/aipms-functional-mockup.html` as closely as practical, including its visual language, screens, states and interactions. Treat the build specification as authoritative where the mockup and specification differ. Implement cloud mode with Supabase and local-network camera mode as separate data adapters inside one application. The app is monitoring-only: the Arduino UNO Q controls the fan, humidifier and alarm automatically and is not configured to accept remote equipment commands. Do not invent remote-control functionality. Work incrementally, run the acceptance checks, and document any backend values or device endpoints that still require configuration.

## Package contents

- `mockup/aipms-functional-mockup.html` — the interactive visual reference.
- `specs/BUILD_SPEC.md` — authoritative product, UX, architecture and acceptance requirements.
- `specs/DATA_CONTRACTS.md` — expected database records, sensor payloads and local-network interfaces.
- `specs/SECURITY.md` — security requirements and prohibited implementation shortcuts.

## Important interpretation rule

The HTML mockup uses simulated browser data. It is a reference for appearance and flow, not the production architecture. Production authentication, device ownership, readings and daily records must use Supabase. The local camera must connect directly to the UNO Q only while the phone or browser is on the farm network.

