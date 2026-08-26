export type Destination = "United Kingdom" | "Canada" | "United States" | "Australia" | "Germany";

export const destinations: Destination[] = [
  "United Kingdom",
  "Canada",
  "United States",
  "Australia",
  "Germany",
];

export type RequirementItem = {
  label: string;
  note?: string;
  optional?: boolean;
};

type CountryPack = {
  admission: RequirementItem[];
  visa: RequirementItem[];
  visaName: string;
};

export const countryChecklists: Record<Destination, CountryPack> = {
  "United Kingdom": {
    visaName: "UK Student Visa (Route)",
    admission: [
      { label: "Academic qualifications / transcripts" },
      {
        label: "English language proof",
        note: "IELTS/PTE or provider-accepted equivalent where required",
      },
      { label: "Personal statement", note: "Required by most providers" },
      { label: "Academic or professional reference" },
      { label: "Passport copy" },
      { label: "CV / work experience letter", optional: true },
      { label: "University or course-specific documents", note: "Varies by provider and course" },
    ],
    visa: [
      { label: "Valid passport / travel document" },
      { label: "CAS (Confirmation of Acceptance for Studies)" },
      { label: "Proof of sufficient funds", note: "Where maintenance requirement applies" },
      { label: "ATAS certificate", note: "Where applicable to the course", optional: true },
      {
        label: "Parental / guardian consent & relationship evidence",
        note: "Applicants under 18",
        optional: true,
      },
      { label: "TB test results", note: "Where required for the country of residence" },
      { label: "Financial sponsor consent letter", optional: true },
      { label: "Additional documents per applicant circumstances", optional: true },
    ],
  },
  Canada: {
    visaName: "Canada Study Permit",
    admission: [
      { label: "Academic transcripts / educational records" },
      { label: "English language proficiency", note: "Where required by the program" },
      { label: "Program-specific documents", note: "Portfolio, essays or prerequisites" },
      { label: "Passport copy" },
      { label: "Certified translations", note: "Where documents are not in English/French" },
      { label: "Letters of recommendation", optional: true },
      { label: "Other supporting documents required by the institution", optional: true },
    ],
    visa: [
      { label: "Valid passport / travel document" },
      { label: "Letter of Acceptance from the institution" },
      { label: "Provincial / Territorial Attestation Letter (PAL/TAL)", note: "Where required" },
      { label: "CAQ", note: "Quebec applicants only", optional: true },
      { label: "Proof of identity" },
      { label: "Passport-size photographs", note: "Where required" },
      { label: "Proof of financial support" },
      { label: "Completed application forms" },
      { label: "Family information form", optional: true },
      { label: "Local visa office specific documents", note: "Varies by visa office" },
      { label: "Biometrics", note: "Where applicable" },
    ],
  },
  "United States": {
    visaName: "USA F-1 Student Visa",
    admission: [
      { label: "Academic transcripts" },
      { label: "Diplomas / certificates", note: "Where applicable" },
      { label: "English language proficiency", note: "TOEFL/IELTS/Duolingo where required" },
      {
        label: "Standardized test scores",
        note: "GRE/GMAT/SAT where required by the program",
        optional: true,
      },
      { label: "Statement of purpose" },
      { label: "Letters of recommendation" },
      { label: "University-specific supporting documents", optional: true },
    ],
    visa: [
      { label: "Valid passport" },
      { label: "DS-160 confirmation page" },
      { label: "Visa application fee receipt", note: "Where required" },
      { label: "Photograph as per specification" },
      { label: "Form I-20" },
      { label: "SEVIS fee registration receipt" },
      {
        label: "Academic preparation documents",
        note: "Transcripts, diplomas, degrees, certificates",
      },
      { label: "Standardized test scores required by the school", optional: true },
      { label: "Evidence of funds for education, living and travel costs" },
      { label: "Evidence of intent to depart the US after the course" },
      { label: "Additional documents requested by the Embassy/Consulate", optional: true },
    ],
  },
  Australia: {
    visaName: "Australia Student Visa (Subclass 500)",
    admission: [
      { label: "Academic transcripts" },
      { label: "Previous qualification / results" },
      { label: "English language test results", note: "Where applicable" },
      { label: "Passport / identity document" },
      { label: "Personal statement", optional: true },
      { label: "Portfolio or CV", note: "Where required by the course", optional: true },
      { label: "Course-specific selection documents", optional: true },
    ],
    visa: [
      { label: "Valid passport / identity documents" },
      { label: "Confirmation of Enrolment (CoE)" },
      { label: "English language evidence", note: "Where required" },
      { label: "Financial capacity evidence", note: "Where required" },
      { label: "Genuine Student (GS) requirement evidence" },
      { label: "Health examination / OSHC evidence", note: "Where required" },
      {
        label: "Documents from the Home Affairs Document Checklist Tool",
        note: "Varies by passport country and provider",
      },
    ],
  },
  Germany: {
    visaName: "Germany National Student Visa",
    admission: [
      { label: "Academic certificates and transcripts" },
      { label: "University entrance qualification", note: "HZB / Studienkolleg where applicable" },
      { label: "English or German language certificate", note: "Level as per the course" },
      { label: "Certified translations", note: "Where required" },
      { label: "APS certificate", note: "Where applicable", optional: true },
      { label: "Motivation letter / CV" },
      { label: "Other university or course-specific documents", optional: true },
    ],
    visa: [
      { label: "Valid passport / identity documents" },
      { label: "University admission / acceptance letter" },
      { label: "Academic certificates and transcripts" },
      { label: "Language proficiency evidence", note: "As per course language" },
      { label: "Proof of sufficient financial resources" },
      { label: "Blocked account or accepted financial proof" },
      { label: "Health insurance" },
      { label: "CV" },
      { label: "Motivation letter", note: "Where required", optional: true },
      { label: "Documents required by the relevant German mission", optional: true },
    ],
  },
};
