# TEST_PLAN.md

Generated: 2026-04-28  
Source: `explore-output/home-dom.json`, `explore-output/careers-dom.json`, current Playwright implementation

---

## 1. Scope

End-to-end automation of the Insider One careers flow:  
from the public home page through the Lever-hosted QA job board to the job application form.

**In scope**
- Home page load verification
- Careers page load and navigation
- Team selection via Lever-hosted job board link
- Quality Assurance job listing validation
- Apply redirect to Lever application form

**Out of scope**
- Submitting an application
- Login or authenticated flows
- Non-chromium browsers (chromium only)
- Non-QA teams or non-Istanbul locations

---

## 2. Architecture of the Real Flow

```
insiderone.com/              →  insiderone.com/careers/#open-roles
                                      │
                              click "See all teams" (optional — reveals all team cards)
                                      │
                              click a[href*="team=Quality%20Assurance"]
                                      │
                              jobs.lever.co/insiderone?team=Quality%20Assurance
                              (Lever-hosted job board, rendered as .posting cards)
                                      │
                              click Apply on first card → read href → navigate
                                      │
                              jobs.lever.co/insiderone/{job-id}/apply
                              (Lever application form)
```

**Key facts confirmed by DOM exploration:**
- `"Quality Assurance"` is an `h3` on the Insider careers page — the team card is a link with `href` containing `team=Quality%20Assurance`
- Job listings are rendered on **Lever's domain**, not on Insider's page
- Apply navigates in the **same tab** (href extracted and navigated directly)
- `"Istanbul"` is confirmed in careers page location headings (`h3`)
- Lever cookie banner may appear and must be dismissed

---

## 3. Scenarios

| # | Scenario | Entry point | Exit condition |
|---|----------|-------------|----------------|
| S-01 | Home page loads correctly | `https://insiderone.com/` | Title, h1, nav all visible |
| S-02 | Careers open roles page loads | `https://insiderone.com/careers/#open-roles` | Title, h1, section heading visible |
| S-03 | All team cards are revealed | Careers page | QA team card link is visible |
| S-04 | QA team navigates to Lever job board | QA team card click | Lever page loaded with QA filter active |
| S-05 | QA job listings are present | Lever job board | At least one `.posting` card visible |
| S-06 | All jobs match QA criteria | Lever job board | Each card title matches QA pattern |
| S-07 | At least one Istanbul job exists | Lever job board | At least one card contains "Istanbul" |
| S-08 | Apply navigates to Lever application form | First `.posting` Apply link | URL matches `jobs.lever.co/insiderone/{id}` |

---

## 4. Test Cases

### TC-01 — Home page loads

| Field | Value |
|-------|-------|
| **URL** | `https://insiderone.com/` |
| **Pre-condition** | None |
| **Steps** | 1. Navigate to home URL<br>2. Accept cookie banner if shown |
| **Expected** | Page title contains `"Insider"` |
| | `h1` contains `"Customer Engagement"` |
| | `<nav>` element is visible |

---

### TC-02 — Careers open roles page loads

| Field | Value |
|-------|-------|
| **URL** | `https://insiderone.com/careers/#open-roles` |
| **Pre-condition** | TC-01 passed |
| **Steps** | 1. Navigate to careers URL<br>2. Accept cookie banner if shown |
| **Expected** | Page title contains `"Careers"` |
| | `h1` contains `"Ready to disrupt"` |
| | Heading `"Explore open roles"` is visible |

---

### TC-03 — All teams are revealed

| Field | Value |
|-------|-------|
| **Pre-condition** | TC-02 passed |
| **Steps** | 1. Scroll to "Explore open roles" section<br>2. Click "See all teams" if present (may already be expanded) |
| **Expected** | Link `a[href*="team=Quality%20Assurance"]` is visible in the DOM |

> **Note:** "See all teams" may not always be present or required if all team cards are already rendered. The selector target is the `<a>` link with `href` containing `team=Quality%20Assurance`, not the h3 heading text alone.

---

### TC-04 — QA team navigates to Lever job board

| Field | Value |
|-------|-------|
| **Pre-condition** | TC-03 passed |
| **Steps** | 1. Click `a[href*="team=Quality%20Assurance"]`<br>2. Wait for `domcontentloaded`<br>3. Dismiss Lever cookie banner if shown |
| **Expected** | Page is on `jobs.lever.co` domain |
| | "Quality Assurance" filter/button is active and visible |
| | Page contains `.posting` elements |

---

### TC-05 — QA job listings are present

| Field | Value |
|-------|-------|
| **Pre-condition** | TC-04 passed |
| **Steps** | 1. Wait for `.posting` to be visible (timeout: 15 s) |
| **Expected** | `.posting` count is greater than 0 |

---

### TC-06 — Each job title matches QA pattern

| Field | Value |
|-------|-------|
| **Pre-condition** | TC-05 passed |
| **Steps** | 1. For each `.posting` card: read `h5` text |
| **Expected** | Every `h5` title matches `/QA\|Quality Assurance/i` |

> Note: Job cards do not explicitly contain "Department" field.
> Validation is based on:
> - active QA filter
> - job title pattern (QA / Quality Assurance)


> Accepted title examples: `"Senior QA Engineer"`, `"Quality Assurance Automation Engineer"`, `"QA Lead"`

---

### TC-07 — At least one Istanbul job exists

| Field | Value |
|-------|-------|
| **Pre-condition** | TC-05 passed |
| **Steps** | 1. Count `.posting` cards whose text contains `"Istanbul"` |
| **Expected** | Count is greater than 0 |
| | Accepted location text: `"Istanbul, Turkey"`, `"Istanbul, Turkiye"`, `"Istanbul"` |

---

### TC-08 — Apply navigates to Lever application form

| Field | Value |
|-------|-------|
| **Pre-condition** | TC-05 passed |
| **Steps** | 1. On the first `.posting` card, find the `Apply` link<br>2. Read its `href`<br>3. Navigate to that `href` |
| **Expected** | URL matches `/jobs\.lever\.co\/insiderone\/.+/i` |
| | Page body contains `"Apply"`, `"Submit application"`, or a recognisable job title |

---

## 5. Implementation Reference

| Concern | Implementation |
|---------|---------------|
| Cookie dismissal | `HomePage.acceptCookiesIfVisible()`, `CareersPage.dismissLeverCookiesIfVisible()` |
| QA team link | `a[href*="team=Quality%20Assurance"]` |
| Job cards (Lever) | `.posting` |
| Job title | `h5` inside `.posting` |
| Location filter | `.posting` with text containing `/Istanbul/i` |
| Apply link | `getByRole('link', { name: /^Apply$/i })` on first `.posting` |
| Apply navigation | Same-tab: `page.goto(href)` |
| Test file | `tests/insider-careers.spec.ts` |
| Page objects | `pages/HomePage.ts`, `pages/CareersPage.ts` |
