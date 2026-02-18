// src/constants/caseStatus.ts

const suffixToRoleMap = {
  CE: "ce",
  APO: "apo",
  Leader: "celead",
  PS: "ps",
  FD: "fd", 
};

export function extractRoleFromStatus(status: string) {
  const match = status.match(/^(NEW_Assign|Assign)([A-Za-z]+)/);
  if (match) {
    const suffix = match[2];
    return suffixToRoleMap[suffix] || null;
  }
  return null;
}

export const STATUS_ENUM_TO_LABEL: Record<string, string> = {
  New: "New",
  Open: "Open",
  InActive: "Inactive",
  Close: "Closed (Cust Pick Up)",
  Cancel: "Cancel (Cust Pick Up)",
  Active: "Active",
  Monitor: "Monitor",
  Pending_Customer_Action: "Pending Customer Action",
  Quote_Requested: "Quote Requested",
  Pending_Follow_Up: "Pending Follow Up",
  Pending_Order: "Pending Order",
  Escalated: "Escalated",
  Quote_Approved: "Quote Approved",
  Quote_Rejected: "Quote Rejected",
  Pending_Quote: "Pending Quote",
  NEW_AssignFD: "New Assign To FD",
  NEW_AssignCE: "New Assign To CE",
  NEW_AssignLeader: "New Assign To Leader",
  NEW_AssignAPO: "New Assign To APO",
  NEW_AssignPS: "New Assign To PS",
  NEW_AssignCM: "New Assign To CM",
  AssignFD: "Assign To FD",
  AssignCE: "Assign To CE",
  AssignAPO: "Assign To APO",
  AssignLeader: "Assign To Leader",
  AssignPS: "Assign To PS",
  AssignCM: "Assign To CM",
  NEW_POPDoc: "New Needed POP Document",
  NEW_Warranty: "New Warranty (Warranty Proses)",
  PartRequest: "Part Request",
  PartRequestLog: "Part Request Logistic",
  PartOrder: "Part Order",
  PartAvailable: "Part Available",
  RepairProgress: "Repair Progress",
  FinishRepair: "Finish Repair",
  CancelRepair: "Cancel Repair",
  Closed: "Closed",
  Cancelled: "Cancelled",
  Void: "Void",
  Reschedule: "Reschedule",
  DOAPartReturn: "DOA Part Return",
  Customer_Delay: "Customer Delay"
};

export const STATUS_LABELS = Object.keys(STATUS_ENUM_TO_LABEL);

export const BASE_STATUS_KEYS = [
  "New", "Open", "InActive", "Close", "Active", "Monitor",
  "Pending_Customer_Action", "Quote_Requested", "Pending_Follow_Up",
  "Pending_Order", "Escalated", "Quote_Approved", "Quote_Rejected", "Pending_Quote","Void",
];

export const ROLE_STATUS_EXTRAS: Record<string, string[]> = {
  fd: ["NEW_AssignFD", "NEW_AssignCE", "NEW_AssignLeader", "NEW_AssignAPO", "NEW_AssignPS", "NEW_POPDoc", "NEW_Warranty", "Close", "New", "Void"],
  spv: ["NEW_AssignFD","NEW_AssignCE", "NEW_AssignLeader", "NEW_AssignAPO", "NEW_AssignPS",],
  admin: ["NEW_AssignFD","NEW_AssignCE", "NEW_AssignLeader", "NEW_AssignAPO", "NEW_AssignPS",],
  ce: ["PartRequest", "PartRequestLog", "PartOrder", "PartAvailable", "RepairProgress", "FinishRepair"],
  celead: ["NEW_AssignCE", "NEW_AssignAPO", "PartRequest", "PartRequestLog", "PartOrder", "PartAvailable", "RepairProgress", "FinishRepair"],
  apo: ["NEW_AssignCE", "NEW_AssignAPO", "PartRequest", "PartRequestLog", "PartOrder", "PartAvailable"],
  lg: ["NEW_AssignCE", "NEW_AssignAPO", "PartRequest", "PartRequestLog", "PartOrder", "PartAvailable"],
  ps: ["NEW_AssignCE", "NEW_AssignLeader", "NEW_AssignAPO", "NEW_AssignPS"],
};


export const STATUS_ENUM_TO_LABEL_WO = {
  OPEN_UNSCHEDULED: 'Open - Unscheduled',
  OPEN_SCHEDULED: 'Open - Scheduled',
  OPEN_INPROGRES: 'Open - In Progress',
  OPEN_COMPLETED: 'Open - Completed',
  CLOSED_POSTED: 'Closed - Posted',
  CLOSED_CANCELLED: 'Closed - Cancelled',
  };
