export function generateSamplePdfBytes(): Uint8Array {
  const text = `SYNTHETIC DEMO DATA
DOCUMENT TITLE: National Merit & Technical Higher Education Scholarship Notice 2026
ISSUING ORGANIZATION: National Higher Education Board & Department of Student Welfare
PUBLICATION DATE: 01 October 2026

EXECUTIVE SUMMARY:
This notice details the eligibility criteria, financial awards, required documents, and submission deadlines for the 2026-2027 Academic Year Merit Scholarship. Applicants must satisfy academic threshold requirements and submit verified income documents before the strict deadline.

KEY ORGANIZATIONS:
- National Higher Education Board (Grantor & Policy Admin, Page 1)
- Ministry of Education (Sponsoring Body, Page 1)

KEY PEOPLE:
- Dr. Rajesh Kumar (Scholarship Selection Committee Chair, Page 1)
- Prof. Ananya Roy (Verification Officer, Page 1)

IMPORTANT DATES:
- Application Opening Date: 01 October 2026 (Page 1)
- Verification Deadline: 01 December 2026 (Page 2)

STRICT DEADLINES:
- Application Hard Copy & Online Submission Deadline: 15 November 2026 (Urgent, Page 1, Section: Timelines)

FINANCIAL AMOUNTS:
- Annual Scholarship Stipend: $5,000 per student per academic year (Page 1, Section: Benefits)
- One-time Laptop Grant: $800 (Page 1, Section: Benefits)

REQUIREMENTS & CHECKLIST:
- Income Certificate issued by Revenue Authority (Status: Missing, Page 1)
- Certified Official Academic Transcript (Status: Complete, Page 1)
- Valid Government ID (Aadhaar or Passport) (Status: Complete, Page 1)

ACTIONS TO TAKE:
1. Request certified Income Certificate from local revenue authority prior to 15 November 2026.
2. Submit completed application package via portal and dispatch hard copy.

IMPORTANT TERMS & CLAUSES:
- Renewal Clause: Recipients must maintain minimum 3.5 GPA and 80% attendance to retain funding.
- Non-Duplication Policy: Students receiving other federal grants are ineligible.

KEY ENTITIES:
- National Student Portal (Portal System, Page 1)
- New Delhi Administrative Hub (Location, Page 1)

IDENTIFIED RISKS:
- High Severity Risk: Late submissions post 15 November 2026 are disqualified without right of appeal.
- Medium Severity Risk: Providing inaccurate income details will result in permanent blacklisting and legal recovery.`;

  return Buffer.from(text, 'utf-8');
}
