export const doctors = [
  { id: 1, name: 'Dr. Reddy', department: 'cardiology', available: '7 PM', email: 'dr_reddy@hospital.com' },
  { id: 2, name: 'Dr. Smith', department: 'general', available: '10 AM', email: 'dr_smith@hospital.com' },
  { id: 3, name: 'Dr. Patel', department: 'orthopedics', available: '2 PM', email: 'dr_patel@hospital.com' },
  { id: 4, name: 'Dr. Lee', department: 'neurology', available: '4 PM', email: 'dr_lee@hospital.com' },
  { id: 5, name: 'Emergency Team', department: 'emergency', available: 'Immediately', email: 'er_triage@hospital.com' },
  { id: 6, name: 'Dr. Allen', department: 'dermatology', available: '9 AM', email: 'dr_allen@hospital.com' },
  { id: 7, name: 'Dr. Clark', department: 'pediatrics', available: '11 AM', email: 'dr_clark@hospital.com' }
];

export function getDoctorByDepartment(department) {
  const departmentDoctors = doctors.filter(doc => doc.department === department);
  if (departmentDoctors.length === 0) return doctors.find(doc => doc.department === 'general');
  return departmentDoctors[Math.floor(Math.random() * departmentDoctors.length)];
}
