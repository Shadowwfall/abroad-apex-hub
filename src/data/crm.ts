export type Branch = {
  id: string;
  name: string;
  city: string;
  students: number;
  revenue: number;
  staff: number;
  applications: number;
  status: "active" | "archived";
};

export const branches: Branch[] = [
  { id: "br-hyd", name: "Banjara Hills HQ", city: "Hyderabad", students: 412, revenue: 8420000, staff: 18, applications: 176, status: "active" },
  { id: "br-kkd", name: "Kukatpally", city: "Hyderabad", students: 268, revenue: 5130000, staff: 11, applications: 121, status: "active" },
  { id: "br-ame", name: "Ameerpet", city: "Hyderabad", students: 331, revenue: 6210000, staff: 14, applications: 149, status: "active" },
  { id: "br-gac", name: "Gachibowli", city: "Hyderabad", students: 187, revenue: 3480000, staff: 9, applications: 88, status: "active" },
  { id: "br-war", name: "Warangal", city: "Warangal", students: 96, revenue: 1290000, staff: 5, applications: 41, status: "archived" },
];

export type StudentStatus =
  | "Lead"
  | "Counselling"
  | "Applied"
  | "Offer Received"
  | "Visa Filed"
  | "Visa Approved"
  | "Enrolled";

export type Student = {
  id: string;
  name: string;
  branch: string;
  country: string;
  intake: string;
  status: StudentStatus;
  counsellor: string;
  outstanding: number;
  initials: string;
};

export const students: Student[] = [
  { id: "APX-1041", name: "Sneha Reddy", branch: "Banjara Hills HQ", country: "United Kingdom", intake: "Sep 2026", status: "Visa Filed", counsellor: "Ravi Teja", outstanding: 45000, initials: "SR" },
  { id: "APX-1042", name: "Arjun Verma", branch: "Ameerpet", country: "Canada", intake: "Jan 2027", status: "Offer Received", counsellor: "Divya Nair", outstanding: 0, initials: "AV" },
  { id: "APX-1043", name: "Fatima Begum", branch: "Kukatpally", country: "Germany", intake: "Sep 2026", status: "Applied", counsellor: "Imran Khan", outstanding: 28500, initials: "FB" },
  { id: "APX-1044", name: "Karthik Rao", branch: "Gachibowli", country: "United States", intake: "Fall 2026", status: "Counselling", counsellor: "Priya Menon", outstanding: 15000, initials: "KR" },
  { id: "APX-1045", name: "Meghana Iyer", branch: "Banjara Hills HQ", country: "Australia", intake: "Feb 2027", status: "Visa Approved", counsellor: "Ravi Teja", outstanding: 0, initials: "MI" },
  { id: "APX-1046", name: "Vikram Chawla", branch: "Ameerpet", country: "Ireland", intake: "Sep 2026", status: "Enrolled", counsellor: "Divya Nair", outstanding: 0, initials: "VC" },
  { id: "APX-1047", name: "Anjali Sharma", branch: "Kukatpally", country: "New Zealand", intake: "Jan 2027", status: "Lead", counsellor: "Imran Khan", outstanding: 62000, initials: "AS" },
  { id: "APX-1048", name: "Rahul Yadav", branch: "Gachibowli", country: "United States", intake: "Spring 2027", status: "Applied", counsellor: "Priya Menon", outstanding: 9500, initials: "RY" },
  { id: "APX-1049", name: "Nikitha Sai", branch: "Banjara Hills HQ", country: "Canada", intake: "Sep 2026", status: "Visa Filed", counsellor: "Ravi Teja", outstanding: 34000, initials: "NS" },
  { id: "APX-1050", name: "Zoya Ahmed", branch: "Ameerpet", country: "United Kingdom", intake: "Jan 2027", status: "Counselling", counsellor: "Divya Nair", outstanding: 12000, initials: "ZA" },
];

export type Lead = {
  id: string;
  name: string;
  country: string;
  program: string;
  source: string;
  date: string;
  priority: "High" | "Medium" | "Low";
};

export const leads: Lead[] = [
  { id: "LD-2201", name: "Harsha Vardhan", country: "Canada", program: "MS Data Science", source: "Website", date: "Today, 09:12", priority: "High" },
  { id: "LD-2202", name: "Sana Fatima", country: "United Kingdom", program: "MSc Finance", source: "Instagram", date: "Today, 08:40", priority: "Medium" },
  { id: "LD-2203", name: "Pranay Kumar", country: "Germany", program: "MS Mechatronics", source: "Referral", date: "Yesterday", priority: "High" },
  { id: "LD-2204", name: "Lavanya Rao", country: "Australia", program: "MBA", source: "Walk-in", date: "Yesterday", priority: "Low" },
  { id: "LD-2205", name: "Imran Sheikh", country: "United States", program: "MS CS", source: "Google Ads", date: "2 days ago", priority: "Medium" },
  { id: "LD-2206", name: "Divya Prasad", country: "Ireland", program: "MSc Pharma", source: "Website", date: "2 days ago", priority: "Medium" },
];

export type Staff = {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Branch Admin" | "Counsellor" | "Documentation Officer" | "Finance" | "Visa Team";
  branches: string[];
  active: boolean;
  initials: string;
};

export const staff: Staff[] = [
  { id: "ST-01", name: "Anil Kumar", email: "anil@apexabroad.in", role: "Super Admin", branches: ["All branches"], active: true, initials: "AK" },
  { id: "ST-02", name: "Ravi Teja", email: "ravi@apexabroad.in", role: "Counsellor", branches: ["Banjara Hills HQ"], active: true, initials: "RT" },
  { id: "ST-03", name: "Divya Nair", email: "divya@apexabroad.in", role: "Branch Admin", branches: ["Ameerpet", "Kukatpally"], active: true, initials: "DN" },
  { id: "ST-04", name: "Imran Khan", email: "imran@apexabroad.in", role: "Counsellor", branches: ["Kukatpally"], active: true, initials: "IK" },
  { id: "ST-05", name: "Priya Menon", email: "priya@apexabroad.in", role: "Documentation Officer", branches: ["Gachibowli"], active: true, initials: "PM" },
  { id: "ST-06", name: "Suresh Babu", email: "suresh@apexabroad.in", role: "Finance", branches: ["Banjara Hills HQ", "Gachibowli"], active: false, initials: "SB" },
  { id: "ST-07", name: "Neha Gupta", email: "neha@apexabroad.in", role: "Visa Team", branches: ["Ameerpet"], active: true, initials: "NG" },
];

export const monthlyAdmissions = [
  { month: "Jan", admissions: 42, applications: 68 },
  { month: "Feb", admissions: 51, applications: 79 },
  { month: "Mar", admissions: 63, applications: 95 },
  { month: "Apr", admissions: 58, applications: 88 },
  { month: "May", admissions: 74, applications: 110 },
  { month: "Jun", admissions: 89, applications: 128 },
  { month: "Jul", admissions: 96, applications: 141 },
];

export const countryDistribution = [
  { country: "Canada", value: 32 },
  { country: "UK", value: 26 },
  { country: "USA", value: 18 },
  { country: "Germany", value: 12 },
  { country: "Australia", value: 8 },
  { country: "Others", value: 4 },
];

export const revenueTrend = [
  { month: "Jan", revenue: 1820000, collected: 1520000 },
  { month: "Feb", revenue: 2110000, collected: 1810000 },
  { month: "Mar", revenue: 2480000, collected: 2260000 },
  { month: "Apr", revenue: 2290000, collected: 1990000 },
  { month: "May", revenue: 2980000, collected: 2610000 },
  { month: "Jun", revenue: 3420000, collected: 3080000 },
  { month: "Jul", revenue: 3810000, collected: 3290000 },
];

export type Activity = {
  id: string;
  user: string;
  initials: string;
  action: string;
  target: string;
  branch: string;
  time: string;
  tone: "success" | "info" | "warning" | "default";
};

export const activities: Activity[] = [
  { id: "a1", user: "Ravi Teja", initials: "RT", action: "Visa approved for", target: "Meghana Iyer", branch: "Banjara Hills HQ", time: "12 min ago", tone: "success" },
  { id: "a2", user: "Neha Gupta", initials: "NG", action: "Uploaded IELTS scorecard for", target: "Zoya Ahmed", branch: "Ameerpet", time: "48 min ago", tone: "info" },
  { id: "a3", user: "Suresh Babu", initials: "SB", action: "Recorded payment ₹85,000 from", target: "Arjun Verma", branch: "Ameerpet", time: "2 hours ago", tone: "success" },
  { id: "a4", user: "Priya Menon", initials: "PM", action: "Marked passport copy pending for", target: "Karthik Rao", branch: "Gachibowli", time: "3 hours ago", tone: "warning" },
  { id: "a5", user: "Divya Nair", initials: "DN", action: "Converted lead to student", target: "Vikram Chawla", branch: "Ameerpet", time: "Yesterday", tone: "info" },
  { id: "a6", user: "Imran Khan", initials: "IK", action: "Processed refund ₹22,000 for", target: "Anjali Sharma", branch: "Kukatpally", time: "Yesterday", tone: "default" },
];

export type Deadline = {
  id: string;
  title: string;
  student: string;
  due: string;
  bucket: "Overdue" | "Today" | "This week" | "Upcoming";
};

export const deadlines: Deadline[] = [
  { id: "d1", title: "UK CAS deposit", student: "Sneha Reddy", due: "2 days ago", bucket: "Overdue" },
  { id: "d2", title: "Financial documents upload", student: "Rahul Yadav", due: "Today, 6:00 PM", bucket: "Today" },
  { id: "d3", title: "Biometrics appointment", student: "Nikitha Sai", due: "Thu, 10:30 AM", bucket: "This week" },
  { id: "d4", title: "University application deadline", student: "Fatima Begum", due: "Fri", bucket: "This week" },
  { id: "d5", title: "Medical test", student: "Meghana Iyer", due: "Next Mon", bucket: "Upcoming" },
];

export type Payment = {
  id: string;
  student: string;
  type: string;
  amount: number;
  currency: string;
  mode: string;
  date: string;
  status: "Paid" | "Pending" | "Refunded" | "Partial";
};

export const payments: Payment[] = [
  { id: "PY-9001", student: "Arjun Verma", type: "Service Charges", amount: 85000, currency: "INR", mode: "UPI", date: "31 Jul 2026", status: "Paid" },
  { id: "PY-9002", student: "Sneha Reddy", type: "Visa Fee", amount: 45000, currency: "INR", mode: "Card", date: "30 Jul 2026", status: "Pending" },
  { id: "PY-9003", student: "Fatima Begum", type: "University Deposit", amount: 2500, currency: "EUR", mode: "Wire", date: "29 Jul 2026", status: "Partial" },
  { id: "PY-9004", student: "Anjali Sharma", type: "Admission Fee", amount: 22000, currency: "INR", mode: "Cash", date: "28 Jul 2026", status: "Refunded" },
  { id: "PY-9005", student: "Rahul Yadav", type: "Service Charges", amount: 60000, currency: "INR", mode: "NEFT", date: "26 Jul 2026", status: "Paid" },
  { id: "PY-9006", student: "Nikitha Sai", type: "Embassy Fee", amount: 18500, currency: "INR", mode: "UPI", date: "24 Jul 2026", status: "Paid" },
];

export type DocItem = {
  id: string;
  name: string;
  student: string;
  checklist: "Admission" | "Visa";
  status: "Pending" | "Received" | "Rejected" | "Waived";
  deadline: string;
  officer: string;
};

export const documents: DocItem[] = [
  { id: "DC-01", name: "Passport (first & last page)", student: "Sneha Reddy", checklist: "Visa", status: "Received", deadline: "12 Aug 2026", officer: "Neha Gupta" },
  { id: "DC-02", name: "Statement of Purpose", student: "Karthik Rao", checklist: "Admission", status: "Pending", deadline: "05 Aug 2026", officer: "Priya Menon" },
  { id: "DC-03", name: "Financial affidavit", student: "Rahul Yadav", checklist: "Visa", status: "Rejected", deadline: "01 Aug 2026", officer: "Priya Menon" },
  { id: "DC-04", name: "IELTS scorecard", student: "Zoya Ahmed", checklist: "Admission", status: "Received", deadline: "18 Aug 2026", officer: "Neha Gupta" },
  { id: "DC-05", name: "Work experience letter", student: "Vikram Chawla", checklist: "Admission", status: "Waived", deadline: "—", officer: "Divya Nair" },
  { id: "DC-06", name: "Medical certificate", student: "Meghana Iyer", checklist: "Visa", status: "Pending", deadline: "20 Aug 2026", officer: "Neha Gupta" },
];

export const tasks = [
  { id: "t1", label: "Call Harsha Vardhan about Canada SDS", done: false, tag: "Lead" },
  { id: "t2", label: "Review SOP draft for Karthik Rao", done: false, tag: "Admission" },
  { id: "t3", label: "Submit UK visa file for Sneha Reddy", done: true, tag: "Visa" },
  { id: "t4", label: "Follow up pending deposit — Fatima Begum", done: false, tag: "Finance" },
];

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const money = (n: number, currency: string) =>
  new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
