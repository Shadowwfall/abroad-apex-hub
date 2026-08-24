# APEX Abroad Consultancy — Admin Portal
## Frontend ⇄ Backend Interaction Flow & Mapping (Technical Blueprint)

Generated from analysis of the actual codebase. **No backend exists today.**
Verified facts:

- No Lovable Cloud / Supabase integration (`src/integrations/` does not exist).
- No `createServerFn`, no `src/routes/api/*`, no fetch/axios call anywhere.
- Every screen renders **static mock arrays** from `src/data/crm.ts`, `src/data/checklists.ts`, `src/data/student-detail.ts`.
- All mutations are local React state or `toast()` messages only. Nothing persists across reload.
- There is **no login page and no auth** — the portal is fully open.

Therefore, in every table below, the "Status" column is `❌ / ⚠️` for essentially all write paths. Nothing is marked ✅ unless it is pure client-side behaviour that legitimately needs no backend.

Legend
- ✅ Backend/API already available
- ⚠️ Frontend exists but backend/API is missing
- ⚠️❓ Backend logic required but requirements unclear
- ❌ No backend implementation at all
- 🔄 Requires database integration
- 🔐 Requires authentication/authorization

---

## 1. Application Overview

| Item | Value |
|---|---|
| Product | Internal admin portal (CRM) for a study-abroad visa consultancy in Hyderabad |
| Stack | TanStack Start v1 (React 19, TanStack Router, Vite 7), Tailwind v4, shadcn/ui, Recharts, Sonner |
| Rendering | SSR + file-based routes under `src/routes/` |
| Data layer today | In-memory TypeScript constants (mock) |
| Persistence today | None |
| Auth today | None |
| Intended users | Super Admin, Branch Admin, Counsellor, Documentation Officer, Finance, Visa Team (`Staff.role` in `src/data/crm.ts`) |

### Routes that exist

| Route file | URL | Purpose |
|---|---|---|
| `routes/index.tsx` | `/` | Dashboard: 6 KPIs, admissions area chart, country pie, activity, deadlines, tasks |
| `routes/students.index.tsx` | `/students` | Student list + search + selection + pagination |
| `routes/students.$id.tsx` | `/students/:id` | Student file: Details / Destinations & Checklists / Documents / Payments / Form filling |
| `routes/leads.tsx` | `/leads` | Lead pool cards, Convert / Assign / Note |
| `routes/applications.tsx` | `/applications` | Kanban by pipeline stage |
| `routes/payments.tsx` | `/payments` | Student-wise paid/pending table (no global revenue by design) |
| `routes/staff.tsx` | `/staff` | Staff list, role, branches, active toggle, reset password |
| `routes/branches.tsx` | `/branches` | Branch cards, create/edit/rename/archive |
| `routes/activity.tsx` | `/activity` | Audit trail timeline + search |
| `routes/reports.tsx` | `/reports` | Branch volume bar chart, admissions momentum line chart, Export PDF |
| `routes/settings.tsx` | `/settings` | Organisation form, fee templates, notification switches |
| `components/layout/TopBar.tsx` | global | Branch selector, global search, Quick Add, notifications, theme, profile menu |
| `components/layout/AppSidebar.tsx` | global | Navigation only |

### Core domain entities inferred from the code

`Branch`, `Student`, `StudentProfile` (extended), `StudentDestination`, `ChecklistItem` (per-country template), `StudentChecklistItemStatus`, `Document/Upload`, `Payment`, `FormEntry`, `Lead`, `Staff` (+ roles, branch assignment), `Activity`, `Deadline`, `Task`, `FeeTemplate`, `NotificationPreference`, `OrgSettings`.

---

## 2. Complete Frontend Interaction Map (inventory)

Every interactive element found in the code, grouped by screen.

**Global shell (TopBar / Sidebar)** — sidebar trigger (collapse), branch `Select`, global search `Input`, "Quick Add" button, notification bell (badge "3"), dark/light toggle, settings icon button, avatar dropdown → Profile / Preferences / Sign out, sidebar nav links (10).

**Dashboard `/`** — "This month" period button, "New Student" button, 6 KPI tiles (static strings), admissions AreaChart (tooltip/hover), country PieChart (legend/tooltip), activity list (read-only), deadlines list (read-only), task checkboxes (`defaultChecked`, uncontrolled).

**Students `/students`** — search input, "Add" button in toolbar, "Import" button, "New Student" button, header select-all checkbox, per-row checkbox, student-name link → `/students/$id`, "Previous"/"Next" pagination buttons, empty state.

**Student file `/students/:id`** — "Back" link, "Edit file" button, 5 tabs, destination country `Select`, "Add destination" button, destination cards with admission + visa checklist columns and per-item `StatusPill`, documents summary tiles + uploads table, payments summary tiles + payments table, form-filling progress rows, not-found state.

**Leads `/leads`** — "Add Lead" button, per-card "Convert" (toast only), "Assign", "Note".

**Applications `/applications`** — "New Application" button, 6 stage columns rendered by filtering `students` on `status`; cards are not draggable today.

**Payments `/payments`** — search input, "Record payment" button, student link, "View" button.

**Staff `/staff`** — search input, "Add Staff" button, active `Switch` per row (uncontrolled), "Reset password" button (toast only).

**Branches `/branches`** — "Create Branch" (toast), per-card "Edit", "Rename", "Archive" (toast).

**Activity `/activity`** — search input, read-only timeline.

**Reports `/reports`** — "Export PDF" button, 2 charts.

**Settings `/settings`** — 3 tabs; org inputs (name, head office, support email, base currency) + "Save changes" (toast); fee template rows + "Edit"; 4 notification `Switch`es (uncontrolled).

---

## 3. Page-by-Page Interaction Mapping

> Columns: Page | UI Element | User Action | Frontend Behavior | Backend Action | API Endpoint | Method | Request Data | Response | DB Operation | Status

### 3.1 Authentication (screen does not exist — must be built)

| Page | UI Element | Action | Frontend Behavior | Backend Action | Endpoint | Method | Request | Response | DB | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Login | Email/Password form | Submit | Validate, disable button, spinner | Authenticate, issue session | `/api/auth/login` | POST | `{email,password}` | `{token, user{id,name,role,branchIds}}` | SELECT user, verify hash | ❌🔐 |
| Login | "Forgot password" | Click | Open reset form | Send reset mail | `/api/auth/forgot-password` | POST | `{email}` | `{ok:true}` (always) | INSERT reset token | ❌ |
| Any | Avatar → Sign out | Click | Cancel queries, clear cache, redirect `/login` | Revoke session | `/api/auth/logout` | POST | — | `{ok}` | DELETE session | ❌🔐 |
| Any | App boot | Load | Hydrate session, gate routes | Return current user | `/api/auth/me` | GET | — | `{user, permissions}` | SELECT user + roles | ❌🔐 |

### 3.2 Global shell

| Page | UI Element | Action | Frontend Behavior | Backend Action | Endpoint | Method | Request | Response | DB | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Shell | Branch `Select` | Change | Set active branch, refetch all branch-scoped queries | Return branches user may see | `/api/branches?scope=mine` | GET | — | `Branch[]` | SELECT branches JOIN staff_branches | ⚠️🔐🔄 |
| Shell | Branch `Select` | Change | Persist last-used branch | Save preference | `/api/me/preferences` | PATCH | `{activeBranchId}` | `{ok}` | UPDATE user_prefs | ❌ |
| Shell | Global search | Type (debounce 300ms) | Show grouped results dropdown *(dropdown not built — input is inert)* | Cross-entity search | `/api/search?q=&branchId=&limit=` | GET | `q` | `{students[],leads[],applications[]}` | SELECT with ILIKE / FTS, branch-filtered | ❌🔐🔄 |
| Shell | Quick Add | Click | Currently only a toast; should open a create-type menu | — (menu is client-side) | — | — | — | — | — | ⚠️❓ |
| Shell | Bell | Click | Currently toast "3 new notifications"; should open panel | List notifications | `/api/notifications?unread=true` | GET | — | `Notification[]` | SELECT | ❌ |
| Shell | Bell panel item | Click | Mark read, navigate to entity | Mark read | `/api/notifications/:id/read` | POST | — | `{ok}` | UPDATE | ❌ |
| Shell | Theme toggle | Click | Toggles `dark` class on `<html>` | None required (may persist) | `/api/me/preferences` | PATCH | `{theme}` | `{ok}` | UPDATE | ✅ client-only / optional 🔄 |
| Shell | Sidebar collapse | Click | Local UI state | None | — | — | — | — | — | ✅ |
| Shell | Nav links | Click | Client-side route change | None | — | — | — | — | — | ✅ |
| Shell | Profile / Preferences menu items | Click | No handler attached today | Load profile | `/api/me` | GET | — | `{user}` | SELECT | ⚠️❓ |

### 3.3 Dashboard `/`

| Page | UI Element | Action | Frontend Behavior | Backend Action | Endpoint | Method | Request | Response | DB | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Dashboard | Page load | Load | Render 6 KPI tiles (today hardcoded `1,294`, `575`, `138`, `42`, `94.2%`, `88.7%`) | Aggregate KPIs | `/api/dashboard/kpis?branchId=&period=` | GET | `branchId, period` | `{totalStudents, activeApplications, pendingDocuments, upcomingDeadlines, visaSuccessRate, admissionSuccessRate, deltas}` | COUNT/AGG across students, applications, documents, deadlines | ❌🔐🔄 |
| Dashboard | "This month" button | Click | Should open period picker and refetch all widgets | Same KPI/chart endpoints with `period` | see above | GET | `period=this_month\|last_month\|ytd\|custom` | same shape | AGG with date filter | ⚠️❓ |
| Dashboard | Admissions AreaChart | Load | Renders `monthlyAdmissions` mock | Monthly series | `/api/dashboard/admissions-trend?branchId=&months=12` | GET | — | `[{month, applications, admissions}]` | GROUP BY month | ❌🔄 |
| Dashboard | Country PieChart | Load | Renders `countryDistribution` mock | Distribution | `/api/dashboard/country-distribution?branchId=` | GET | — | `[{country, value}]` | GROUP BY destination country | ❌🔄 |
| Dashboard | Recent activity list | Load | First 5 of `activities` | Audit feed | `/api/activity?limit=5&branchId=` | GET | — | `Activity[]` | SELECT ORDER BY created_at DESC | ❌🔐🔄 |
| Dashboard | Upcoming deadlines | Load | Renders `deadlines` mock | Deadline feed | `/api/deadlines?bucket=all&branchId=` | GET | — | `Deadline[]` grouped Overdue/Today/Week/Upcoming | SELECT WHERE due_at ranges | ❌🔄 |
| Dashboard | Task checkbox | Toggle | Uncontrolled `defaultChecked` — change is lost on rerender | Persist completion | `/api/tasks/:id` | PATCH | `{done:boolean}` | `Task` | UPDATE tasks | ⚠️🔐🔄 |
| Dashboard | "New Student" | Click | No handler today; should open create form/modal | Create (see 3.4) | `/api/students` | POST | student payload | `Student` | INSERT | ⚠️ |

### 3.4 Students `/students`

| Page | UI Element | Action | Frontend Behavior | Backend Action | Endpoint | Method | Request | Response | DB | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Students | Page load | Load | Renders full `students` array; header says "1,294 students" but 10 rows exist (hardcoded copy) | Paged list | `/api/students?page=1&pageSize=25&branchId=&status=&country=&intake=&counsellorId=&q=` | GET | query params | `{items:Student[], page, pageSize, total}` | SELECT + WHERE + LIMIT/OFFSET | ❌🔐🔄 |
| Students | Search input | Type | Client-side `.filter()` over the 10 mock rows | Server-side search | same list endpoint with `q` | GET | `q` | paged result | ILIKE / FTS on name,id,country,branch,counsellor,status | ⚠️🔄 |
| Students | Row checkbox / select-all | Click | Purely visual today, no state stored | Enables bulk ops | `/api/students/bulk` | POST | `{ids[], action:'assign'\|'archive'\|'export', payload}` | `{updated:n}` | UPDATE … WHERE id IN | ❌🔐 |
| Students | Student name link | Click | Router navigate to `/students/$id` | Fetch detail | `/api/students/:id` | GET | path id | full `StudentProfile` | SELECT + JOINs | ⚠️🔐🔄 |
| Students | "New Student" / toolbar "Add" | Click | No handler; should open form | — | — | — | — | — | — | ⚠️ |
| Students | Create form submit *(form not built)* | Submit | Validate, POST, optimistic insert, toast | Create student | `/api/students` | POST | `{name,email,phone,dob,gender,passportNo,address,branchId,counsellorId,country,intake,qualification,score,englishTest,workExperience}` | created `Student` | INSERT students | ❌🔐🔄 |
| Students | "Import" | Click | No handler; should open CSV/XLSX picker | Parse + bulk insert | `/api/students/import` | POST (multipart) | file | `{inserted, skipped, errors[]}` | Bulk INSERT in txn | ❌🔐🔄 |
| Students | "Previous"/"Next" | Click | No handler — pagination is decorative | Page fetch | list endpoint `page=` | GET | `page` | paged result | LIMIT/OFFSET | ⚠️ |
| Students | "Showing X of Y" | Load | Uses mock array length | `total` from API | list endpoint | GET | — | `total` | COUNT(*) | ⚠️ |
| Students | Delete *(no UI today)* | — | Should confirm then remove | Soft delete | `/api/students/:id` | DELETE | id | `{ok}` | UPDATE deleted_at (soft) | ❌🔐 |

### 3.5 Student file `/students/:id`

| Page | UI Element | Action | Frontend Behavior | Backend Action | Endpoint | Method | Request | Response | DB | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Student file | Route loader | Load | `students.find()` on the mock array; `notFound()` if missing | Fetch aggregate | `/api/students/:id` | GET | id | `{student, profile, destinations[], uploads[], payments[], forms[]}` | SELECT + JOIN destinations, documents, payments, forms | ⚠️🔐🔄 |
| Student file | "Edit file" | Click | No handler; should open edit form | Update student | `/api/students/:id` | PATCH | changed fields only | updated `Student` | UPDATE | ⚠️🔐 |
| Student file | Tabs (5) | Click | Local tab state (may lazy-fetch each tab) | Optional per-tab endpoints | `/api/students/:id/documents` etc. | GET | — | section payload | SELECT | ✅ client / ⚠️ data |
| Student file | Country `Select` | Change | Local `newCountry` state | Optionally fetch template | `/api/checklist-templates/:country` | GET | country | `{admission[], visa[], visaName}` | SELECT template rows | ⚠️🔄 |
| Student file | "Add destination" | Click | `setDests([...d, newDest])` — **lost on reload** | Create destination + instantiate checklists | `/api/students/:id/destinations` | POST | `{country, universityId?, courseId?, intake}` | created `StudentDestination` incl. generated checklist items | INSERT destination; INSERT checklist_items from template (+ university/course extras) | ⚠️🔐🔄 |
| Student file | Destination card fields (university/course/intake) | *(read-only today)* | Should be editable | Update destination | `/api/destinations/:destId` | PATCH | `{universityId, courseId, intake, applicationStatus, visaStatus}` | updated destination | UPDATE | ❌🔐 |
| Student file | Remove destination *(no UI)* | — | Confirm dialog | Delete destination + its items | `/api/destinations/:destId` | DELETE | — | `{ok}` | DELETE cascade | ❌🔐 |
| Student file | Checklist item `StatusPill` | *(display only today)* | Should be a status dropdown | Update item status | `/api/destinations/:destId/checklist/:itemId` | PATCH | `{status:'Pending\|Received\|Approved\|Rejected\|Waived', remark?}` | updated item + recomputed progress | UPDATE checklist_item; INSERT activity | ❌🔐🔄 |
| Student file | Checklist progress bar | Derived | `done/total` computed client-side from statuses | Optionally server-computed | in destination payload | GET | — | `{completed,total}` | AGG | ⚠️ |
| Student file | Documents tab tiles | Load | Counts of `uploads` by status | Counts | `/api/students/:id/documents` | GET | — | `{items[], counts{}}` | SELECT + GROUP BY | ⚠️🔄 |
| Student file | Upload document *(no upload control today — required by spec)* | Select file | Validate type/size, progress bar | Store file, create record | `/api/students/:id/documents` | POST multipart | `{file, docType, destinationId?, checklistItemId?}` | `{document}` | Upload to storage; INSERT documents | ❌🔐🔄 |
| Student file | Approve / Reject document *(no UI)* | Click | Confirm + remark | Review document | `/api/documents/:docId/review` | PATCH | `{status, remark}` | updated doc | UPDATE + INSERT activity | ❌🔐 |
| Student file | Download document *(no UI)* | Click | Open signed URL | Issue signed URL | `/api/documents/:docId/url` | GET | — | `{url, expiresIn}` | SELECT + storage sign | ❌🔐 |
| Student file | Payments tiles (paid/pending/status) | Load | `reduce()` over mock payments | Server totals | `/api/students/:id/payments` | GET | — | `{items[], totals{paid,pending,currency}}` | SELECT + SUM | ⚠️🔐🔄 |
| Student file | Record payment *(no UI on this page)* | — | Form → POST | Create receipt | `/api/students/:id/payments` | POST | `{type, amount, paid, currency, mode, date, reference}` | `Payment` | INSERT payments; recompute outstanding | ❌🔐🔄 |
| Student file | Form-filling rows | Load | Static progress/status | Fetch forms | `/api/students/:id/forms` | GET | — | `FormEntry[]` | SELECT | ❌🔄 |
| Student file | Update form progress *(no UI)* | — | — | Update | `/api/forms/:formId` | PATCH | `{progress, status, ownerId}` | updated | UPDATE | ❌🔐 |
| Student file | Not-found state | Load unknown id | Renders "Student not found" | 404 | `/api/students/:id` | GET | — | `404 {error}` | SELECT → none | ⚠️ |

### 3.6 Leads `/leads`

| Page | UI Element | Action | Frontend Behavior | Backend Action | Endpoint | Method | Request | Response | DB | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Leads | Page load | Load | Renders `leads` mock | List leads | `/api/leads?status=new&branchId=&priority=&source=` | GET | filters | `Lead[]` | SELECT | ❌🔐🔄 |
| Leads | "Add Lead" | Click | No handler; should open form | Create lead | `/api/leads` | POST | `{name,phone,email,country,program,source,priority,branchId}` | `Lead` | INSERT | ⚠️🔐🔄 |
| Leads | "Convert" | Click | **Toast only** — `toast.success("<name> converted to student")`, nothing persists | Convert lead → student | `/api/leads/:id/convert` | POST | `{counsellorId, branchId, intake}` | `{student, leadId}` | Txn: INSERT student, UPDATE lead.status='converted', INSERT activity | ⚠️🔐🔄 |
| Leads | "Assign" | Click | No handler | Assign counsellor | `/api/leads/:id/assign` | PATCH | `{counsellorId}` | updated `Lead` | UPDATE + INSERT activity + notify | ❌🔐 |
| Leads | "Note" | Click | No handler | Add note | `/api/leads/:id/notes` | POST | `{body}` | `Note` | INSERT lead_notes | ❌🔐 |
| Leads | Reject lead *(no UI)* | — | — | Mark rejected | `/api/leads/:id/reject` | PATCH | `{reason}` | updated | UPDATE | ❌🔐 |
| — | Website enquiry intake | External POST | — | Capture public enquiry | `/api/public/leads` | POST | `{name,email,phone,country,program,source}` + rate limit/captcha | `{ok}` | INSERT lead | ❌🔄 |

### 3.7 Applications `/applications`

| Page | UI Element | Action | Frontend Behavior | Backend Action | Endpoint | Method | Request | Response | DB | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Applications | Page load | Load | Groups the mock `students` by `status` — **applications are not a real entity yet** | List applications grouped by stage | `/api/applications?branchId=&groupBy=stage` | GET | filters | `{stage: Application[]}` | SELECT applications JOIN students, universities | ❌🔐🔄 |
| Applications | "New Application" | Click | No handler | Create application | `/api/applications` | POST | `{studentId, destinationId, universityId, courseId, intake}` | `Application` | INSERT | ⚠️🔐🔄 |
| Applications | Card | Click *(no handler)* | Should navigate to student/application detail | Fetch | `/api/applications/:id` | GET | — | `Application` | SELECT | ⚠️ |
| Applications | Drag card between stages *(not implemented)* | Drag | Optimistic move, rollback on error | Change stage | `/api/applications/:id/stage` | PATCH | `{stage, note?}` | updated + new allowed transitions | UPDATE stage; INSERT stage_history; INSERT activity | ❌🔐🔄 |

### 3.8 Payments `/payments`

| Page | UI Element | Action | Frontend Behavior | Backend Action | Endpoint | Method | Request | Response | DB | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Payments | Page load | Load | Computes paid/pending per student from mocks | Student-wise summary | `/api/payments/summary?branchId=&page=&q=` | GET | filters | `{items:[{studentId,name,branch,counsellor,paid,pending,status}], total}` | SELECT students LEFT JOIN payments GROUP BY student | ❌🔐🔄 |
| Payments | Search | Type | Client-side filter | Server-side `q` | same | GET | `q` | filtered page | ILIKE | ⚠️ |
| Payments | "Record payment" | Click | No handler; should open form with student picker | Create payment | `/api/payments` | POST | `{studentId,type,amount,paid,currency,mode,date,reference}` | `Payment` | INSERT; recompute outstanding; INSERT activity | ⚠️🔐🔄 |
| Payments | "View" / student link | Click | Navigate to student payments tab | Detail | `/api/students/:id/payments` | GET | — | payments + totals | SELECT | ⚠️ |
| Payments | Refund *(no UI)* | — | — | Refund | `/api/payments/:id/refund` | POST | `{amount, reason}` | updated | INSERT refund row; UPDATE status | ❌🔐 |
| Payments | Receipt PDF *(no UI)* | — | — | Generate receipt | `/api/payments/:id/receipt` | GET | — | PDF / signed URL | SELECT | ❌🔐 |

> Business rule already encoded in the UI: **no org-wide revenue/collection figures are shown anywhere**. The backend must therefore expose per-student aggregates only; any global revenue endpoint should be restricted to Super Admin (or omitted).

### 3.9 Staff `/staff`

| Page | UI Element | Action | Frontend Behavior | Backend Action | Endpoint | Method | Request | Response | DB | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Staff | Page load | Load | Renders `staff` mock | List staff | `/api/staff?branchId=&role=&q=` | GET | filters | `Staff[]` | SELECT staff + roles + branch assignments | ❌🔐🔄 |
| Staff | Search | Type | Client-side filter | Server search | same | GET | `q` | list | ILIKE | ⚠️ |
| Staff | "Add Staff" | Click | No handler; should open form | Create staff + invite | `/api/staff` | POST | `{name,email,role,branchIds[]}` | `Staff` | INSERT user, INSERT user_roles, INSERT staff_branches, send invite | ⚠️🔐🔄 |
| Staff | Active `Switch` | Toggle | Uncontrolled `defaultChecked` — not persisted | Enable/disable account | `/api/staff/:id/status` | PATCH | `{active:boolean}` | updated `Staff` | UPDATE active; revoke sessions when false | ⚠️🔐🔄 |
| Staff | "Reset password" | Click | **Toast only**: "Password reset link sent to <email>" — no mail is sent | Send reset link | `/api/staff/:id/reset-password` | POST | — | `{ok}` | INSERT reset token; send email | ⚠️🔐 |
| Staff | Change role / branches *(no UI)* | — | — | Update assignment | `/api/staff/:id` | PATCH | `{role, branchIds[]}` | updated | UPDATE user_roles / staff_branches | ❌🔐 |

### 3.10 Branches `/branches`

| Page | UI Element | Action | Frontend Behavior | Backend Action | Endpoint | Method | Request | Response | DB | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Branches | Page load | Load | Renders `branches` mock incl. per-branch students/staff/applications counts | List + counts | `/api/branches` | GET | — | `[{id,name,city,status,counts{students,staff,applications}}]` | SELECT + COUNT subqueries | ❌🔐🔄 |
| Branches | "Create Branch" | Click | **Toast only**: "Create branch form opened" | Create branch | `/api/branches` | POST | `{name, city, address, phone}` | `Branch` | INSERT | ⚠️🔐🔄 |
| Branches | "Edit" | Click | No handler | Update branch | `/api/branches/:id` | PATCH | changed fields | updated | UPDATE | ❌🔐 |
| Branches | "Rename" | Click | No handler | Rename | `/api/branches/:id` | PATCH | `{name}` | updated | UPDATE | ❌🔐 |
| Branches | "Archive" | Click | **Toast only**: "<name> archived" | Archive branch | `/api/branches/:id/archive` | POST | `{reassignToBranchId?}` | updated | UPDATE status='archived'; block if active students unless reassigned | ⚠️🔐🔄 |

### 3.11 Activity `/activity`

| Page | UI Element | Action | Frontend Behavior | Backend Action | Endpoint | Method | Request | Response | DB | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Activity | Page load | Load | Renders `activities` mock timeline | Paged audit log | `/api/activity?page=&branchId=&userId=&entity=&from=&to=` | GET | filters | `{items:Activity[], total}` | SELECT audit_log ORDER BY created_at DESC | ❌🔐🔄 |
| Activity | Search | Type | Client-side filter | Server search | same with `q` | GET | `q` | page | ILIKE / FTS | ⚠️ |
| — | Every mutating action | — | — | Write audit entry | internal | — | `{actorId, action, entityType, entityId, branchId, meta}` | — | INSERT audit_log (append-only, never UPDATE/DELETE) | ❌🔄 |

### 3.12 Reports `/reports`

| Page | UI Element | Action | Frontend Behavior | Backend Action | Endpoint | Method | Request | Response | DB | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Reports | Page load | Load | Bar chart from `branches`, line chart from `monthlyAdmissions` | Report data | `/api/reports/branch-volume`, `/api/reports/admissions-trend` | GET | `from,to,branchId` | series arrays | GROUP BY | ❌🔐🔄 |
| Reports | "Export PDF" | Click | No handler; should show progress then download | Render/queue export | `/api/reports/export` | POST | `{reportType, filters, format:'pdf'\|'xlsx'}` | `{jobId}` then `{url}` | SELECT + generate file | ⚠️🔐 |

### 3.13 Settings `/settings`

| Page | UI Element | Action | Frontend Behavior | Backend Action | Endpoint | Method | Request | Response | DB | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Settings | Org inputs | Type | Uncontrolled `defaultValue` inputs | — | — | — | — | — | — | ⚠️ |
| Settings | "Save changes" | Click | **Toast only**: "Organisation settings saved" | Persist org settings | `/api/settings/organisation` | PUT | `{name, headOffice, supportEmail, baseCurrency}` | updated settings | UPDATE org_settings (single row) | ⚠️🔐🔄 |
| Settings | Fee templates list | Load | Hardcoded array inside the route file | List templates | `/api/settings/fee-templates` | GET | — | `FeeTemplate[]` | SELECT | ❌🔄 |
| Settings | Fee "Edit" | Click | No handler | Update template | `/api/settings/fee-templates/:id` | PATCH | `{name, amount, currency}` | updated | UPDATE | ❌🔐 |
| Settings | Notification `Switch`es | Toggle | Uncontrolled, not persisted | Save prefs | `/api/settings/notifications` | PUT | `{newLeadEmail, deadlineReminder, paymentDigest, visaAlerts}` | updated | UPSERT notification_prefs | ⚠️🔐🔄 |
| Settings | Checklist templates *(no UI, data lives in `src/data/checklists.ts`)* | — | — | Manage templates | `/api/checklist-templates`, `/api/checklist-templates/:country` | GET/PUT | template items | template | SELECT/UPSERT | ❌🔄 |

---

## 4. Frontend → API → Backend → Database Flow (key features)

### 4.1 Add destination to a student (currently local state only)
```
User opens /students/APX-1041 → Destinations tab
→ selects "Canada" in Select → clicks "Add destination"
→ Frontend validates a country is selected (already done: no-op if empty)
→ POST /api/students/APX-1041/destinations  { country:"Canada", intake:"Jan 2027" }
→ Backend verifies bearer token (401 if absent)
→ Backend checks caller can access the student's branch (403 otherwise)
→ Backend checks (studentId, country, university, intake) is not a duplicate → 409 if it is
→ Backend INSERTs student_destinations row
→ Backend loads checklist_templates WHERE country='Canada'
   and INSERTs one student_checklist_item per admission + visa requirement (status 'Pending')
   plus any university/course-specific extra requirements
→ Backend INSERTs audit_log entry
→ 201 { destination: { id, country, university, course, intake,
        applicationStatus, visaStatus, admissionItems[], visaItems[] } }
→ Frontend appends to the destinations list / invalidates ['student', id]
→ New destination card renders with its country-specific admission + visa checklists
→ toast.success("Canada added — 11 checklist items generated")
Failure paths: 401 → redirect /login · 403 → "You cannot edit students in this branch"
· 409 → "This destination already exists for the student" · 422 → field errors
· 5xx → rollback optimistic append + "Could not add destination. Retry."
```

### 4.2 Convert a lead (today: toast only)
```
User clicks "Convert" on lead LD-2201
→ Frontend opens a confirm/assign dialog (counsellor, branch, intake)  [NOT BUILT]
→ POST /api/leads/LD-2201/convert { counsellorId, branchId, intake }
→ Backend authenticates + authorizes (Counsellor/Branch Admin/Super Admin, lead in caller's branch)
→ Backend re-reads lead FOR UPDATE; if lead.status='converted' → 409
→ Backend checks duplicate student by (email|phone) → 409 "Student already exists"
→ Txn: INSERT students; UPDATE leads SET status='converted', student_id=...;
       INSERT audit_log; enqueue welcome email/notification
→ 201 { student, leadId }
→ Frontend removes the lead card, invalidates ['leads'] and ['students'],
  toast.success + "Open student file" action → /students/:newId
Failure: 409 duplicate → show link to the existing student, do not create.
```

### 4.3 Upload a document against a checklist item (control not built)
```
User opens Documents tab → picks file for "Bank statement (funds)"
→ Frontend validates type (pdf/jpg/png) and size (≤ 10 MB) before upload
→ POST /api/students/:id/documents (multipart: file, docType, destinationId, checklistItemId)
→ Backend authenticates; authorizes branch access; re-validates mime + size server-side
→ Backend virus/size scan → stores object in private bucket (key: students/:id/:uuid)
→ INSERT documents { student_id, checklist_item_id, storage_key, uploaded_by, status:'Received' }
→ UPDATE student_checklist_items SET status='Received'
→ INSERT audit_log; notify the assigned Documentation Officer
→ 201 { document, checklistItem }
→ Frontend updates the uploads table row + status tiles + checklist progress bar
Failure: 413 too large · 415 unsupported type · 403 wrong branch · 5xx → keep local file, allow retry
Review path: Documentation Officer PATCH /api/documents/:docId/review {status:'Approved'|'Rejected', remark}
→ UPDATE documents + linked checklist item → notify counsellor + student.
```

### 4.4 Record a payment
```
User clicks "Record payment" on /payments (or in a student file)
→ Frontend opens form: student, fee type (from fee templates), amount, paid now, currency, mode, date, reference
→ Validates amount > 0, paid ≤ amount, date not in the future
→ POST /api/payments { studentId, type, amount, paid, currency, mode, date, reference }
→ Backend authenticates; requires Finance / Branch Admin / Super Admin
→ Backend validates currency ∈ allowed, amount numeric, idempotency key to avoid double-submit
→ INSERT payments; recompute student's paid/pending; INSERT audit_log
→ 201 { payment, studentTotals:{paid,pending,status} }
→ Frontend invalidates ['payments','summary'] and ['student', id, 'payments'],
  updates the row's Paid/Pending/Status, toast.success("Receipt PY-#### recorded")
Failure: 403 (counsellor role) → "Only Finance can record payments" · 422 → inline field errors.
```

### 4.5 Branch switch (affects every screen)
```
User picks a branch in the TopBar Select
→ Frontend stores activeBranchId in context + PATCH /api/me/preferences
→ Every subsequent query sends branchId (dashboard KPIs, students, leads, applications, payments, staff, activity)
→ Backend IGNORES a branchId the caller is not assigned to (403 or silently scope to allowed set —
  must be decided; see Backend Questions) — never trust the client-supplied branch.
```

---

## 5. Authentication & Authorization Mapping

Current state: **none**. There is no login route, no session, no token, no role gate. The avatar hardcodes "Anil Kumar — Super Admin". Everything below must be built.

### Required session data
`{ userId, name, email, role, branchIds[], permissions[] }` + access token (short-lived) and refresh/session cookie.

### Role → capability matrix (derived from `Staff.role`)

| Capability | Super Admin | Branch Admin | Counsellor | Documentation Officer | Finance | Visa Team |
|---|---|---|---|---|---|---|
| View dashboard | all branches | own branches | own branch, own students | own branch | own branches | own branch |
| Create/edit student | ✔ | ✔ own branches | ✔ own students | ✖ | ✖ | ✖ |
| Delete/archive student | ✔ | ✖ (request) | ✖ | ✖ | ✖ | ✖ |
| Import students | ✔ | ✔ | ✖ | ✖ | ✖ | ✖ |
| View/convert/assign leads | ✔ | ✔ | ✔ own | ✖ | ✖ | ✖ |
| Add/edit destinations | ✔ | ✔ | ✔ own students | ✖ | ✖ | ✖ |
| Upload documents | ✔ | ✔ | ✔ | ✔ | ✖ | ✔ |
| Approve/reject documents | ✔ | ✔ | ✖ | ✔ | ✖ | ✔ (visa docs) |
| View payments (student-wise) | ✔ | ✔ own branches | ✔ own students | ✖ | ✔ | ✖ |
| Record payment / refund | ✔ | ✔ | ✖ | ✖ | ✔ | ✖ |
| Manage staff, roles | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Manage branches | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Org settings, fee & checklist templates | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Reports / export | ✔ all | ✔ own branches | ✖ | ✖ | ✔ finance | ✖ |
| Activity log | ✔ all | ✔ own branches | ✖ | ✖ | ✖ | ✖ |

### Non-negotiable backend rules
1. **Every** endpoint except `/api/auth/login`, `/api/auth/forgot-password` and `/api/public/leads` requires a valid session.
2. Roles are stored in a **separate `user_roles` table** — never a column on the profile/user row (privilege-escalation risk).
3. Branch scoping is enforced **server-side** from `staff_branches`, never from a client-sent `branchId`.
4. Route guards in the SPA protect UI only; each endpoint re-checks auth + role + branch independently.
5. Documents live in a private bucket; access only via short-lived signed URLs, authorized per request.
6. Audit log is append-only and written inside the same transaction as the mutation.
7. Rate-limit `/api/auth/login` and the public lead intake.

---

## 6. Database / Data Mapping

### Suggested tables

| Table | Key columns | Relationships |
|---|---|---|
| `branches` | id, name, city, address, phone, status(active/archived), created_at | — |
| `users` | id, name, email(unique), phone, active, created_at | — |
| `user_roles` | id, user_id → users, role (enum: super_admin, branch_admin, counsellor, doc_officer, finance, visa_team), unique(user_id, role) | FK users |
| `staff_branches` | user_id → users, branch_id → branches, unique pair | many-to-many |
| `students` | id, code (APX-####, unique), name, email, phone, dob, gender, passport_no, passport_expiry, address, branch_id, counsellor_id, status (enum pipeline), preferred_intake, qualification, score, english_test, work_experience, outstanding (derived), created_at, deleted_at | FK branches, users |
| `leads` | id, code (LD-####), name, email, phone, country, program, source, priority, status(new/assigned/converted/rejected), assigned_to, branch_id, converted_student_id, created_at | FK users, branches, students |
| `lead_notes` | id, lead_id, author_id, body, created_at | FK leads, users |
| `universities` | id, name, country | — |
| `courses` | id, university_id, name, level | FK universities |
| `student_destinations` | id, student_id, country, university_id, course_id, intake, application_status, visa_status, created_at | FK students, universities, courses |
| `applications` | id, student_id, destination_id, stage, submitted_at, decision, decision_at | FK students, destinations |
| `application_stage_history` | id, application_id, from_stage, to_stage, changed_by, changed_at | FK |
| `checklist_templates` | id, country, kind(admission/visa), visa_name, label, note, optional, sort_order | — |
| `student_checklist_items` | id, destination_id, kind, label, note, optional, status(Pending/Received/Approved/Rejected/Waived), source(template/university_extra), document_id, updated_by, updated_at | FK destinations, documents |
| `documents` | id, student_id, destination_id?, checklist_item_id?, name, storage_key, mime, size, uploaded_by, uploaded_at, status, reviewer_id, remark | FK students, users |
| `payments` | id, receipt_no (PY-####), student_id, type, amount, paid, currency, mode, paid_on, reference, status(Paid/Pending/Partial/Refunded), created_by, created_at | FK students, users |
| `payment_refunds` | id, payment_id, amount, reason, created_by, created_at | FK payments |
| `forms` | id, student_id, name, progress, status, owner_id | FK students, users |
| `tasks` | id, assignee_id, student_id?, label, tag, due_at, done, done_at | FK users, students |
| `deadlines` | id, student_id, destination_id?, title, due_at, bucket(derived), completed | FK |
| `notifications` | id, user_id, type, payload jsonb, read_at, created_at | FK users |
| `audit_log` | id, actor_id, action, entity_type, entity_id, branch_id, meta jsonb, created_at | append-only |
| `fee_templates` | id, name, amount, currency, active | — |
| `org_settings` | id (singleton), name, head_office, support_email, base_currency | — |
| `notification_prefs` | user_id, new_lead_email, deadline_reminder, payment_digest, visa_alerts | FK users |

### Field mapping (representative)

| Frontend field (code) | API field | DB column | Notes |
|---|---|---|---|
| `Student.id` = "APX-1041" | `code` | `students.code` | display code; real PK should be a uuid |
| `Student.branch` (name string) | `branchId` + `branch.name` | `students.branch_id` | UI shows the name; API must send the id |
| `Student.counsellor` (name string) | `counsellorId` + `counsellor.name` | `students.counsellor_id` | same |
| `Student.status` | `status` | `students.status` enum | Lead/Counselling/Applied/Offer Received/Visa Filed/Visa Approved/Enrolled |
| `Student.outstanding` | `totals.pending` | derived SUM(payments.amount-paid) | do not store denormalized without a trigger |
| `StudentProfile.passport` = "V1234567 · exp. 2032" | `passportNo`,`passportExpiry` | two columns | UI concatenates; API must split |
| `StudentDestination.extraRequirements[]` | `extraRequirements[]` | `student_checklist_items` rows with `source='university_extra'` | |
| `admissionStatus`/`visaDocStatus` maps keyed by label | items array with `id` | `student_checklist_items.id` | **keying by label is fragile — use ids** |
| `UploadedDoc.uploaded` = "02 Jul 2026" | `uploadedAt` ISO | `documents.uploaded_at timestamptz` | format in the UI, not in the API |
| `Payment.amount/paid` (number) | minor units integer | `numeric(14,2)` or integer paise | avoid floats for money |
| `Activity.time` = "12 min ago" | `createdAt` ISO | `audit_log.created_at` | relative formatting is a UI concern |
| `Deadline.bucket` | derived | computed from `due_at` | server may send both |

### CRUD summary
- **Create**: student, lead, lead note, destination, application, document, payment, refund, staff, branch, task, fee template.
- **Read**: all lists (paged, branch-scoped), student aggregate, dashboard aggregates, reports, activity, notifications.
- **Update**: student fields, destination status, checklist item status, document review, application stage, staff active/role/branches, branch details, tasks, settings, notification prefs.
- **Delete**: soft-delete student, delete destination (cascade its checklist items), delete lead note, archive branch, deactivate staff. **Never hard-delete payments or audit rows.**

### Must NOT be exposed to the frontend
Password hashes, reset tokens, raw storage keys/bucket credentials, other users' sessions, internal cost/commission data, full audit rows of other branches, and any org-wide revenue totals (explicit product rule).

---

## 7. API Specification

All entries below are **API REQUIRED — NOT CURRENTLY IMPLEMENTED**. Auth column: `none` / `session` / `role`.

| API | Method | Purpose | Auth | Request | Response | Used By |
|---|---|---|---|---|---|---|
| `/api/auth/login` | POST | Sign in | none | `{email,password}` | `{token,user}` | Login page (to build) |
| `/api/auth/logout` | POST | Sign out | session | — | `{ok}` | Avatar menu |
| `/api/auth/me` | GET | Current session | session | — | `{user,permissions}` | App boot, route guards |
| `/api/auth/forgot-password` | POST | Reset mail | none | `{email}` | `{ok}` | Login page |
| `/api/me/preferences` | PATCH | Theme, active branch | session | `{theme?,activeBranchId?}` | `{ok}` | TopBar |
| `/api/search` | GET | Global search | session | `q,branchId` | `{students,leads,applications}` | TopBar search |
| `/api/dashboard/kpis` | GET | 6 KPI tiles | session | `branchId,period` | KPI object | `/` |
| `/api/dashboard/admissions-trend` | GET | Area chart | session | `branchId,months` | series | `/` , `/reports` |
| `/api/dashboard/country-distribution` | GET | Pie chart | session | `branchId` | series | `/` |
| `/api/deadlines` | GET | Deadline feed | session | `branchId,bucket` | `Deadline[]` | `/` |
| `/api/tasks` | GET | My tasks | session | `assignee=me` | `Task[]` | `/` |
| `/api/tasks/:id` | PATCH | Toggle done | session | `{done}` | `Task` | `/` |
| `/api/students` | GET | Paged list | session | filters | `{items,total}` | `/students` |
| `/api/students` | POST | Create | counsellor+ | student payload | `Student` | `/students`, `/` |
| `/api/students/:id` | GET | Full file | session | — | aggregate | `/students/:id`, `/payments` |
| `/api/students/:id` | PATCH | Edit file | counsellor+ | partial | `Student` | `/students/:id` |
| `/api/students/:id` | DELETE | Soft delete | super_admin | — | `{ok}` | (no UI yet) |
| `/api/students/bulk` | POST | Bulk actions | branch_admin+ | `{ids,action}` | `{updated}` | `/students` checkboxes |
| `/api/students/import` | POST | CSV import | branch_admin+ | multipart | `{inserted,errors}` | `/students` Import |
| `/api/students/:id/destinations` | POST | Add destination | counsellor+ | `{country,universityId?,courseId?,intake}` | destination + items | `/students/:id` |
| `/api/destinations/:id` | PATCH/DELETE | Edit/remove | counsellor+ | fields | updated/`{ok}` | `/students/:id` |
| `/api/destinations/:id/checklist/:itemId` | PATCH | Set item status | doc_officer/visa_team/admin | `{status,remark}` | item | `/students/:id` |
| `/api/checklist-templates/:country` | GET | Country template | session | — | `{admission,visa,visaName}` | `/students/:id` |
| `/api/checklist-templates` | GET/PUT | Manage templates | super_admin | items | template | `/settings` (UI missing) |
| `/api/students/:id/documents` | GET/POST | List/upload | session / uploader roles | multipart | docs | `/students/:id` |
| `/api/documents/:id/review` | PATCH | Approve/reject | doc_officer+ | `{status,remark}` | doc | `/students/:id` |
| `/api/documents/:id/url` | GET | Signed download | session | — | `{url}` | `/students/:id` |
| `/api/students/:id/payments` | GET/POST | Student payments | finance/admin (write) | payment payload | payments + totals | `/students/:id` |
| `/api/payments` | POST | Record payment | finance+ | payload | `Payment` | `/payments` |
| `/api/payments/summary` | GET | Student-wise table | session (scoped) | `branchId,q,page` | rows | `/payments` |
| `/api/payments/:id/refund` | POST | Refund | finance+ | `{amount,reason}` | payment | (no UI yet) |
| `/api/payments/:id/receipt` | GET | Receipt PDF | session | — | file | (no UI yet) |
| `/api/students/:id/forms` , `/api/forms/:id` | GET/PATCH | Form filling | session | `{progress,status,ownerId}` | form | `/students/:id` |
| `/api/leads` | GET/POST | Lead pool | session | filters / payload | leads | `/leads` |
| `/api/leads/:id/convert` | POST | Lead → student | counsellor+ | `{counsellorId,branchId,intake}` | `{student}` | `/leads` Convert |
| `/api/leads/:id/assign` | PATCH | Assign counsellor | branch_admin+ | `{counsellorId}` | lead | `/leads` Assign |
| `/api/leads/:id/notes` | POST | Add note | session | `{body}` | note | `/leads` Note |
| `/api/leads/:id/reject` | PATCH | Reject | counsellor+ | `{reason}` | lead | (no UI yet) |
| `/api/public/leads` | POST | Website enquiry | none + captcha/rate-limit | enquiry | `{ok}` | Public site |
| `/api/applications` | GET/POST | Pipeline | session | filters/payload | applications | `/applications` |
| `/api/applications/:id/stage` | PATCH | Move stage | counsellor+ | `{stage}` | application | `/applications` (DnD missing) |
| `/api/staff` | GET/POST | Staff list/create | super_admin | filters/payload | staff | `/staff` |
| `/api/staff/:id` | PATCH | Role/branches | super_admin | `{role,branchIds}` | staff | `/staff` (UI missing) |
| `/api/staff/:id/status` | PATCH | Active toggle | super_admin | `{active}` | staff | `/staff` Switch |
| `/api/staff/:id/reset-password` | POST | Send reset | super_admin | — | `{ok}` | `/staff` button |
| `/api/branches` | GET/POST | Branches | session / super_admin | — / payload | branches | `/branches`, TopBar |
| `/api/branches/:id` | PATCH | Edit/rename | super_admin | `{name,city,...}` | branch | `/branches` |
| `/api/branches/:id/archive` | POST | Archive | super_admin | `{reassignToBranchId?}` | branch | `/branches` |
| `/api/activity` | GET | Audit trail | branch_admin+ | filters | `{items,total}` | `/activity`, `/` |
| `/api/notifications` , `/:id/read` | GET/POST | Bell | session | — | notifications | TopBar |
| `/api/reports/*` | GET | Report series | branch_admin+ | filters | series | `/reports` |
| `/api/reports/export` | POST | PDF/XLSX export | branch_admin+ | `{reportType,filters,format}` | `{jobId}`/`{url}` | `/reports` |
| `/api/settings/organisation` | GET/PUT | Org profile | super_admin | fields | settings | `/settings` |
| `/api/settings/fee-templates` , `/:id` | GET/POST/PATCH | Fee templates | super_admin | fields | templates | `/settings` |
| `/api/settings/notifications` | GET/PUT | Alert prefs | session | flags | prefs | `/settings` |

### Conventions to adopt
- JSON envelope for errors: `{ error: { code, message, fields?: {field: message} } }`.
- Status codes: 200/201 success, 400 malformed, 401 unauthenticated, 403 unauthorized/branch, 404 not found, 409 conflict/duplicate, 413 payload too large, 415 unsupported media, 422 validation, 429 rate limited, 500 server.
- Pagination: `?page=&pageSize=` → `{items, page, pageSize, total}`.
- Money as integer minor units + `currency`; dates as ISO 8601 UTC. All human formatting stays in the UI (`inr()` / `money()` helpers already exist in `src/data/crm.ts`).
- Idempotency-Key header on payment and conversion POSTs.

---

## 8. Success & Error Flows (standard contract for every mutation)

| State | Frontend behaviour expected |
|---|---|
| Loading (list) | Skeleton rows in the existing `Table`; keep header + toolbar visible |
| Loading (mutation) | Disable the button, show spinner in place of the label, block duplicate submit |
| Empty | Existing empty states ("No students found", "No destinations yet", "No payment records yet", "No matching students") |
| Success | Invalidate the affected query keys, optimistic patch where safe, `toast.success(...)` (Sonner already wired) |
| 401 | Clear session, redirect to `/login?redirect=<current>` |
| 403 | `toast.error("You don't have permission for this action")`, revert optimistic change |
| 404 | Route-level not-found (already implemented for student file) |
| 409 | Inline conflict message, e.g. "Student already exists" with a link to the existing record |
| 422 | Map `error.fields` onto form inputs |
| 429 | "Too many attempts, try again in a minute" |
| 5xx / offline | Roll back optimistic update, `toast.error` with a Retry action |

### Validation requirements (frontend + mirrored server-side)
- Student: name required (2–80), email valid & unique, phone 10-digit Indian format, DOB in the past and age ≥ 15, passport alphanumeric 6–12 + expiry in the future, branchId and counsellorId must exist, intake from the allowed list.
- Lead: name + (email or phone) required, source from enum, priority ∈ High/Medium/Low.
- Destination: country ∈ {United Kingdom, Canada, United States, Australia, Germany} (`src/data/checklists.ts`), no duplicate country+university+intake per student.
- Document: mime ∈ pdf/jpg/png, ≤ 10 MB, must belong to an existing checklist item when linked.
- Payment: amount > 0, paid ≥ 0 and ≤ amount, currency ∈ INR/USD/GBP/EUR/AUD/CAD, date ≤ today.
- Staff: email unique, role ∈ enum, at least one branch (except Super Admin = all).
- Branch: name unique, city required; archive blocked while active students remain unless reassigned.
- Settings: support email valid, base currency ISO-4217.

---

## 9. Missing APIs
**All of them.** Every endpoint in §7 is missing; there is not a single HTTP call in the frontend today. Highest-impact gaps: auth (`/api/auth/*`), students CRUD, student aggregate read, destinations + checklist items, documents upload/review, payments, leads convert/assign, applications stage, staff, branches, activity, settings.

## 10. Missing Backend Logic
1. Session issuance, refresh, revoke; password reset tokens; staff invitation emails.
2. Role + branch authorization layer applied to every endpoint (`user_roles`, `staff_branches`).
3. Checklist instantiation engine: country template + university/course extras → per-student checklist items on destination creation, and re-sync when a university/course changes.
4. Pipeline state machine for `Student.status` / `applications.stage` with legal transitions and history.
5. Lead → student conversion transaction with duplicate detection.
6. Document storage, signed URLs, review workflow, virus/type/size checks.
7. Payment ledger: totals per student, partial/refund handling, receipt numbering, receipt PDF.
8. Aggregation for dashboard KPIs, admissions trend, country distribution, branch volume — branch-scoped.
9. Deadline computation and bucketing (Overdue / Today / This week / Upcoming) + reminder scheduling.
10. Notification engine (in-app + email) honouring `notification_prefs`.
11. Append-only audit logging written in the same transaction as every mutation.
12. CSV/XLSX import parser with row-level error reporting; PDF/XLSX report export.
13. Search across students/leads/applications with branch scoping.
14. Branch archive guard + student reassignment.

## 11. Missing Database Requirements
None of the tables in §6 exist — there is no database at all. Minimum viable set to unblock the UI: `branches`, `users`, `user_roles`, `staff_branches`, `students`, `leads`, `student_destinations`, `checklist_templates`, `student_checklist_items`, `documents`, `payments`, `audit_log`. Second wave: `applications` (+ stage history), `universities`, `courses`, `forms`, `tasks`, `deadlines`, `notifications`, `fee_templates`, `org_settings`, `notification_prefs`, `lead_notes`, `payment_refunds`.

## 12. Frontend Issues / Unclear Requirements
1. No login screen, no route guard, no session — the entire portal is publicly reachable.
2. Buttons with **no handler at all**: New Student (×2), Import, Previous/Next, Add (toolbar), Edit file, Add Lead, Assign, Note, New Application, Record payment, Add Staff, Edit/Rename branch, Fee "Edit", Export PDF, Profile/Preferences menu items, TopBar settings icon.
3. Buttons that only fire a **toast and lie about the result**: Lead "Convert", Staff "Reset password", Branch "Create"/"Archive", Settings "Save changes", Quick Add, Bell.
4. Uncontrolled inputs whose state is silently discarded: dashboard task checkboxes, staff Active switch, notification switches, all Settings org inputs, student row checkboxes.
5. "Add destination" mutates local state only — lost on refresh/navigation.
6. Checklist item status is display-only; there is no way for staff to mark an item Received/Approved/Rejected/Waived even though the data model supports it.
7. There is **no document upload control** anywhere, although the Documents tab and the whole checklist concept depend on uploads.
8. Applications Kanban derives cards from `Student.status`; applications are not modelled per destination/university, so a student with two destinations cannot appear in two stages. Needs a real `applications` entity.
9. Hardcoded copy that will contradict live data: dashboard KPI values, "1,294 students across 4 active branches", "+18% YoY", notification count "3", "Good morning, Anil".
10. Checklist statuses are keyed by **label string**, so any template wording change orphans a student's progress.
11. Pagination UI exists but is non-functional; search is client-side over 10 mock rows.
12. `getStudentProfile()` fabricates a default profile for unknown students — must be removed once the API is live, so missing data reads as empty rather than invented.

## 13. Backend Developer Action Items / Questions
1. **Auth provider**: managed backend (Lovable Cloud) with email+password, or an existing SSO? Is MFA required for Super Admin?
2. **Branch scoping**: if a user requests a branch they are not assigned to — 403, or silently scope to their allowed branches?
3. **Student ID format**: keep human codes `APX-####` (needs a sequence per branch?) alongside uuid PKs?
4. **Multi-currency**: are payments stored in the transaction currency with an FX snapshot, or converted to INR at entry?
5. **University/course catalogue**: seeded master data, or free-text per destination (UI currently shows free text, incl. "To be shortlisted")?
6. **University/course-specific extra requirements**: maintained per course in the catalogue, or entered ad-hoc per student?
7. **Visa checklist trigger**: spec says "generated based on the student's passport country and education provider" — today only the destination country drives it. Do we need passport-nationality variants (e.g. non-Indian passport holders)?
8. **Document retention**: how long are passports/financials kept, and who may download them? Any DPDP-Act obligations?
9. **Deletion policy**: soft-delete everywhere? Who can hard-delete, and are payments/audit immutable (recommended: yes)?
10. **Application vs student status**: should the pipeline stage live on the student, on each destination, or on a separate application record (recommended: application)?
11. **Notifications**: email provider and whether SMS/WhatsApp is in scope for deadline reminders.
12. **Reports export**: synchronous download or async job + email link?
13. **Lead intake**: which public sources post into `/api/public/leads` (website form, Meta/Google lead ads) and what signature/captcha protects it?
14. **Data visibility**: can a counsellor see other counsellors' students in the same branch (read-only), or only their own?

## 14. Priority-wise Implementation Plan

**P0 — Foundation (blocks everything)**
1. Provision database + storage; create `branches`, `users`, `user_roles`, `staff_branches`.
2. Auth: `/api/auth/login|logout|me|forgot-password`, session middleware, `_authenticated` route gate, real login screen, session-aware avatar/sign-out.
3. Authorization middleware: role check + branch scoping helper used by every handler.
4. Audit log table + write helper.

**P1 — Core casework**
5. `students` table + list/detail/create/update endpoints; wire `/students` and `/students/:id` to the API; remove `getStudentProfile()` fallback.
6. `student_destinations` + `checklist_templates` + `student_checklist_items`; destination create/delete; checklist status PATCH (add the status control to the UI as a separate task).
7. `documents` + storage, upload, review, signed download (add upload UI).
8. `payments` + student-wise summary and record-payment endpoints; wire `/payments` and the payments tab.

**P2 — Pipeline & operations**
9. `leads` + convert/assign/note + public intake; make Convert real.
10. `applications` entity + stage transitions + history; back the Kanban and enable drag-and-drop.
11. `/api/staff` and `/api/branches` write paths; make the Active switch, Reset password, Create/Archive branch real.
12. Activity log endpoint + wiring; notifications and bell panel.

**P3 — Insight & configuration**
13. Dashboard KPI/trend/distribution aggregates; delete hardcoded KPI strings.
14. Reports endpoints + export job.
15. Settings: org profile, fee templates, notification prefs, checklist template management UI.
16. Bulk actions, CSV import, server-side pagination and global search.

**P4 — Hardening**
17. Rate limiting, idempotency keys, virus scanning, retention/deletion policy, backups, permission test suite covering every role × endpoint.
