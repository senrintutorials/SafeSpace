import { LocationMeta } from './recordedEntriesStore';

export interface StudentCheckInEntry {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  dateStr: string;
  rating: number; // 1 - 10
  ratingLabel: string;
  ratingEmoji: string;
  feelingTags: string[];
  notes: string;
  location?: LocationMeta;
}

const STORAGE_KEY = 'safespace_student_daily_checkins';

const INITIAL_MOCK_CHECKINS: StudentCheckInEntry[] = [
  {
    id: 'chk-1',
    studentId: 'usr-student-juan',
    studentName: 'Juan Dela Cruz',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    rating: 8,
    ratingLabel: 'Very Good & Energetic',
    ratingEmoji: '😊',
    feelingTags: ['Grateful', 'Focused', 'Inspired'],
    notes: 'Had a productive study session for STEM Physics today! Feeling optimistic about the upcoming group presentation.',
    location: {
      address: 'Senior High School Building (Grade 11-12 Wing), RMHS',
      campusZone: 'Senior High School Building (Grade 11-12 Wing)',
      lat: 14.6094,
      lng: 121.0007,
      accuracy: 3.5,
      geofenceStatus: 'Inside Safe Campus Zone'
    }
  },
  {
    id: 'chk-2',
    studentId: 'usr-student-juan',
    studentName: 'Juan Dela Cruz',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    dateStr: new Date(Date.now() - 86400000 * 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    rating: 6,
    ratingLabel: 'Okay / Neutral',
    ratingEmoji: '🙂',
    feelingTags: ['Calm', 'Tired'],
    notes: 'A bit sleepy during morning lectures, but practiced 5-minute deep breathing during lunchtime.',
    location: {
      address: 'Ramon Magsaysay HS - Main Gate 1',
      campusZone: 'Ramon Magsaysay HS - Main Gate 1',
      lat: 14.6091,
      lng: 121.0003,
      accuracy: 4.0,
      geofenceStatus: 'Inside Safe Campus Zone'
    }
  }
];

export function getStudentCheckIns(studentId?: string): StudentCheckInEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CHECKINS));
      return INITIAL_MOCK_CHECKINS;
    }
    const parsed: StudentCheckInEntry[] = JSON.parse(raw);
    if (studentId) {
      return parsed.filter(item => item.studentId === studentId || item.studentName.toLowerCase().includes(studentId.toLowerCase()));
    }
    return parsed;
  } catch (e) {
    return INITIAL_MOCK_CHECKINS;
  }
}

export function saveStudentCheckIn(data: Omit<StudentCheckInEntry, 'id' | 'timestamp' | 'dateStr'>): StudentCheckInEntry {
  const current = getStudentCheckIns();
  const newEntry: StudentCheckInEntry = {
    ...data,
    id: 'chk-' + Date.now(),
    timestamp: new Date().toISOString(),
    dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  const updated = [newEntry, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Also record in general activity history so counselor/system sees it
  try {
    const activityRaw = localStorage.getItem('safespace_recorded_activity_history');
    if (activityRaw) {
      const activities = JSON.parse(activityRaw);
      activities.unshift({
        id: 'rec-' + Date.now(),
        type: 'journal',
        title: `Student Daily Check-in: Day Rating ${data.rating}/10 (${data.ratingEmoji} ${data.ratingLabel})`,
        timestamp: newEntry.timestamp,
        excerpt: `[Feelings: ${data.feelingTags.join(', ')}] ${data.notes || 'No extra notes.'}`,
        location: data.location,
        reportAnalysis: {
          dominantEmotion: data.ratingLabel,
          valenceScore: data.rating / 10,
          arousalScore: 0.5,
          sentimentLabel: data.rating >= 7 ? 'Positive' : data.rating >= 4 ? 'Neutral' : 'Needs Support',
          psychologistInsights: [
            `Student check-in completed on sign-in. Overall Day Rating: ${data.rating}/10.`,
            `Key emotional indicators tagged: ${data.feelingTags.join(', ') || 'General sentiment'}.`
          ],
          guidanceNote: data.rating <= 4 ? 'Student reported low day rating. Recommend guidance check-in.' : 'Student maintaining healthy self-reflection routine.'
        }
      });
      localStorage.setItem('safespace_recorded_activity_history', JSON.stringify(activities));
    }
  } catch (err) {
    // Ignore secondary sync errors
  }

  window.dispatchEvent(new Event('student_checkins_updated'));
  window.dispatchEvent(new Event('recorded_entries_updated'));
  return newEntry;
}

export function deleteStudentCheckIn(id: string): void {
  const current = getStudentCheckIns();
  const filtered = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event('student_checkins_updated'));
}
