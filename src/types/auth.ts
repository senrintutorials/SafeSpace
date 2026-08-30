export type UserRole =
  | 'student'
  | 'parent'
  | 'school_admin'
  | 'guidance_counselor'
  | 'department_head'
  | 'teacher_adviser'
  | 'school_guard'
  | 'non_teaching_staff'
  | 'sdo_admin'
  | 'pnp_authority'
  | 'brgy_official'
  | 'city_official';

export interface RoleConfig {
  id: UserRole;
  label: string;
  shortLabel: string;
  category: 'Student & Family' | 'School Administration & Staff' | 'Division & National Authorities';
  description: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  requiredFields: {
    key: string;
    label: string;
    placeholder: string;
    type?: string;
  }[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  subRole?: string;
  organization: string;
  contactNumber: string;
  roleSpecificData: Record<string, string>;
  createdAt: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  student: {
    id: 'student',
    label: 'Student',
    shortLabel: 'Student',
    category: 'Student & Family',
    description: 'Access personal mental wellness journal, SaFie AI counselor, voice/video reflections, and instant crisis help.',
    iconName: 'GraduationCap',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-300',
    border: 'border-blue-500/30',
    requiredFields: [
      { key: 'lrn', label: 'Learner Reference Number (LRN / Student ID)', placeholder: 'e.g. 109283748291' },
      { key: 'gradeSection', label: 'Grade Level & Section', placeholder: 'e.g. Grade 11 - STEM A' },
      { key: 'parentContact', label: 'Parent/Guardian Emergency Contact', placeholder: 'e.g. 0917-123-4567' }
    ]
  },
  parent: {
    id: 'parent',
    label: 'Parent / Guardian',
    shortLabel: 'Parent',
    category: 'Student & Family',
    description: 'Monitor child opt-in wellness updates, receive emergency alerts, and connect with school guidance counselors.',
    iconName: 'Users',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    border: 'border-emerald-500/30',
    requiredFields: [
      { key: 'childLrn', label: "Child's LRN / Student Name", placeholder: 'e.g. Juan Dela Cruz (LRN: 109283748291)' },
      { key: 'relationship', label: 'Relationship to Student', placeholder: 'e.g. Mother / Father / Legal Guardian' },
      { key: 'address', label: 'Residential Address', placeholder: 'e.g. Brgy. Central, Quezon City' }
    ]
  },
  school_admin: {
    id: 'school_admin',
    label: 'School Administrator (School Head & Asst School Head)',
    shortLabel: 'School Admin',
    category: 'School Administration & Staff',
    description: 'School-wide mental wellness oversight, safety desk incident authority, and faculty welfare management.',
    iconName: 'Building2',
    badgeBg: 'bg-indigo-500/20',
    badgeText: 'text-indigo-300',
    border: 'border-indigo-500/30',
    requiredFields: [
      { key: 'designation', label: 'Admin Designation', placeholder: 'e.g. School Head (Principal) / Assistant School Head' },
      { key: 'itemNo', label: 'DepEd Item No. / Admin ID', placeholder: 'e.g. SH-2024-9981' },
      { key: 'schoolId', label: 'School ID Number', placeholder: 'e.g. School ID: 301294' }
    ]
  },
  guidance_counselor: {
    id: 'guidance_counselor',
    label: 'SafeSpace Counselor',
    shortLabel: 'Counselor',
    category: 'School Administration & Staff',
    description: 'Triage high-priority crisis alerts, schedule de-escalation check-ins, and manage student counseling cases.',
    iconName: 'HeartHandshake',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    border: 'border-purple-500/30',
    requiredFields: [
      { key: 'prcLicense', label: 'PRC Guidance Counselor License No.', placeholder: 'e.g. PRC Lic #0098123' },
      { key: 'assignedBatches', label: 'Assigned Grade Levels / Batches', placeholder: 'e.g. Grade 7 to Grade 10' }
    ]
  },
  department_head: {
    id: 'department_head',
    label: 'School Department Head',
    shortLabel: 'Dept Head',
    category: 'School Administration & Staff',
    description: 'Academic unit wellness overview, teacher support monitoring, and department incident triage.',
    iconName: 'Briefcase',
    badgeBg: 'bg-sky-500/20',
    badgeText: 'text-sky-300',
    border: 'border-sky-500/30',
    requiredFields: [
      { key: 'departmentName', label: 'Department / Learning Area', placeholder: 'e.g. Science Dept / Senior High School' },
      { key: 'facultyId', label: 'Faculty Employee ID', placeholder: 'e.g. EMP-2023-8812' }
    ]
  },
  teacher_adviser: {
    id: 'teacher_adviser',
    label: 'School Teacher / Class Adviser',
    shortLabel: 'Teacher / Adviser',
    category: 'School Administration & Staff',
    description: 'Monitors advisory class behavioral indicators, classroom bullying incidents, student welfare check-ins, and parent notifications.',
    iconName: 'BookOpen',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    border: 'border-emerald-500/30',
    requiredFields: [
      { key: 'advisoryClass', label: 'Advisory Class / Grade & Section', placeholder: 'e.g. Grade 11 - STEM A' },
      { key: 'subjectTaught', label: 'Subject / Learning Area', placeholder: 'e.g. Pre-Calculus & Physics' },
      { key: 'facultyId', label: 'Teacher Employee ID', placeholder: 'e.g. TCH-2022-3341' }
    ]
  },
  school_guard: {
    id: 'school_guard',
    label: 'School Guard / Campus Security',
    shortLabel: 'School Guard',
    category: 'School Administration & Staff',
    description: 'Receive real-time campus safety dispatches, monitor gate incidents, and initiate physical security protocols.',
    iconName: 'ShieldCheck',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    border: 'border-amber-500/30',
    requiredFields: [
      { key: 'securityAgency', label: 'Security Agency / Campus Security Unit', placeholder: 'e.g. DepEd Security Detachment / Sentinel Agency' },
      { key: 'guardDutyPost', label: 'Assigned Gate / Security Post', placeholder: 'e.g. Main Gate 1 / Senior High Building Post' },
      { key: 'licenseNo', label: 'SOSIA Security License / Duty ID', placeholder: 'e.g. SEC-88912-2024' }
    ]
  },
  non_teaching_staff: {
    id: 'non_teaching_staff',
    label: 'School Non-Teaching Staff',
    shortLabel: 'Staff',
    category: 'School Administration & Staff',
    description: 'School clinic, canteen, IT, maintenance, and administrative staff reporting & clinic referral system.',
    iconName: 'UserCheck',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-300',
    border: 'border-cyan-500/30',
    requiredFields: [
      { key: 'staffUnit', label: 'Office / Unit Designation', placeholder: 'e.g. School Clinic Nurse / Registrar / IT Support' },
      { key: 'employeeId', label: 'Staff Employee ID', placeholder: 'e.g. NTS-2022-4412' }
    ]
  },
  sdo_admin: {
    id: 'sdo_admin',
    label: 'SDO Administrator (Schools Division Office)',
    shortLabel: 'SDO Admin',
    category: 'Division & National Authorities',
    description: 'Division-wide mental health policy oversight, division alerts dashboard, and multi-school incident coordination.',
    iconName: 'Award',
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-300',
    border: 'border-rose-500/30',
    requiredFields: [
      { key: 'sdoName', label: 'Schools Division Office (SDO Name)', placeholder: 'e.g. SDO Manila / SDO Quezon City / SDO Cebu' },
      { key: 'sdoDesignation', label: 'Division Office Title / Designation', placeholder: 'e.g. Division Superintendent / Student Services Head' },
      { key: 'itemNo', label: 'Division Admin Item ID', placeholder: 'e.g. SDO-ADM-9012' }
    ]
  },
  pnp_authority: {
    id: 'pnp_authority',
    label: 'PNP (National Authorities)',
    shortLabel: 'PNP / Police',
    category: 'Division & National Authorities',
    description: 'Rapid crisis dispatch receiving center for severe criminal threats, active violence, or imminent physical danger.',
    iconName: 'ShieldAlert',
    badgeBg: 'bg-red-600/30',
    badgeText: 'text-red-200',
    border: 'border-red-500/50',
    requiredFields: [
      { key: 'pnpBadgeNo', label: 'PNP Badge / ID Number', placeholder: 'e.g. PNP-BADGE-10293' },
      { key: 'precinctStation', label: 'Police Station / Unit (WCPD / Precinct)', placeholder: 'e.g. PS-10 Women & Children Protection Desk (WCPD)' },
      { key: 'rank', label: 'Police Rank', placeholder: 'e.g. Police Executive Master Sergeant / Police Captain' }
    ]
  },
  brgy_official: {
    id: 'brgy_official',
    label: 'Barangay Official (BVAWC & Community Protection)',
    shortLabel: 'Brgy Official',
    category: 'Division & National Authorities',
    description: 'Local barangay youth welfare monitoring, BVAWC (Violence Against Women & Children) desk response, and community child safety.',
    iconName: 'MapPin',
    badgeBg: 'bg-emerald-600/30',
    badgeText: 'text-emerald-200',
    border: 'border-emerald-500/50',
    requiredFields: [
      { key: 'barangayName', label: 'Barangay Name & Jurisdiction', placeholder: 'e.g. Barangay Central, District 4, Quezon City' },
      { key: 'officialTitle', label: 'Barangay Position / Title', placeholder: 'e.g. Barangay Captain / BVAWC Desk Officer / Kagawad' },
      { key: 'brgyId', label: 'Barangay Official ID / Appointment No.', placeholder: 'e.g. BRGY-QC-2024-8812' }
    ]
  },
  city_official: {
    id: 'city_official',
    label: 'City / LGU Official (CSWDO & Youth Office)',
    shortLabel: 'City / LGU Official',
    category: 'Division & National Authorities',
    description: 'City-wide youth welfare oversight, CSWDO (City Social Welfare) intervention, and municipal emergency response desk.',
    iconName: 'Landmark',
    badgeBg: 'bg-blue-600/30',
    badgeText: 'text-blue-200',
    border: 'border-blue-500/50',
    requiredFields: [
      { key: 'cityName', label: 'City / Municipality', placeholder: 'e.g. Quezon City Local Government Unit (LGU)' },
      { key: 'department', label: 'City Department / Bureau', placeholder: "e.g. CSWDO / Mayor's Youth Development Office" },
      { key: 'lguId', label: 'LGU Executive Employee ID', placeholder: 'e.g. LGU-QC-EX-4412' }
    ]
  }
};

export interface RolePermissions {
  canAccessAdminAlerts: boolean;
  hierarchyLevel: number;
  hierarchyLabel: string;
  allowedNavModules: Array<'home' | 'create-avatar' | 'chat' | 'multimodal' | 'audio' | 'video' | 'journaling' | 'sing-along' | 'meditations' | 'share-art' | 'inspiring-media' | 'daily-affirmations' | 'connect-circles' | 'safespace-games' | 'admin-alerts' | 'parent-monitoring' | 'authority-chat' | 'report-incident'>;
  allowedAlertCategories: string[];
  specialAuthorityAction?: string;
  badgeColor: string;
}

export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case 'student':
      return {
        canAccessAdminAlerts: false,
        hierarchyLevel: 1,
        hierarchyLabel: 'Level 1 Student End-User',
        allowedNavModules: ['home', 'create-avatar', 'authority-chat', 'report-incident', 'chat', 'multimodal', 'audio', 'video', 'journaling', 'sing-along', 'meditations', 'share-art', 'inspiring-media', 'daily-affirmations', 'connect-circles', 'safespace-games'],
        allowedAlertCategories: [],
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      };
    case 'parent':
      return {
        canAccessAdminAlerts: false,
        hierarchyLevel: 2,
        hierarchyLabel: 'Level 2 Parent / Guardian',
        allowedNavModules: ['home', 'create-avatar', 'parent-monitoring', 'authority-chat', 'report-incident', 'chat', 'multimodal', 'audio', 'video', 'journaling', 'sing-along', 'meditations', 'share-art', 'inspiring-media', 'daily-affirmations', 'connect-circles', 'safespace-games'],
        allowedAlertCategories: [],
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      };
    case 'school_guard':
      return {
        canAccessAdminAlerts: true,
        hierarchyLevel: 3,
        hierarchyLabel: 'Level 3 Campus Physical Security Clearance',
        allowedNavModules: ['home', 'create-avatar', 'authority-chat', 'report-incident', 'chat', 'multimodal', 'audio', 'video', 'journaling', 'sing-along', 'meditations', 'share-art', 'inspiring-media', 'admin-alerts'],
        allowedAlertCategories: ['CRIMINAL_ACTIVITY', 'ILLEGAL_ACT', 'UNTOWARD_BEHAVIOR'],
        specialAuthorityAction: 'Dispatch Campus Security / Gate Alert',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      };
    case 'non_teaching_staff':
      return {
        canAccessAdminAlerts: true,
        hierarchyLevel: 3,
        hierarchyLabel: 'Level 3 Non-Teaching Facility & Clinic Clearance',
        allowedNavModules: ['home', 'create-avatar', 'authority-chat', 'report-incident', 'chat', 'multimodal', 'audio', 'video', 'journaling', 'sing-along', 'meditations', 'share-art', 'inspiring-media', 'admin-alerts'],
        allowedAlertCategories: ['UNTOWARD_BEHAVIOR', 'ILLEGAL_ACT', 'BULLYING_HARASSMENT'],
        specialAuthorityAction: 'Refer to Clinic & Safety Officer',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
      };
    case 'department_head':
      return {
        canAccessAdminAlerts: true,
        hierarchyLevel: 4,
        hierarchyLabel: 'Level 4 Academic Department Oversight Clearance',
        allowedNavModules: ['home', 'create-avatar', 'authority-chat', 'report-incident', 'chat', 'multimodal', 'audio', 'video', 'journaling', 'sing-along', 'meditations', 'share-art', 'inspiring-media', 'admin-alerts'],
        allowedAlertCategories: ['BULLYING_HARASSMENT', 'ILLEGAL_ACT', 'UNTOWARD_BEHAVIOR'],
        specialAuthorityAction: 'Academic Faculty Review & Advisory Action',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
      };
    case 'teacher_adviser':
      return {
        canAccessAdminAlerts: true,
        hierarchyLevel: 5,
        hierarchyLabel: 'Level 5 Classroom Advisory Clearance',
        allowedNavModules: ['home', 'create-avatar', 'authority-chat', 'report-incident', 'chat', 'multimodal', 'audio', 'video', 'journaling', 'sing-along', 'meditations', 'share-art', 'inspiring-media', 'admin-alerts'],
        allowedAlertCategories: ['BULLYING_HARASSMENT', 'UNTOWARD_BEHAVIOR'],
        specialAuthorityAction: 'Adviser Classroom Log & Parent Consultation Referral',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      };
    case 'guidance_counselor':
      return {
        canAccessAdminAlerts: true,
        hierarchyLevel: 5,
        hierarchyLabel: 'Level 5 Student Mental Welfare & Crisis Clearance',
        allowedNavModules: ['home', 'create-avatar', 'authority-chat', 'report-incident', 'chat', 'multimodal', 'audio', 'video', 'journaling', 'sing-along', 'meditations', 'share-art', 'inspiring-media', 'admin-alerts', 'parent-monitoring'],
        allowedAlertCategories: ['SUICIDE_SELF_HARM', 'BULLYING_HARASSMENT', 'UNTOWARD_BEHAVIOR'],
        specialAuthorityAction: 'Dispatch Hopeline 177 / NCMH Crisis Intervention',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      };
    case 'school_admin':
      return {
        canAccessAdminAlerts: true,
        hierarchyLevel: 6,
        hierarchyLabel: 'Level 6 Executive School Principal Clearance',
        allowedNavModules: ['home', 'create-avatar', 'authority-chat', 'report-incident', 'chat', 'multimodal', 'audio', 'video', 'journaling', 'sing-along', 'meditations', 'share-art', 'inspiring-media', 'admin-alerts', 'parent-monitoring'],
        allowedAlertCategories: ['SUICIDE_SELF_HARM', 'BULLYING_HARASSMENT', 'CRIMINAL_ACTIVITY', 'ILLEGAL_ACT', 'UNTOWARD_BEHAVIOR'],
        specialAuthorityAction: 'Executive Clearance & SDO Endorsement',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
      };
    case 'sdo_admin':
      return {
        canAccessAdminAlerts: true,
        hierarchyLevel: 7,
        hierarchyLabel: 'Level 7 Division Superintendent Regional Clearance',
        allowedNavModules: ['home', 'create-avatar', 'authority-chat', 'report-incident', 'chat', 'multimodal', 'audio', 'video', 'journaling', 'sing-along', 'meditations', 'share-art', 'inspiring-media', 'admin-alerts', 'parent-monitoring'],
        allowedAlertCategories: ['SUICIDE_SELF_HARM', 'BULLYING_HARASSMENT', 'CRIMINAL_ACTIVITY', 'ILLEGAL_ACT', 'UNTOWARD_BEHAVIOR'],
        specialAuthorityAction: 'Division Intervention & Regional Escalation',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      };
    case 'pnp_authority':
      return {
        canAccessAdminAlerts: true,
        hierarchyLevel: 8,
        hierarchyLabel: 'Level 8 National Police & WCPD Rapid Emergency Clearance',
        allowedNavModules: ['home', 'create-avatar', 'authority-chat', 'report-incident', 'chat', 'multimodal', 'audio', 'video', 'journaling', 'sing-along', 'meditations', 'share-art', 'inspiring-media', 'admin-alerts', 'parent-monitoring'],
        allowedAlertCategories: ['CRIMINAL_ACTIVITY', 'ILLEGAL_ACT', 'SUICIDE_SELF_HARM'],
        specialAuthorityAction: 'PNP WCPD Rapid Emergency Dispatch',
        badgeColor: 'bg-red-600/30 text-red-200 border-red-500/50'
      };
    case 'brgy_official':
      return {
        canAccessAdminAlerts: true,
        hierarchyLevel: 9,
        hierarchyLabel: 'Level 9 Local Barangay BVAWC & Community Protection Clearance',
        allowedNavModules: ['home', 'create-avatar', 'authority-chat', 'report-incident', 'chat', 'multimodal', 'audio', 'video', 'journaling', 'sing-along', 'meditations', 'share-art', 'inspiring-media', 'admin-alerts', 'parent-monitoring'],
        allowedAlertCategories: ['CRIMINAL_ACTIVITY', 'ILLEGAL_ACT', 'BULLYING_HARASSMENT', 'SUICIDE_SELF_HARM'],
        specialAuthorityAction: 'Barangay BVAWC Local Patrol & Protection Dispatch',
        badgeColor: 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50'
      };
    case 'city_official':
      return {
        canAccessAdminAlerts: true,
        hierarchyLevel: 10,
        hierarchyLabel: 'Level 10 City LGU CSWDO & Youth Welfare Executive Clearance',
        allowedNavModules: ['home', 'create-avatar', 'authority-chat', 'report-incident', 'chat', 'multimodal', 'audio', 'video', 'journaling', 'sing-along', 'meditations', 'share-art', 'inspiring-media', 'admin-alerts', 'parent-monitoring'],
        allowedAlertCategories: ['CRIMINAL_ACTIVITY', 'ILLEGAL_ACT', 'BULLYING_HARASSMENT', 'SUICIDE_SELF_HARM', 'UNTOWARD_BEHAVIOR'],
        specialAuthorityAction: 'City LGU CSWDO Social Worker & Youth Emergency Intervention',
        badgeColor: 'bg-blue-600/30 text-blue-200 border-blue-500/50'
      };
    default:
      return {
        canAccessAdminAlerts: false,
        hierarchyLevel: 1,
        hierarchyLabel: 'Level 1 Standard User',
        allowedNavModules: ['home', 'create-avatar', 'authority-chat', 'report-incident', 'chat', 'multimodal', 'audio', 'video', 'journaling', 'sing-along', 'meditations', 'share-art', 'inspiring-media', 'daily-affirmations', 'connect-circles', 'safespace-games'],
        allowedAlertCategories: [],
        badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
      };
  }
}

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-student-01',
    fullName: '109283748291',
    email: 'maria.santos@student.deped.gov.ph',
    role: 'student',
    subRole: 'Grade 11 - STEM A',
    organization: 'Ramon Magsaysay High School',
    contactNumber: '0917-555-0101',
    roleSpecificData: {
      lrn: '109283748291',
      studentName: 'Maria Nicole Santos',
      gradeSection: 'Grade 11 - STEM A',
      parentContact: '0918-123-4567'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-parent-01',
    fullName: 'Corazon Santos',
    email: 'corazon.santos@gmail.com',
    role: 'parent',
    subRole: 'Parent of Maria Nicole Santos',
    organization: 'PTA Member - Ramon Magsaysay HS',
    contactNumber: '0918-123-4567',
    roleSpecificData: {
      childLrn: 'Maria Nicole Santos (LRN: 109283748291)',
      relationship: 'Mother',
      address: 'Brgy. Central, Quezon City'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-school-admin-01',
    fullName: 'Dr. Alejandro V. Ramos',
    email: 'alejandro.ramos@deped.gov.ph',
    role: 'school_admin',
    subRole: 'School Head (Principal)',
    organization: 'Ramon Magsaysay High School (ID: 301294)',
    contactNumber: '0917-888-2233',
    roleSpecificData: {
      designation: 'School Head (Principal)',
      itemNo: 'SH-2024-9981',
      schoolId: '301294'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-guidance-01',
    fullName: 'Mrs. Josefina Castro, RGC',
    email: 'josefina.castro@deped.gov.ph',
    role: 'guidance_counselor',
    subRole: 'Registered SafeSpace Counselor',
    organization: 'RMHS Guidance & Counseling Center',
    contactNumber: '0919-444-5566',
    roleSpecificData: {
      prcLicense: 'PRC License #0048291',
      assignedBatches: 'Grade 7 to Grade 12 All Sections'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-dept-head-01',
    fullName: 'Prof. Roberto Mendoza',
    email: 'roberto.mendoza@deped.gov.ph',
    role: 'department_head',
    subRole: 'Senior High School Dept Head',
    organization: 'Ramon Magsaysay High School - SHS Dept',
    contactNumber: '0920-111-2233',
    roleSpecificData: {
      departmentName: 'Senior High School Academics',
      facultyId: 'EMP-2021-9981'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-teacher-01',
    fullName: 'Mrs. Clarissa Soriano',
    email: 'clarissa.soriano@deped.gov.ph',
    role: 'teacher_adviser',
    subRole: 'Class Adviser (Grade 11 - STEM A)',
    organization: 'Ramon Magsaysay High School - Faculty',
    contactNumber: '0917-333-4411',
    roleSpecificData: {
      advisoryClass: 'Grade 11 - STEM A',
      subjectTaught: 'Pre-Calculus & Physics',
      facultyId: 'TCH-2022-3341'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-guard-01',
    fullName: 'Officer Danilo Cruz',
    email: 'danilo.cruz@sentinelsecurity.ph',
    role: 'school_guard',
    subRole: 'Chief Campus Security Officer',
    organization: 'DepEd Sentinel Detachment - Gate 1',
    contactNumber: '0922-333-4455',
    roleSpecificData: {
      securityAgency: 'Sentinel Campus Security Agency',
      guardDutyPost: 'Main Gate 1 Security Post',
      licenseNo: 'SOSIA-SEC-99812'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-non-teaching-01',
    fullName: 'Nurse Elena Gomez, RN',
    email: 'elena.gomez@deped.gov.ph',
    role: 'non_teaching_staff',
    subRole: 'School Clinic Nurse',
    organization: 'RMHS Medical & Health Services Clinic',
    contactNumber: '0917-777-8899',
    roleSpecificData: {
      staffUnit: 'School Clinic & Health Unit',
      employeeId: 'NTS-2022-7711'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-sdo-01',
    fullName: 'Dir. Carmelita B. Tan',
    email: 'carmelita.tan@deped.gov.ph',
    role: 'sdo_admin',
    subRole: 'Schools Division Superintendent',
    organization: 'DepEd Schools Division Office of Quezon City (SDO-QC)',
    contactNumber: '0917-999-0011',
    roleSpecificData: {
      sdoName: 'SDO Quezon City',
      sdoDesignation: 'Schools Division Superintendent',
      itemNo: 'SDO-SDS-0012'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-pnp-01',
    fullName: 'PEMS Juan Dela Cruz',
    email: 'juan.delacruz@pnp.gov.ph',
    role: 'pnp_authority',
    subRole: 'Police Executive Master Sergeant',
    organization: 'PNP Station 10 - Women & Children Protection Desk (WCPD)',
    contactNumber: '0917-911-0000',
    roleSpecificData: {
      pnpBadgeNo: 'PNP-BADGE-88192',
      precinctStation: 'PS-10 WCPD Crisis Response Detachment',
      rank: 'Police Executive Master Sergeant'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-brgy-01',
    fullName: 'Hon. Captain Rodrigo Flores',
    email: 'rodrigo.flores@barangaycentral.gov.ph',
    role: 'brgy_official',
    subRole: 'Barangay Captain & BVAWC Head',
    organization: 'Barangay Central Council - Quezon City',
    contactNumber: '0917-888-1122',
    roleSpecificData: {
      barangayName: 'Barangay Central, Quezon City',
      officialTitle: 'Barangay Chairman & BVAWC Desk Head',
      brgyId: 'BRGY-QC-2024-8812'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-city-01',
    fullName: 'Atty. Carmela Villanueva',
    email: 'carmela.villanueva@quezoncity.gov.ph',
    role: 'city_official',
    subRole: 'City Social Welfare Officer (CSWDO Head)',
    organization: 'Quezon City Hall - CSWDO & Youth Affairs',
    contactNumber: '0917-777-3344',
    roleSpecificData: {
      cityName: 'Quezon City LGU',
      department: 'City Social Welfare & Development Office (CSWDO)',
      lguId: 'LGU-QC-EX-4412'
    },
    createdAt: new Date().toISOString()
  }
];

export function getUserDisplayName(user?: UserProfile | null): string {
  if (!user) return 'Guest';
  if (user.role === 'student') {
    const lrn = user.roleSpecificData?.lrn || '109283748291';
    return lrn.replace(/^LRN:\s*/i, '');
  }
  return user.fullName.replace(/^LRN:\s*/i, '');
}
