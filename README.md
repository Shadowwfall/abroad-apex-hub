# Apex Compass

Generate a website for a visa consultancy in Hyderabad that gives service to the students who wish to pursue study abroad and the name of the consultancy is APEX Abroad Consultancy. You are going to build the admin portal of the same website, which is a working place for the workers of the consultancy

# UI/UX Design Prompt – Epix Abroad Consultancy Admin Portal (CRM)

## Project Overview

Design a premium, modern, enterprise-grade Admin CRM dashboard for **Epix Abroad Consultancy**. This is an internal staff management platform, **not a public marketing website**. The design should inspire trust, professionalism, productivity, and efficiency while remaining visually attractive and easy to use throughout long working hours.

The overall visual identity should use a **warm and welcoming theme** instead of a cold corporate look. Blend professionalism with subtle warmth to make the dashboard feel inviting.

---

# Design Vision

The CRM should feel like a combination of:

* Notion's clean organization

* Linear's minimal aesthetics

* Stripe Dashboard's professionalism

* HubSpot CRM's usability

* Monday.com's visual clarity

Avoid outdated admin panel designs.

The interface should feel modern, premium, spacious, elegant, and highly polished.

---

# Color Theme

Use a warm professional palette.

Primary Colors:

* Warm Orange

* Soft Amber

* Elegant Gold accents

Supporting Colors:

* White

* Off-white backgrounds

* Light Cream

* Very light Grey surfaces

Text:

* Dark Charcoal

* Medium Grey

* Soft muted labels

Status Colors:

* Green → Success

* Blue → Information

* Orange → Pending

* Yellow → Warning

* Red → Errors

Use subtle gradients only where they enhance visual appeal.

Avoid excessive saturation.

---

# Design Principles

* Large spacing

* Rounded corners (12–18px)

* Premium cards

* Soft shadows

* Smooth animations

* Glassmorphism only where appropriate

* Excellent typography hierarchy

* Responsive layout

* Pixel-perfect alignment

* High accessibility

* Minimal clutter

Everything should feel polished and intentional.

---

# Dashboard Layout

Top Navigation

Include:

* Company Logo

* Current Branch Selector

* Global Search

* Notifications

* Quick Add button

* User Profile

* Settings

* Theme Toggle

Left Sidebar

Modern collapsible sidebar with icons.

Sections:

* Dashboard

* Students

* Leads

* Applications

* Documents

* Admission Checklist

* Visa Checklist

* Payments

* Staff

* Branches

* Reports

* Activity Logs

* Settings

Active menu should use warm accent highlighting.

---

# Dashboard Home

The landing dashboard should immediately communicate business health.

Include attractive KPI cards:

* Total Students

* Active Applications

* Pending Documents

* Upcoming Deadlines

* Total Revenue

* Outstanding Payments

* Visa Success Rate

* Admission Success Rate

Below KPIs:

Interactive charts

* Monthly Admissions

* Country Distribution

* Branch Performance

* Revenue Trends

Recent Activity Timeline

Upcoming Deadlines

Latest Leads

Today's Tasks

Recent Payments

Quick Actions

Everything should be interactive.

---

# Super Admin Experience

The Super Admin dashboard must clearly communicate global control across every branch.

Features:

## Global Branch Management

* Create Branch

* Rename Branch

* Edit Branch

* Archive Branch (Soft Delete)

Beautiful branch cards showing:

* Branch Name

* Student Count

* Revenue

* Staff Count

* Active Applications

---

## Staff Management

Modern employee management interface.

Features:

* Create Staff

* Edit Staff

* Assign Roles

* Reset Password

* Activate/Deactivate

Support:

* Super Admin

* Branch Admin

* Counsellor

* Documentation Officer

* Finance

* Visa Team

Role badges should be color coded.

---

## Multi-Branch Staff Assignment

Beautiful interface for assigning users to multiple branches.

Use:

* Searchable multi-select

* Tag chips

* Branch avatars

---

## Global Student Management

Powerful searchable student table.

Columns:

* Student Photo

* Name

* Student ID

* Assigned Branch

* Country

* Intake

* Status

* Counsellor

* Outstanding Balance

Support:

* Advanced Filters

* Sorting

* Bulk Actions

* Export

* Import

---

## Student Reassignment

Drag-and-drop branch reassignment interface.

When moving a student:

* Preserve entire activity history

* Show transfer confirmation modal

* Show audit log preview

---

## Checklist Template Builder

Allow Super Admin to configure reusable templates.

Hierarchy:

Country

↓

Education Level

↓

Vertical

↓

Checklist Items

Support:

* Drag-and-drop ordering

* Add sections

* Required documents

* Optional documents

* Custom validation

---

## Fee Configuration

Allow creation of reusable fee templates.

Examples:

Admission Fee

Visa Fee

University Deposit

Embassy Fee

Medical

Insurance

Service Charges

Currency configurable.

---

## Global Audit Center

Beautiful timeline showing:

* Who changed what

* Date

* Time

* Branch

* Before/After values

Include:

Filters

Search

Export

---

# Branch Admin Experience

Branch Admin only sees assigned branches.

No access outside their branch.

Everything should clearly indicate branch context.

---

## Lead Management

Incoming website leads should appear inside a Lead Pool.

Each lead card includes:

* Student Name

* Interested Country

* Program

* Source

* Date

* Priority

Actions:

Assign

Convert to Student

Reject

Add Note

---

## Student Creation

Beautiful multi-step wizard.

Sections:

Personal

Academic

Passport

Guardian

Target Country

University Preference

Financial Details

Documents

Review

---

## Student Profile

One-page CRM profile.

Tabs:

Overview

Admission

Visa

Documents

Payments

Notes

Timeline

Activity

Everything should update live.

---

## Document Tracking

Separate modules:

Admission Checklist

Visa Checklist

Each document should support:

Pending

Received

Rejected

Waived

Deadline

Assigned Staff

Notes

Preview

Upload

Version History

---

## Deadline Tracker

Timeline and calendar views.

Highlight:

Today

This Week

Overdue

Upcoming

---

## Payment Management

Professional finance module.

Support:

Multiple Currencies

Installments

Outstanding Balance

Refunds

Discounts

Payment History

Invoice Generation

Receipt Download

Payment Timeline

---

## Refund Management

Record:

Refund Amount

Reason

Date

Approved By

Transaction Reference

---

## Notes

Allow notes on:

Students

Payments

Documents

Applications

Support:

Mentions

Attachments

Timestamps

---

## Branch Activity Timeline

Beautiful chronological timeline.

Show:

Student Created

Payment Added

Document Uploaded

Checklist Updated

Refund Processed

Lead Converted

Staff Action

Each activity should include:

User Avatar

Timestamp

Branch

Description

---

# UX Requirements

Every table should support:

* Search

* Filters

* Sorting

* Export

* Pagination

* Bulk Actions

Every page should include:

* Breadcrumbs

* Page Title

* Quick Actions

* Empty States

* Loading Skeletons

* Error States

---

# Animations

Use tasteful animations throughout:

* Smooth page transitions

* Hover effects

* Card elevation

* Button ripple

* Loading shimmer

* Animated charts

* Progress indicators

Keep animations fast and subtle.

---

# Responsive Design

Fully responsive for:

Desktop

Laptop

Tablet

Mobile

No horizontal scrolling.

---

# Overall Goal

Create a CRM that feels like a premium SaaS product rather than a traditional admin panel. Every interaction should communicate quality, speed, and clarity. The interface should make complex workflows—branch management, student lifecycle, document tracking, payments, and auditing—feel intuitive and efficient while maintaining a warm, welcoming visual identity that reflects Epix Abroad Consultancy's brand.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://abroad-apex-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e5b38926-b5a5-42bc-b7ca-babcd549c76e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
