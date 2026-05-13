# Playwright E2E Automation Framework

End-to-end UI automation framework built with **Playwright + TypeScript**, demonstrating a real-world cross-domain user flow with production-style CI/CD, quality gates, and monitoring integration.

[![Tests](https://img.shields.io/badge/tests-passing-success)]() [![Playwright](https://img.shields.io/badge/Playwright-1.x-2EAD33)]() [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)]() [![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF)]()

---

## Overview

This framework automates a real cross-domain career application flow — from a marketing site to an external ATS (Lever) — while validating business logic at each step.

The project demonstrates how to handle the kind of problems that commonly cause flaky tests in production automation suites: cross-domain redirects, dynamic UI rendering, multi-domain cookie handling, and ambiguous requirements that don't match actual UI behavior.

---

## Key Engineering Decisions

### 1. Requirements vs. Reality

The original requirement stated:
> *"Click the Apply button and verify redirection to the Lever application form."*

Actual UI behavior differed significantly:

- The Careers page does not contain job listings directly
- Team selection redirects to an external Lever job board
- Each job has its own Apply button
- Apply navigates to a job-specific application form

**Decision:** Instead of automating the assumed flow, the framework was designed around the actual user journey. This is a common scenario in real QA work — requirements often describe intent, not behavior.

### 2. Smart Job Selection

Rather than selecting a random job from the listings, the framework filters for jobs matching both:
- QA-related role criteria (title-based validation)
- Istanbul location

This produces deterministic results that survive UI reshuffling and reflect a realistic user path.

### 3. Deterministic Locators, No Hard Waits

All locators are role-based or text-anchored where possible. Synchronization relies on Playwright's auto-waiting and explicit `waitFor` conditions — never on fixed timeouts.

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                       Test Suite                           │
│                  (Playwright + TS)                         │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                  Page Object Layer                         │
│            HomePage  •  CareersPage                        │
└────────────┬───────────────────────────┬───────────────────┘
             │                           │
             ▼                           ▼
    ┌──────────────────┐         ┌──────────────────┐
    │   Insider UI     │ ──────▶ │     Lever UI     │
    │   (origin)       │         │  (external ATS)  │
    └──────────────────┘         └──────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│              Reporting + Quality Gate Layer                │
│   Playwright HTML  •  Traces  •  Execution Summary JSON    │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                    CI/CD (GitHub Actions)                  │
│   On push  •  On PR  •  Daily scheduled (09:00 TR)         │
│            ↓                                               │
│         Slack Webhook Notification                         │
└────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
.
├── tests/                  # Test specs
│   └── insider-careers.spec.ts
├── pages/                  # Page Object Model
│   ├── HomePage.ts
│   └── CareersPage.ts
├── explorer/               # DOM exploration utilities
│   └── exploreCareers.ts
├── utils/                  # Framework utilities
│   ├── qualityGate.ts      # CI quality gate
│   ├── executionSummary.ts # Structured run summary
│   └── smartDomExtractor.ts
├── reports/                # JSON execution outputs
├── docs/                   # Architecture + screenshots
├── .github/workflows/      # CI/CD pipeline
└── playwright.config.ts
```

---

## Features

### Test Design
- **Page Object Model** with single-responsibility page classes
- **Deterministic locators** — role-based, text-anchored, no XPath drift
- **Same-tab navigation handling** for cross-domain transitions
- **Multi-domain cookie management** for Insider → Lever flow
- **Graceful degradation** — handles empty job listings without false failures

### CI/CD Pipeline
- **GitHub Actions** workflow with multiple triggers:
  - Push to main
  - Pull request
  - Daily scheduled run (09:00 Turkey time)
  - Manual dispatch
- **Quality gate** — custom logic in `utils/qualityGate.ts` that fails the run if any test did not pass
- **Slack webhook integration** — real-time pass/fail notifications via GitHub Secrets
- **Environment configuration** — `BASE_URL` is configurable for multi-environment runs

### Reporting
- **Playwright HTML Report** with full trace, screenshots, and video on failure
- **Custom JSON execution summary** (`reports/execution-summary.json`) with:
  - Test status (pass/fail per case)
  - Execution timestamp
  - Evidence paths
  - Quality gate result
- **Trace Viewer** integration for step-by-step debugging

---

## Validations Covered

| ID | Validation |
|----|-----------|
| TC-01 | Homepage loads correctly |
| TC-02 | Careers page structure is valid |
| TC-03 | Cookie consent handled across domains |
| TC-04 | QA team is present and selectable |
| TC-05 | Lever job listings load after team selection |
| TC-06 | At least one Istanbul-based QA role exists |
| TC-07 | Apply redirects to `jobs.lever.co/insiderone/{job-id}` |
| TC-08 | Application form page is functional |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/KubraKcr/playwright-e2e-framework.git
cd playwright-e2e-framework
npm install
npx playwright install --with-deps
```

### Run Tests

```bash
# Run all tests
npx playwright test

# Run in headed mode for debugging
npx playwright test --project=chromium --headed

# View HTML report
npx playwright show-report

# Run the full CI pipeline locally (tests + summary + quality gate)
npm run ci
```

---

## CI/CD Configuration

The workflow runs on every push, pull request, and on a daily schedule.

```yaml
on:
  push:
    branches: [ main ]
  pull_request:
  schedule:
    - cron: '0 6 * * *'   # Daily 09:00 Turkey time
  workflow_dispatch:
```

### Slack Notifications

Real-time test result notifications are sent to a Slack channel after each run, including:
- Pass/fail status
- Repository and branch info
- Direct link to the GitHub Actions run

The webhook URL is stored as a GitHub Secret (`SLACK_WEBHOOK_URL`) — never committed to the repo.

---

## Challenges Solved

| Challenge | Solution |
|-----------|----------|
| Dynamic UI rendering of team cards | Wait on visible role + element presence rather than fixed timeout |
| Non-standard DOM (QA is not a button) | Text-anchored locator with role fallback |
| Cross-domain navigation (Insider → Lever) | Explicit page handle tracking + URL pattern assertion |
| Multi-domain cookie consent | Cookie acceptance verified per domain transition |
| Ambiguous Apply flow in requirements | Test redesigned around actual UI behavior, documented in TEST_PLAN.md |
| Empty job listings edge case | Graceful skip with explicit assertion message |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Test Framework | Playwright |
| Language | TypeScript |
| Test Pattern | Page Object Model |
| CI/CD | GitHub Actions |
| Notifications | Slack Webhooks |
| Reporting | Playwright HTML + custom JSON summary |

---

## Documentation

- [`TEST_PLAN.md`](TEST_PLAN.md) — Detailed test scenarios, assumptions, and design rationale
- [`AI_USAGE.md`](AI_USAGE.md) — Transparent disclosure of AI-assisted analysis steps

---

## License

MIT
