# Gemini Assistant Plan

## Goal

Replace the current canned patient assistant with a real Gemini-powered conversational assistant that:

- answers educational questions about readings, medications, symptoms, and care navigation
- stays safe for a healthcare context by avoiding diagnosis, prescribing, and emergency triage
- uses live platform-aware context where possible instead of static mock replies

## Scope

### In scope

- add a server action that calls the Gemini API
- update the patient assistant UI to use the new action
- keep emergency and care-team escalation guidance visible
- add environment configuration for the Gemini API key
- add tests for request shaping, safety behavior, and error handling

### Out of scope

- clinical decision making
- autonomous emergency diagnosis
- replacing clinician review workflows

## Implementation steps

1. Create a Gemini helper in `src/lib/` to centralize prompt building and API calls.
2. Add a server action in `src/actions/` that validates input, calls Gemini, and returns a safe reply.
3. Replace the canned client-side assistant logic with the server action.
4. Add `GEMINI_API_KEY` to `.env.example`.
5. Add tests that mock Gemini responses and verify fallback/error behavior.
6. Run the project build and test suite to confirm the assistant still compiles and behaves correctly.

## Safety rules

- Do not claim to diagnose conditions.
- Do not prescribe medications or dosage changes.
- Escalate urgent symptoms to the care team or emergency flow.
- Keep responses concise, clear, and clinically cautious.

## Success criteria

- The assistant can answer a message with a live Gemini response.
- Missing API keys fail gracefully.
- Tests pass.
- Production build passes.
