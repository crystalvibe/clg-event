interface MediaItem {
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string;
  file?: File;
}

export interface Event {
  id?: number;
  documentId: string;
  title: string;
  category: string;
  eventType: string;
  date: string;
  endDate?: string;
  department: string;
  coordinator: string;
  teamMembers?: string;
  resourcePersons?: string[] | string | undefined;
  participantsCount?: string;
  externalParticipants?: string;
  sponsoredBy?: string;
  financialAssistance?: string;
  totalExpenses?: string;
  description?: string;
  media?: MediaItem[];
  venue?: string;
  startDate?: string;
  archived?: boolean;
  images?: string[];
  documents?: string[];
  timeSlot?: string;
  organizer?: string;
  academicYear?: string;
  status?: 'pending' | 'approved' | 'rejected';
} 