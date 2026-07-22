/** 考勤打卡状态 */
export type AttendanceStatus =
  | 'not_clocked'  // 未打卡
  | 'working'      // 已上班打卡，未下班打卡
  | 'completed'    // 已完成上下班打卡
  | 'late'         // 迟到
  | 'early_leave'  // 早退
  | 'absent'       // 缺勤
  | 'rest';        // 休息

/** 今日考勤状态 */
export interface TodayStatus {
  id: number | null;
  date: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  status: AttendanceStatus;
  workHours: number;
}

/** 打卡结果 */
export interface ClockResult {
  id: number;
  date: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  status: AttendanceStatus;
  workHours?: number;
}

/** 考勤记录 */
export interface AttendanceRecord {
  id: number;
  userId: number;
  date: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  status: AttendanceStatus;
  workHours: number;
}

/** 考勤记录查询参数 */
export interface AttendanceQuery {
  pageNum: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
}

/** 个人考勤统计 */
export interface AttendanceStatistics {
  totalDays: number;
  normalDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  absentDays: number;
  avgClockIn: string;
  avgClockOut: string;
  avgWorkHours: number;
  trend: Array<{
    date: string;
    workHours: number;
  }>;
}

/** 部门考勤统计 */
export interface DepartmentStatistics {
  departmentName: string;
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  avgWorkHours: number;
  trend: Array<{
    date: string;
    present: number;
    late: number;
    absent: number;
  }>;
}
