# CLAUDE.md — EDV Service Manager

## Project Overview

Internal EDV service management system for creating:

- Auftragsformular (work order form)
- Servicebericht (service report)

The application is designed to automate work tracking, reporting, PDF generation, and service documentation for a computer repair and IT service company.

Deployment:
https://lutsdm.github.io/rechner/

---

# Agent Behavior

When asked to change code:

- First analyze
- Then create a plan
- Then wait for approval if the change affects more than one file
- Never rewrite large parts of the project automatically
- All generated code, comments, TODOs, commit messages, and documentation must be written in English

## Refactoring Rules

Before refactoring:

1. Explain the planned changes
2. Explain why they are needed
3. Do not modify unrelated code
4. Keep public component APIs unchanged whenever possible

# Frontend Architecture

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React Hooks based architecture
- PDF generation handled inside `report/`
- Mobile-first UI design

## Frontend Rules

- Business logic must live inside `hooks/`
- UI components should remain presentation-only
- Prefer reusable blocks and modular structure
- Tailwind CSS preferred over custom CSS
- Avoid unnecessary re-renders
- Use dynamic imports for heavy PDF modules

## Tailwind Rules

- Prefer Tailwind classes
- Avoid inline styles
- Reuse existing Tailwind patterns from neighboring components
- Keep responsive behavior consistent with existing blocks

---

## Spring Boot Standards

- Java 21
- Constructor injection only
- No field injection
- DTO mapping via MapStruct
- Service layer contains business logic
- Controllers only orchestrate requests
- Repository layer only handles persistence

# Backend Architecture

- Spring Boot REST API
- PostgreSQL as primary database
- Flyway migrations required
- Layered architecture:

```text
Controller -> Service -> Repository
```

- DTO pattern mandatory
- No direct entity exposure
- JWT authentication planned
- JSON-based report persistence planned

---

# Current Development Goals

Current project priorities:

1. Introduce PostgreSQL persistence
2. Replace localStorage drafts with backend storage
3. Implement Customer CRUD
4. Implement Auftragsformular CRUD
5. Implement Servicebericht CRUD
6. Generate PDFs from database entities
7. Add authentication system
8. Build admin/report history system

---

# AI Restrictions

- Do not rewrite existing architecture
- Do not introduce new libraries without reason
- Do not move files automatically
- Preserve current naming conventions
- Preserve German business terminology
- Prefer extending existing hooks over creating duplicates
- Avoid unnecessary abstractions
- Minimize file changes
- Preserve PDF generation behavior unless explicitly requested

---

# Commands

```bash
npm run dev       # local development server
npm run build     # production build
npm run lint      # ESLint validation
```

---

# Project Structure

```text
app/
  components/
    time/
      blocks/           # Large UI sections (one block = one form section)
        ActionsBlock        # Action buttons
        ArbeitszeitBlock    # Working time (Von / Bis)
        CustomerModal       # Customer information
        EmployeesBlock      # Employee selection
        HeaderBlock         # Header section
        LineItemsModal      # Additional order positions
        OrderDetailsBlock   # Order details
        OrderDetailsModal   # Order details modal
        PasswordModal       # Password protection
        ReportSummaryBlock  # Final report summary
        TravelTimeBlock     # Travel time (Abfahrt / Ankunft)

      hooks/            # All business logic lives here
        useEmployeesSelection
        useOrderFormPdfDownload
        usePdfDownload
        usePriceCalculation
        useTimeCalculation
        useTimeRange

      lib/              # Utility helpers

      report/           # PDF generation and reports
        DocumentPreview
        orderFormAgbContent
        OrderFormPdf
        OrderFormReport
        ServiceReport
        ServiceReportPdf

      Signature/        # Signature system
        SignatureModal
        SignaturePad

      ui/               # Small reusable UI components
        ReportRow
        TimeBlock
        TimeRow

      TimeCalculator.tsx  # Root component

  types/                # Centralized TypeScript types

  globals.css
  layout.tsx
  page.tsx
```

---

# Architecture Rules

- All business logic must remain inside `hooks/`
- Components should only handle rendering and hook usage
- `blocks/` represent isolated form sections
- `ui/` contains reusable presentational components only
- `report/` should not be modified without explicit PDF/report tasks
- All TypeScript interfaces and types must remain centralized in `types/`

---

# Core Business Logic (Do Not Break)

## Price Calculation (`usePriceCalculation`)

- Single hourly rate for both work time and travel time
- Minute-precise calculation without intermediate rounding
- Formula:

```text
(work minutes + travel minutes) × (hourly rate / 60)
```

- Only the final result may be rounded to 2 decimal places

---

## Time Validation (`useTimeCalculation`, `useTimeRange`)

Validation rules:

- Work start < Work end
- Departure ≤ Arrival
- Work start must not be earlier than Arrival
- Departure must not be later than Work end
- Travel time is optional and validated only if fields are filled

---

## UI Rules

- Seconds must never be displayed
- Single date per working day
- Mobile-first layout
- Preserve existing German UI terminology

---

# Code Requirements

- Strict TypeScript only
- No `any`
- All shared types belong in `types/`
- Avoid side effects between blocks
- Keep changes minimal and isolated
- Preserve existing architecture whenever possible
- Prefer extending existing functionality over rewriting

---

# Common Mistakes

- Never round intermediate minute calculations
- Travel validation must only run if travel fields exist
- Do not place business logic inside components
- After changing TypeScript types, verify all usages
- Avoid duplicating hooks with overlapping responsibilities
```