# Santaan CRM Final Release Note

Date: March 21, 2026 (IST)
Prepared for: Admin WhatsApp rollout and April 2026 CRM start

## 1) Final release status

The CRM is now wired for role-based daily execution, not just reporting.

Live release points verified in code:
- `/login` accepts username/email plus PIN.
- Leadership can create users, edit users, disable users, reset individual PINs, and bulk reset admin/staff PINs from `Team -> User Access (Username + PIN)`.
- Role-based tab visibility is active in the CRM dashboard.
- `Today`, `Daily Command`, `Workboard`, `Contacts`, `Analytics`, `Spend`, `CEO Command`, `Ops Inputs`, `Team`, `Centers`, `Announcements`, and `Settings` are wired by role.
- `Today` view gives a rider/checklist plus snapshot for leads, qualified, converted, hot leads, follow-ups due, and stale leads.
- `Daily Command` is role-based and updates CEO-facing accountability.
- Contacts workflow supports status progression and next follow-up scheduling.
- Wiring health endpoint exists for admin health checks.

Release alignment completed:
- Login page copy now reflects username/email + 6-digit PIN.
- Quick-start and training manuals now reflect PIN-based access.

## 2) UI/UX release note

What is working well:
- The dashboard now opens on a practical `Today` view instead of a cold table.
- Access is role-scoped, so each team sees only the tabs they need.
- Admin access management is self-serve from inside CRM.
- Daily execution is anchored around `Today`, `Daily Command`, `Workboard`, and `Follow-ups`.

Minor release caveats:
- PIN reset actions in Team Management still use browser prompt/confirm modals. They work, but are functional rather than polished.
- A few legacy docs still mention older password language outside the files updated today, so rollout should use this note and the updated manuals.

## 3) Daily protocol to tell users

Golden rule:
`CRM me update nahi hua = kaam done nahi maana jayega.`

Minimum protocol for every active user:
1. Login at the start of shift.
2. Open `Today` first.
3. Complete the rider/checklist for your role.
4. Work from `Daily Command` and your role tabs.
5. After every interaction, update status and next follow-up.
6. Before shift close, ensure no active lead is left without next action.

## 4) Recommended April 2026 PIN plan

Because the live UI already supports bulk monthly PIN resets by group, the cleanest rollout for April 2026 is:

- Admin / leadership PIN: `482601`
- Staff PIN: `731604`

Important:
- These are recommended April 2026 rollout PINs.
- They are not applied automatically by this document.
- Admin can apply them from `Team -> Set UAT PIN (Admins)` and `Set UAT PIN (Staff)`.

## 5) Live CRM user roster pulled from Turso on March 21, 2026

### 5.1 Production-facing users

| User | Name | Role | April 2026 PIN |
|------|------|------|----------------|
| `ceo.crmops@santaan.in` | CEO CRM Ops | `admin` | `482601` |
| `raghab.panda@santaan.in` | Raghab Panda | `admin` | `482601` |
| `satish.rath@santaan.in` | Satish Rath | `admin` | `482601` |
| `satish@skids.health` | Satish Skids | `admin` | `482601` |
| `satish.rath@gmail.com` | Satish Rath (Gmail) | `admin` | `482601` |
| `field.bbsr@santaan.in` | Field Exec Bhubaneswar | `field_exec` | `731604` |
| `field.bam@santaan.in` | Field Exec Berhampur | `field_exec` | `731604` |
| `field.blr@santaan.in` | Field Exec Bangalore | `field_exec` | `731604` |
| `ivr.lead@santaan.in` | IVR Telecalling Lead | `ivr_manager` | `731604` |
| `tele.bbsr@santaan.in` | Telecaller 1 | `telecaller` | `731604` |
| `tele.bam@santaan.in` | Telecaller 2 | `telecaller` | `731604` |
| `tele.blr@santaan.in` | Telecaller 3 | `telecaller` | `731604` |
| `counselor.bbsr@santaan.in` | Counselor Bhubaneswar | `counselor` | `731604` |
| `counselor.bam@santaan.in` | Counselor Berhampur | `counselor` | `731604` |
| `counselor.blr@santaan.in` | Counselor Bangalore | `counselor` | `731604` |
| `santaandigital.ops@santaan.in` | Santaan Digital Ops | `agency_ops` | `731604` |

### 5.2 Test / UAT accounts to exclude from user WhatsApp rollout unless needed

| User | Name | Role | April 2026 PIN |
|------|------|------|----------------|
| `demo@santaan.com` | Demo Admin | `admin` | `482601` |
| `agency.e2e@santaan.in` | Agency E2E | `agency_ops` | `731604` |
| `field.e2e@santaan.in` | Field E2E | `field_exec` | `731604` |
| `ivr.e2e@santaan.in` | IVR E2E | `ivr_manager` | `731604` |
| `counselor.e2e@santaan.in` | Counselor E2E | `counselor` | `731604` |

## 6) Admin WhatsApp note draft

Team, Santaan CRM is now live as the daily working system for leads, follow-ups, workboard updates, and role-wise execution.

From April 1, 2026, please start every shift by opening:
`https://www.santaan.in/login`

Login format:
- Username/email: your assigned CRM ID
- PIN: shared by admin for your group

Daily rule:
- Open `Today` first
- Work from `Daily Command` and your role tabs
- Update every lead interaction in CRM immediately
- Always set next follow-up before shift close

Golden rule:
`CRM me update nahi hua = kaam done nahi maana jayega.`

If login fails or access looks wrong, contact CRM Ops Admin the same day for PIN reset or role fix.
