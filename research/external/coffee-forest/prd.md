---
source: local
original_path: ~/Documents/Coffee&Forest/prd.md
relevance: "HØY (EUDR compliance, supply chain traceability)"
copied: 2026-03-19
---

# Coffee & Forest (EUDR Compliance Platform) PRD

## HR Eng

| Coffee & Forest Platform PRD |  | A comprehensive compliance and verification platform for Fuglen Coffee to meet strict EU Deforestation Regulation (EUDR) requirements for coffee imports into Norway/EEA. |
| :---- | :---- | :---- |
| **Author**: Pickle Rick **Contributors**: Gabriel Boen **Intended audience**: Engineering, Compliance, Logistics | **Status**: Draft **Created**: 2026-02-01 | **Self Link**: N/A **Context**: [EUDR Regulation Text] [**Visibility**](http://go/data-security-policy#data-classification): Confidential |

## Introduction

The **Coffee & Forest** platform is a "Compliance Bridge" designed to ingest fragmented farmer data, actively verify it against satellite deforestation layers, and generate compliant Due Diligence Statements (DDS) for the EU Information System. It serves as the single source of truth for Fuglen Coffee's supply chain integrity.

## Problem Statement

**Current Process:** Fuglen has close relationships with farmers but lacks a unified digital system. Data (coordinates, farm details) exists in fragmented formats (Excel, WhatsApp, paper).
**Primary Users:**
1.  **Compliance Officer (Fuglen):** Needs to verify shipments and generate legal reports.
2.  **Supplier/Intermediary:** Needs a simple way to upload farm data.
3.  **End Consumer:** (Future) Desires transparency on the coffee's origin.
**Pain Points:**
*   **Regulatory Risk:** Non-compliance with EUDR (Dec 31, 2020 cut-off) means products cannot enter the EEA.
*   **Data Fragmentation:** "Messy" coordinates (Points vs. Polygons) from diverse sources.
*   **Verification Complexity:** Manual checking of forest loss is impossible at scale.
**Importance:** Critical for business continuity. Without this system, Fuglen cannot legally import coffee into Norway post-implementation deadline.

## Objective & Scope

**Objective:** To automate the ingestion, verification, and reporting of coffee supply chain data to ensure 100% EUDR compliance.
**Ideal Outcome:** A dashboard where Fuglen can see every shipment, its status (Verified/High Risk), and click one button to generate the official API payload for the EU.

### In-scope or Goals
*   **Data Ingestion:** Flexible upload (Excel/CSV) and manual entry for farm geolocation (Points <4ha, Polygons >=4ha).
*   **Active Verification:** Integration with satellite data APIs (e.g., Global Forest Watch) to check coordinates against forest loss since Dec 2020.
*   **EU API Formatting:** Generating valid XML/JSON payloads for the EU Information System.
*   **Risk Dashboard:** Visualizing supply chain health and specific "Red Flag" farms.

### Not-in-scope or Non-Goals
*   **Hardware/IoT:** We are not building sensors.
*   **Financial Transactions:** This is for compliance, not payments to farmers.

## Product Requirements

### Critical User Journeys (CUJs)

1.  **CUJ: The Data Ingest (Cleaning the Mess)**
    *   **Actor:** Compliance Officer / Supplier.
    *   **Step 1:** User uploads a raw supplier list (CSV with Lat/Long or Shapefiles).
    *   **Step 2:** System validates formats. Checks: Is it a Point? Is it a Polygon? Is precision sufficient (6 decimals)?
    *   **Step 3:** System visualizes the plot on a map. User confirms "This looks like the farm."
    *   **Step 4:** Data is normalized and stored in the "Farm Registry."

2.  **CUJ: The Active Verification (The "Forest" Check)**
    *   **Actor:** System (Automated).
    *   **Step 1:** For every new plot in the registry, System queries Satellite Layer (Forest Loss > Dec 31, 2020).
    *   **Step 2:**
        *   **Pass:** Plot marked "Green/Verified."
        *   **Fail:** Plot marked "Red/Deforestation Detected." System flags specific intersection points.
    *   **Step 3:** Officer reviews "Red" flags. Can override with evidence or reject the supplier.

3.  **CUJ: The Compliance Submission (The "Law")**
    *   **Actor:** Compliance Officer.
    *   **Step 1:** User selects a Shipment (Batch of coffee). Links it to specific Verified Farms.
    *   **Step 2:** System calculates total volume vs. farm capacity (Yield plausibility check).
    *   **Step 3:** User clicks "Generate DDS."
    *   **Step 4:** System outputs the signed XML/JSON payload ready for the EU portal.

### Functional Requirements

| Priority | Requirement | User Story |
| :---- | :---- | :---- |
| P0 | **Multi-Format Geolocation Support** | As a user, I must be able to input both single points (<4ha) and complex polygons (>=4ha) because my suppliers vary in size. |
| P0 | **Satellite Deforestation Check** | As a compliance officer, I need to know *automatically* if a plot has deforestation history so I don't import illegal coffee. |
| P0 | **EUDR Data Structure** | As a developer, I must store data in the exact structure (Operator ID, HS Code, Geolocation) required by the EU API specifications. |
| P1 | **Supplier Portal** | As a supplier, I want a simple link to upload my farm data so I don't have to email spreadsheets. |
| P2 | **Yield Plausibility Engine** | As a risk manager, I want to flag if a small farm is claiming impossible volumes of coffee (laundering risk). |

## Assumptions

*   **Assumption 1:** Satellite data APIs (e.g., Global Forest Watch, Sentinel Hub) provide sufficient resolution for smallholder plots.
*   **Assumption 2:** Fuglen can obtain *some* form of digital coordinates from all suppliers.

## Risks & Mitigations

*   **Risk:** Satellite data is cloudy/inaccurate for a specific region.
    *   **Mitigation:** Allow manual upload of "Ground Truth" evidence (photos/audit reports) to override satellite flags.
*   **Risk:** EU API spec changes before rollout.
    *   **Mitigation:** Build the "Export" layer as a modular adapter, separate from the core data model.

## Tradeoff

*   **Custom Build vs. Buying SaaS (TraceX/Meridia):**
    *   **Decision:** Custom Build.
    *   **Why:** Existing SaaS is opaque and expensive for "active" verification. Fuglen needs a "Bridge" that fits their specific, fragmented workflow and allows them to own the data/relationships (Pioneer status).

## Business Benefits/Impact/Metrics

**Success Metrics:**

| Metric | Current State (Benchmark) | Future State (Target) | Savings/Impacts |
| :---- | :---- | :---- | :---- |
| *Compliance Readiness* | 0% (Manual/Spreadsheets) | 100% (Automated) | Avoid market exclusion (Revenue protection). |
| *Verification Time* | Hours per supplier | Seconds (Automated) | Massive labor reduction. |
| *Supplier Onboarding* | High friction | Self-service Portal | Scalable growth. |

## Stakeholders / Owners

| Name | Team/Org | Role | Note |
| :---- | :---- | :---- | :---- |
| Fuglen Management | Fuglen | Business Owner | Ultimate liability holder. |
| Gabriel Boen | Engineering | Tech Lead | Architect & Builder. |
