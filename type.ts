export type PetType = "dog" | "cat" | "bird" | "rabbit" | "other";

export type ServiceType = "veterinary" | "vaccination" | "grooming" | "bath" | "teeth" | "hotel" | "other";

export type AppointmentStatus = "scheduled" | "confirmed" | "cancelled" | "completed";

export type ReminderStatus = "none" | "drafted" | "sending" | "sent" | "failed";

export interface Appointment {
  id: string;
  petName: string;
  petType: PetType;
  petBreed: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  serviceType: ServiceType;
  dateTime: string; // ISO or YYYY-MM-DDTHH:mm
  duration: number; // in minutes
  notes: string;
  status: AppointmentStatus;
  reminderStatus: ReminderStatus;
  reminderEmailSubject?: string;
  reminderEmailBody?: string;
  reminderSentAt?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: "create" | "update" | "delete" | "reminder_draft" | "reminder_sent";
  message: string;
}

export interface DashboardStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  remindersSent: number;
  nextReminders: number;
}
