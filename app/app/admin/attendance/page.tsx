'use client';

import { Clock, CheckCircle2, AlertTriangle, XCircle, Calendar, Filter } from 'lucide-react';
import { PageHeader, Card, Badge, Avatar } from '@/components/crm/crm-ui';

export default function AttendancePage() {
  const attendanceData = [
    { name: 'Sarah Chen', role: 'Sales Lead', clockIn: '08:55 AM', clockOut: '06:05 PM', workingHours: '9h 10m', breakTime: '45 mins', status: 'Present', lateBy: '-' },
    { name: 'James Holt', role: 'Telecaller', clockIn: '09:02 AM', clockOut: '06:00 PM', workingHours: '8h 58m', breakTime: '50 mins', status: 'Present', lateBy: '-' },
    { name: 'Lena Ortiz', role: 'Telecaller', clockIn: '09:25 AM', clockOut: '06:15 PM', workingHours: '8h 50m', breakTime: '40 mins', status: 'Late', lateBy: '25 mins' },
    { name: 'Marcus Reid', role: 'Telecaller', clockIn: '08:58 AM', clockOut: '05:55 PM', workingHours: '8h 57m', breakTime: '60 mins', status: 'Present', lateBy: '-' },
    { name: 'Aisha Patel', role: 'Telecaller', clockIn: '-', clockOut: '-', workingHours: '0h 00m', breakTime: '0 mins', status: 'Absent', lateBy: '-' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Telecaller Attendance & Shift Tracking"
        subtitle="Admin Portal • Clock-In Logs, Late Arrival Reports & Working Hours Monitoring"
      />

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Clock In</th>
                <th className="px-6 py-3.5">Clock Out</th>
                <th className="px-6 py-3.5">Total Hours</th>
                <th className="px-6 py-3.5">Break Time</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceData.map((emp) => (
                <tr key={emp.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={emp.name} size={36} ring />
                      <div>
                        <p className="font-bold text-slate-900">{emp.name}</p>
                        <p className="text-xs text-slate-500">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-800">{emp.clockIn}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-800">{emp.clockOut}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-900">{emp.workingHours}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">{emp.breakTime}</td>
                  <td className="px-6 py-4">
                    <Badge variant={emp.status === 'Present' ? 'green' : emp.status === 'Late' ? 'yellow' : 'red'}>
                      {emp.status} {emp.lateBy !== '-' && `(${emp.lateBy})`}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
