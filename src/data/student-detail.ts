import type { Destination } from "./checklists";

export type DocStatus = "Pending" | "Received" | "Approved" | "Rejected" | "Waived";

export type StudentDestination = {
  id: string;
  country: Destination;
  university: string;
  course: string;
  intake: string;
  applicationStatus: string;
  visaStatus: string;
  /** Extra requirements specific to this university / course. */
  extraRequirements: string[];
  /** Status overrides keyed by requirement label. */
  admissionStatus: Record<string, DocStatus>;
  visaDocStatus: Record<string, DocStatus>;
};

export type StudentPaymentRow = {
  id: string;
  type: string;
  amount: number;
  paid: number;
  currency: string;
  mode: string;
  date: string;
  status: "Paid" | "Pending" | "Partial" | "Refunded";
};

export type UploadedDoc = {
  name: string;
  uploaded: string;
  status: DocStatus;
  reviewer: string;
  remark?: string;
};

export type FormEntry = {
  name: string;
  progress: number;
  status: "Not started" | "In progress" | "Submitted" | "Verified";
  owner: string;
};

export type StudentProfile = {
  phone: string;
  email: string;
  dob: string;
  gender: string;
  passport: string;
  address: string;
  highestQualification: string;
  percentage: string;
  englishTest: string;
  workExperience: string;
  destinations: StudentDestination[];
  uploads: UploadedDoc[];
  payments: StudentPaymentRow[];
  forms: FormEntry[];
};

const emptyStatus: Record<string, DocStatus> = {};

export const studentProfiles: Record<string, StudentProfile> = {
  "APX-1041": {
    phone: "+91 98490 11241",
    email: "sneha.reddy@gmail.com",
    dob: "14 Mar 2003",
    gender: "Female",
    passport: "V1234567 · exp. 2032",
    address: "Road No. 12, Banjara Hills, Hyderabad",
    highestQualification: "B.Tech CSE, JNTUH (2025)",
    percentage: "82%",
    englishTest: "IELTS 7.0",
    workExperience: "6 months internship — Deloitte",
    destinations: [
      {
        id: "d-uk",
        country: "United Kingdom",
        university: "University of Manchester",
        course: "MSc Data Science",
        intake: "Sep 2026",
        applicationStatus: "Offer Received",
        visaStatus: "Visa Filed",
        extraRequirements: ["Coding portfolio (course-specific)", "Maths module transcript"],
        admissionStatus: {
          "Academic qualifications / transcripts": "Approved",
          "English language proof": "Approved",
          "Personal statement": "Received",
          "Academic or professional reference": "Approved",
          "Passport copy": "Approved",
        },
        visaDocStatus: {
          "Valid passport / travel document": "Approved",
          "CAS (Confirmation of Acceptance for Studies)": "Received",
          "Proof of sufficient funds": "Pending",
          "TB test results": "Approved",
        },
      },
      {
        id: "d-ca",
        country: "Canada",
        university: "University of Waterloo",
        course: "MEng Data Analytics",
        intake: "Jan 2027",
        applicationStatus: "Applied",
        visaStatus: "Not started",
        extraRequirements: ["Two academic references (program-specific)"],
        admissionStatus: {
          "Academic transcripts / educational records": "Approved",
          "English language proficiency": "Received",
          "Passport copy": "Approved",
        },
        visaDocStatus: {},
      },
    ],
    uploads: [
      { name: "Passport (first & last page)", uploaded: "02 Jul 2026", status: "Approved", reviewer: "Neha Gupta" },
      { name: "IELTS scorecard", uploaded: "05 Jul 2026", status: "Approved", reviewer: "Neha Gupta" },
      { name: "Degree transcripts", uploaded: "08 Jul 2026", status: "Approved", reviewer: "Priya Menon" },
      { name: "Personal statement", uploaded: "18 Jul 2026", status: "Received", reviewer: "Ravi Teja", remark: "Under review by counsellor" },
      { name: "Bank statement (funds)", uploaded: "—", status: "Pending", reviewer: "Neha Gupta", remark: "Awaiting 28-day statement" },
      { name: "Experience letter", uploaded: "20 Jul 2026", status: "Rejected", reviewer: "Priya Menon", remark: "Not on company letterhead" },
    ],
    payments: [
      { id: "PY-9002", type: "Visa Fee", amount: 45000, paid: 0, currency: "INR", mode: "Card", date: "30 Jul 2026", status: "Pending" },
      { id: "PY-8871", type: "Service Charges", amount: 75000, paid: 75000, currency: "INR", mode: "UPI", date: "12 Jun 2026", status: "Paid" },
      { id: "PY-8822", type: "Registration", amount: 15000, paid: 15000, currency: "INR", mode: "Cash", date: "02 May 2026", status: "Paid" },
    ],
    forms: [
      { name: "UK visa application (online)", progress: 80, status: "In progress", owner: "Neha Gupta" },
      { name: "University application form — Manchester", progress: 100, status: "Submitted", owner: "Ravi Teja" },
      { name: "APEX student registration form", progress: 100, status: "Verified", owner: "Ravi Teja" },
    ],
  },
};

const defaultProfile = (name: string): StudentProfile => ({
  phone: "+91 90000 00000",
  email: `${name.split(" ")[0]?.toLowerCase()}@example.com`,
  dob: "—",
  gender: "—",
  passport: "Pending submission",
  address: "Hyderabad, Telangana",
  highestQualification: "Bachelor's degree",
  percentage: "—",
  englishTest: "Not submitted",
  workExperience: "—",
  destinations: [],
  uploads: [
    { name: "Passport (first & last page)", uploaded: "—", status: "Pending", reviewer: "Documentation team" },
    { name: "Academic transcripts", uploaded: "—", status: "Pending", reviewer: "Documentation team" },
  ],
  payments: [],
  forms: [{ name: "APEX student registration form", progress: 60, status: "In progress", owner: "Counsellor" }],
});

export function getStudentProfile(id: string, name: string, country: string, intake: string): StudentProfile {
  const existing = studentProfiles[id];
  if (existing) return existing;

  const base = defaultProfile(name);
  const mapped = mapCountry(country);
  if (mapped) {
    base.destinations = [
      {
        id: `${id}-primary`,
        country: mapped,
        university: universityFor(mapped),
        course: "Master's program",
        intake,
        applicationStatus: "In progress",
        visaStatus: "Not started",
        extraRequirements: [],
        admissionStatus: emptyStatus,
        visaDocStatus: emptyStatus,
      },
    ];
  }
  return base;
}

function mapCountry(country: string): Destination | null {
  switch (country) {
    case "United Kingdom":
    case "Canada":
    case "United States":
    case "Australia":
    case "Germany":
      return country;
    default:
      return null;
  }
}

function universityFor(c: Destination) {
  const map: Record<Destination, string> = {
    "United Kingdom": "University of Leeds",
    Canada: "University of Windsor",
    "United States": "Arizona State University",
    Australia: "Deakin University",
    Germany: "TU Berlin",
  };
  return map[c];
}
