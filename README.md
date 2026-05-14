# EDV Service Manager

Internal service management system for EDV-SERVICE Samirae.  
Designed to automate work tracking, customer reports, PDF generation, and service documentation for real-world IT support workflows.

The project started as a simple Arbeitszeit Rechner on the first day of a new job and gradually evolved into a full internal service management platform based on real daily business requirements.

---

# 🚀 Features

## Current Features

### Work Order & Service Reports
- Auftragsformular generation
- Servicebericht generation
- Separate PDF workflows
- Signature support for:
  - Customer
  - Employee
- PDF export and preview

### Time Tracking
- Work start (`Von`)
- Work end (`Bis`)
- Optional travel time:
  - Departure (`Abfahrt`)
  - Arrival (`Ankunft`)

### Validation Logic
- Work start < Work end
- Departure ≤ Arrival
- Work start not before arrival
- Departure not after work end
- Optional travel validation

### Billing Logic
- Unified hourly rate for:
  - Work time
  - Travel time
- Minute-precise calculation
- Final total rounded only once

### Customer & Order Data
- Customer information
- Order details
- Additional line items
- Employee selection

### UX
- Mobile-first layout
- Optimized for smartphone usage during field service
- Fast report creation workflow
- Dynamic PDF preview

---

# 🧠 Motivation

The goal of the project is to build a practical internal system that reflects real-world EDV service workflows instead of a simple time calculator.

The application is designed to:
- reduce manual paperwork
- standardize service reports
- improve billing transparency
- simplify customer documentation
- support mobile field work

The system is actively inspired by real daily service operations in computer repair and IT support environments.

---

# 🛠️ Tech Stack

## Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React Hooks
- React PDF Renderer

## Backend (planned / in progress)
- Spring Boot
- PostgreSQL
- Flyway
- JWT Authentication
- REST API

---

# 🏗️ Architecture

The frontend follows a modular architecture:

```text id="4ew8jo"
blocks/     -> large isolated form sections
hooks/      -> business logic
ui/         -> reusable presentational components
report/     -> PDF generation system
types/      -> centralized TypeScript types
```

Core principles:
- Business logic inside hooks only
- Presentation-only components
- Minimal side effects
- Reusable modular structure
- Strict TypeScript usage

---

# 📄 PDF System

The application supports two separate document flows:

## Auftragsformular
Created before work execution.

Contains:
- customer data
- order details
- pricing
- employees
- signatures

## Servicebericht
Created after work completion.

Contains:
- work times
- travel times
- billing summary
- signatures
- final report data

PDF generation uses lazy-loaded modules to optimize frontend bundle size.

---

# 🧮 Billing Principle

Billing is based on a unified hourly rate applied equally to:
- working time
- travel time

Calculation rules:
- minute-precise calculation
- no intermediate rounding
- hourly rate converted to minute rate (`hourlyRate / 60`)
- final amount rounded only once to 2 decimal places

Formula:

```text id="nhfd8n"
(work minutes + travel minutes) × (hourly rate / 60)
```

---

# 📈 Planned Features

## Backend & Persistence
- PostgreSQL persistence
- Full CRUD system
- Authentication & authorization
- Customer history
- Service report history

## Admin Features
- Search by customer name or phone
- Report archive
- Dashboard
- Employee management

## Future Integrations
- Invoice generation
- CSV/PDF export
- Cloud storage
- Multi-user support
- Audit logging

---

# ▶️ Demo

GitHub Pages:

https://lutsdm.github.io/rechner/

---

# 📝 Status

The project is actively evolving from a prototype into a real internal business application.

Originally started as a lightweight Arbeitszeit Rechner, it is now transitioning into a full EDV service management platform with database persistence, workflows, PDF reporting, and backend infrastructure.

---

# 🤝 Development

Built with:
- real business requirements
- hands-on development
- iterative architecture improvements
- AI-assisted engineering workflows
- practical field-service experience