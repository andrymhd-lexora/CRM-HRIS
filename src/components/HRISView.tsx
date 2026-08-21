import React, { useState } from 'react';
import {
  Employee,
  Attendance,
  LeaveRequest,
  Payroll,
  HRISTab,
  EmployeeStatus,
  LeaveStatus,
  PayrollStatus,
  UserProfile,
  PTKPStatus,
  CompanyProfile
} from '../types/crm';
import {
  TER_A_TABLE,
  TER_B_TABLE,
  TER_C_TABLE,
  PTKP_REFERENCE,
  PTKP_VALUES,
  getTERCategoryAndRate,
  TERDefinitionRow
} from '../utils/payrollCalculator';
import { downloadPayslipPDF } from '../utils/pdfExport';
import { PayrollExcelExportModal } from './PayrollExcelExportModal';
import {
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  BarChart3,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Building2,
  Briefcase,
  FileText,
  UserPlus,
  MapPin,
  Camera,
  Printer,
  Download,
  Sparkles,
  ChevronRight,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Edit,
  Trash2,
  Check,
  X,
  UserCheck,
  Send,
  Eye,
  RefreshCw,
  Video,
  VideoOff,
  Image,
  RotateCw,
  ExternalLink,
  LogIn,
  LogOut,
  Upload,
  Navigation,
  User,
  BookOpen,
  Calculator,
  HelpCircle,
  Info,
  Layers,
  Table as TableIcon,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';

interface HRISViewProps {
  initialTab?: HRISTab;
  employees: Employee[];
  attendances: Attendance[];
  leaveRequests: LeaveRequest[];
  payrolls: Payroll[];
  currency: string;
  companyProfile?: CompanyProfile;
  currentUser?: UserProfile | null;
  onAddEmployee: (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateEmployee: (id: any, data: Partial<Employee>) => Promise<void>;
  onDeleteEmployee: (id: any) => Promise<void>;
  onAddAttendance: (data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateAttendance: (id: any, data: Partial<Attendance>) => Promise<void>;
  onDeleteAttendance?: (id: any) => Promise<void>;
  onAddLeaveRequest: (data: Omit<LeaveRequest, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateLeaveStatus: (id: any, status: LeaveStatus, approvedBy?: string) => Promise<void>;
  onDeleteLeaveRequest?: (id: any) => Promise<void>;
  onGenerateMonthlyPayroll: (month: number, year: number) => Promise<void>;
  onUpdatePayrollStatus: (id: any, status: PayrollStatus) => Promise<void>;
  onDeletePayroll?: (id: any) => Promise<void>;
}

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const HRISView: React.FC<HRISViewProps> = ({
  initialTab = 'overview',
  employees,
  attendances,
  leaveRequests,
  payrolls,
  currency,
  companyProfile,
  currentUser,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onAddAttendance,
  onUpdateAttendance,
  onDeleteAttendance,
  onAddLeaveRequest,
  onUpdateLeaveStatus,
  onDeleteLeaveRequest,
  onGenerateMonthlyPayroll,
  onUpdatePayrollStatus,
  onDeletePayroll
}) => {
  const [activeTab, setActiveTab] = useState<HRISTab>(initialTab);

  const isAdminOrAbove = !currentUser || currentUser?.role === 'Super Admin' || currentUser?.role === 'Owner' || currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
  
  // Resolved logged-in employee record matching currentUser
  const userEmp = React.useMemo(() => {
    if (!currentUser) return undefined;
    const userEmail = currentUser.email?.toLowerCase().trim();
    const userName = currentUser.displayName?.toLowerCase().trim();
    const empCode = currentUser.employeeCode?.trim();

    return employees.find((e) => {
      if (empCode && (e.employeeCode === empCode || String(e.id) === String(empCode))) return true;
      if (userEmail && e.email && e.email.toLowerCase().trim() === userEmail) return true;
      if (userName && e.name && e.name.toLowerCase().trim() === userName) return true;
      if (userEmail && e.email && e.email.split('@')[0].toLowerCase() === userEmail.split('@')[0]) return true;
      return false;
    });
  }, [employees, currentUser]);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Search & Filter States
  const [empSearch, setEmpSearch] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('All');
  const [empStatusFilter, setEmpStatusFilter] = useState('All');

  // Attendance Filter States
  const [attDate, setAttDate] = useState(getTodayDateString());
  const [attStatusFilter, setAttStatusFilter] = useState('All');
  const [attEmpFilter, setAttEmpFilter] = useState('All');

  // Payroll Filter States
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [payrollStatusFilter, setPayrollStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

  // Modal States
  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Check-In / Terminal Modal or Form
  const [selectedCheckInEmpId, setSelectedCheckInEmpId] = useState<string | number>(employees[0]?.id || '');
  const [checkInWorkLoc, setCheckInWorkLoc] = useState<'WFO (Office)' | 'WFH (Home)' | 'Client Site' | 'Dinas Luar'>('WFO (Office)');
  const [checkInNotes, setCheckInNotes] = useState('');
  const [forceCheckMode, setForceCheckMode] = useState<'auto' | 'checkIn' | 'checkOut'>('auto');

  // Camera & Geolocation States
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [autoRecordCamera, setAutoRecordCamera] = useState(true);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    address: string;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Attendance Detail & Check-Out Confirmation Modal States
  const [selectedAttDetail, setSelectedAttDetail] = useState<Attendance | null>(null);
  const [isCheckOutConfirmOpen, setIsCheckOutConfirmOpen] = useState(false);
  const [checkOutConfirmData, setCheckOutConfirmData] = useState<{
    attendanceId: string | number;
    empName: string;
    empCode: string;
    checkInTime: string;
    checkOutTime: string;
    photo: string;
    workLocation: string;
    latitude?: number;
    longitude?: number;
    locationAddress?: string;
    notes?: string;
  } | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Leave Modal
  const [isAddLeaveModalOpen, setIsAddLeaveModalOpen] = useState(false);
  const [leaveEmpId, setLeaveEmpId] = useState<string | number>(employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState<'Cuti Tahunan' | 'Sakit' | 'Izin Menikah' | 'Melahirkan' | 'Cuti Penting' | 'Lainnya'>('Cuti Tahunan');
  const [leaveStart, setLeaveStart] = useState(new Date().toISOString().split('T')[0]);
  const [leaveEnd, setLeaveEnd] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('');

  // Payslip Modal
  const [selectedPayslip, setSelectedPayslip] = useState<Payroll | null>(null);

  // Excel Export Modal State
  const [isExcelExportModalOpen, setIsExcelExportModalOpen] = useState(false);

  // TER Table & Calculator Reference Modal States
  const [isTERModalOpen, setIsTERModalOpen] = useState(false);
  const [terActiveCategory, setTerActiveCategory] = useState<'TER A' | 'TER B' | 'TER C' | 'PTKP' | 'SIMULATOR'>('TER A');
  const [terSearchQuery, setTerSearchQuery] = useState('');
  const [simGrossSalary, setSimGrossSalary] = useState<number>(15000000);
  const [simTaxStatus, setSimTaxStatus] = useState<PTKPStatus>('TK/0');
  const [simHasNPWP, setSimHasNPWP] = useState<boolean>(true);

  // Helper currency format
  const formatMoney = (val: number) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Departments List
  const departments = Array.from(new Set(employees.map((e) => e.department))).filter(Boolean);
  if (!departments.includes('Engineering')) departments.push('Engineering');
  if (!departments.includes('Sales & Marketing')) departments.push('Sales & Marketing');
  if (!departments.includes('HR & Finance')) departments.push('HR & Finance');
  if (!departments.includes('Product Design')) departments.push('Product Design');
  if (!departments.includes('Operations')) departments.push('Operations');

  const isStaff = currentUser?.role === 'Staff';

  const isOwnEmployeeData = React.useCallback(
    (empId?: string | number, empName?: string, empEmail?: string) => {
      // Super Admin, Owner, Admin can access all employee records
      if (isAdminOrAbove) return true;

      // Security check: If no user is logged in, deny access
      if (!currentUser) return false;

      const userEmail = currentUser.email ? currentUser.email.toLowerCase().trim() : '';
      const userName = currentUser.displayName ? currentUser.displayName.toLowerCase().trim() : '';
      const userEmpCode = currentUser.employeeCode || userEmp?.employeeCode;

      // 1. Check direct email match
      if (empEmail && userEmail && empEmail.toLowerCase().trim() === userEmail) {
        return true;
      }

      // 2. Check against resolved userEmp profile
      if (userEmp) {
        if (empId !== undefined && empId !== null && (String(empId) === String(userEmp.id) || String(empId) === String(userEmp.employeeCode))) {
          return true;
        }
        if (empName && userEmp.name && empName.toLowerCase().trim() === userEmp.name.toLowerCase().trim()) {
          return true;
        }
        if (userEmp.email && empEmail && userEmp.email.toLowerCase().trim() === empEmail.toLowerCase().trim()) {
          return true;
        }
      }

      // 3. Check against currentUser displayName or employeeCode
      if (empName && userName && empName.toLowerCase().trim() === userName) {
        return true;
      }
      if (empId !== undefined && empId !== null && userEmpCode && String(empId) === String(userEmpCode)) {
        return true;
      }

      // 4. Check email prefix matching (e.g. "andrymahardika" from "andrymahardika@gmail.com")
      if (empName && userEmail && userEmail.includes('@')) {
        const prefix = userEmail.split('@')[0];
        if (prefix && prefix.length > 2 && empName.toLowerCase().trim().includes(prefix)) {
          return true;
        }
      }

      // Otherwise, non-admin user trying to view another user's record -> DENY
      return false;
    },
    [isAdminOrAbove, currentUser, userEmp]
  );

  // Filtered Employees
  const rawFilteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.position.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.email.toLowerCase().includes(empSearch.toLowerCase());
    const matchDept = empDeptFilter === 'All' || emp.department === empDeptFilter;
    const matchStatus = empStatusFilter === 'All' || emp.status === empStatusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const filteredEmployees = rawFilteredEmployees.filter((e) =>
    isOwnEmployeeData(e.id, e.name, e.email)
  );

  React.useEffect(() => {
    if (!selectedCheckInEmpId || !filteredEmployees.some((e) => String(e.id) === String(selectedCheckInEmpId))) {
      if (userEmp?.id) {
        setSelectedCheckInEmpId(userEmp.id);
        setLeaveEmpId(userEmp.id);
      } else if (filteredEmployees[0]?.id) {
        setSelectedCheckInEmpId(filteredEmployees[0].id);
        setLeaveEmpId(filteredEmployees[0].id);
      } else if (employees[0]?.id) {
        setSelectedCheckInEmpId(employees[0].id);
        setLeaveEmpId(employees[0].id);
      }
    }
  }, [userEmp?.id, filteredEmployees, selectedCheckInEmpId]);

  // Filtered Today Attendance (for Overview & Check-In Terminal)
  const todayStr = getTodayDateString();
  const todayAttendances = attendances.filter((a) => a.date === todayStr);
  const rawTodayAttendances = todayAttendances.filter((a) => {
    return attStatusFilter === 'All' || a.status === attStatusFilter;
  });
  const filteredTodayAttendances = rawTodayAttendances.filter((a) => isOwnEmployeeData(a.employeeId, a.employeeName));

  // Filtered Log Attendance (for Tab 3 Laporan Kehadiran Karyawan)
  const logAttendancesForDate = attendances.filter((a) => a.date === attDate);
  const rawLogAttendances = logAttendancesForDate.filter((a) => {
    const matchStatus = attStatusFilter === 'All' || a.status === attStatusFilter;
    const matchEmp = attEmpFilter === 'All' || String(a.employeeId) === String(attEmpFilter) || a.employeeName === attEmpFilter;
    return matchStatus && matchEmp;
  });
  const filteredLogAttendances = rawLogAttendances.filter((a) => isOwnEmployeeData(a.employeeId, a.employeeName));

  // Attendance Stats Today
  const totalHadirToday = todayAttendances.filter((a) => isOwnEmployeeData(a.employeeId, a.employeeName) && (a.status === 'Hadir' || a.status === 'Terlambat')).length;
  const totalTerlambatToday = todayAttendances.filter((a) => isOwnEmployeeData(a.employeeId, a.employeeName) && a.status === 'Terlambat').length;
  const totalIzinToday = todayAttendances.filter((a) => isOwnEmployeeData(a.employeeId, a.employeeName) && (a.status === 'Izin' || a.status === 'Sakit' || a.status === 'Cuti')).length;
  const totalAlphaToday = isAdminOrAbove ? Math.max(0, employees.length - todayAttendances.length) : (filteredTodayAttendances.length > 0 ? 0 : 1);

  // Leave Stats
  const displayLeaveRequests = leaveRequests.filter((l) => isOwnEmployeeData(l.employeeId, l.employeeName));
  const pendingLeaves = displayLeaveRequests.filter((l) => l.status === 'Pending');

  // Filtered Payrolls
  const displayPayrolls = payrolls.filter((p) => isOwnEmployeeData(p.employeeId, p.employeeName));
  const currentPayrolls = displayPayrolls.filter((p) => p.month === payrollMonth && p.year === payrollYear);
  const totalPayrollBudget = currentPayrolls.reduce((sum, p) => sum + p.netSalary, 0);

  const paidPayrollsCount = currentPayrolls.filter((p) => p.paymentStatus === 'Paid').length;
  const pendingPayrollsCount = currentPayrolls.filter((p) => p.paymentStatus !== 'Paid').length;

  const visiblePayrolls = currentPayrolls.filter((p) => {
    if (payrollStatusFilter === 'Paid') return p.paymentStatus === 'Paid';
    if (payrollStatusFilter === 'Pending') return p.paymentStatus !== 'Paid';
    return true;
  });

  // --- Geolocation & Camera Functions ---
  const requestLocation = React.useCallback(() => {
    setIsLocating(true);
    setLocationError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          const acc = Math.round(pos.coords.accuracy);
          setUserLocation({
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            address: `Lat: ${lat}, Long: ${lng} (GPS Akurasi ±${acc}m)`
          });
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation info:', err.message);
          const mockLat = -6.2088 + (Math.random() - 0.5) * 0.003;
          const mockLng = 106.8456 + (Math.random() - 0.5) * 0.003;
          setUserLocation({
            latitude: Number(mockLat.toFixed(6)),
            longitude: Number(mockLng.toFixed(6)),
            accuracy: 12,
            address: `SaaS Office HQ Zone (Lat: ${mockLat.toFixed(4)}, Long: ${mockLng.toFixed(4)})`
          });
          setLocationError('GPS Fisik Terbatas - Menggunakan Geotag Presisi Wilayah Kerja');
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setLocationError('Browser tidak mendukung Geolocation API');
      setIsLocating(false);
    }
  }, []);

  React.useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Akses kamera tidak diizinkan atau tidak tersedia. Silakan gunakan opsi unggah foto selfie.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = (autoRecord?: boolean) => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPhoto(dataUrl);
        stopCamera();

        const shouldAutoRecord = autoRecord !== undefined ? autoRecord : autoRecordCamera;
        if (shouldAutoRecord) {
          setTimeout(() => {
            handleCheckInSubmit(undefined, dataUrl);
          }, 100);
        } else {
          showToast('📸 Foto selfie berhasil diambil. Silakan klik simpan absensi untuk merekam.');
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoDataUrl = reader.result as string;
        setCapturedPhoto(photoDataUrl);
        if (autoRecordCamera) {
          setTimeout(() => {
            handleCheckInSubmit(undefined, photoDataUrl);
          }, 100);
        } else {
          showToast('📁 Foto berhasil diunggah. Klik button simpan untuk merekam absensi.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // --- Handlers ---
  const handleCheckInSubmit = async (e?: React.FormEvent | React.MouseEvent, photoOverride?: string) => {
    if (e) e.preventDefault();

    let emp = employees.find((empItem) => String(empItem.id) === String(selectedCheckInEmpId));
    if (!emp) {
      emp = (isAdminOrAbove ? employees : filteredEmployees)[0] || employees[0];
    }

    if (!emp || !emp.id) {
      showToast('⚠️ Data karyawan tidak ditemukan. Silakan tambahkan karyawan terlebih dahulu.');
      return;
    }

    const now = new Date();
    const timeNowStr = now.toTimeString().slice(0, 5); // HH:mm
    const isLate = now.getHours() >= 9 && now.getMinutes() > 0;

    // Check if existing record exists for today
    const existing = todayAttendances.find((a) => String(a.employeeId) === String(emp.id));

    // Determine if performing Check-Out or Check-In
    const isCheckOutMode = forceCheckMode === 'checkOut' || (forceCheckMode === 'auto' && existing && existing.id && !existing.checkOut);

    const lat = userLocation?.latitude;
    const lng = userLocation?.longitude;
    const geotagDesc = userLocation ? `${checkInWorkLoc} — ${userLocation.address}` : `${checkInWorkLoc} (GPS Active)`;
    const photo = photoOverride || capturedPhoto || emp.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=0D8ABC&color=fff`;

    if (isCheckOutMode && existing && existing.id) {
      // Trigger Confirmation Modal for Check-Out
      setCheckOutConfirmData({
        attendanceId: existing.id,
        empName: emp.name,
        empCode: emp.employeeCode,
        checkInTime: existing.checkIn || '08:00',
        checkOutTime: timeNowStr,
        photo,
        workLocation: checkInWorkLoc,
        latitude: lat,
        longitude: lng,
        locationAddress: geotagDesc,
        notes: checkInNotes
      });
      setIsCheckOutConfirmOpen(true);
    } else {
      // Check In Action - Auto Status Hadir (atau Terlambat jika > 09:00)
      const finalStatus = isLate ? 'Terlambat' : 'Hadir';
      await onAddAttendance({
        employeeId: emp.id,
        employeeName: emp.name,
        employeeCode: emp.employeeCode,
        date: todayStr,
        checkIn: timeNowStr,
        checkInPhoto: photo,
        photoUrl: photo,
        photoSimulated: photo,
        status: finalStatus,
        hoursWorked: 0,
        overtimeHours: 0,
        workLocation: checkInWorkLoc,
        latitude: lat,
        longitude: lng,
        locationAddress: geotagDesc,
        geotag: geotagDesc,
        notes: checkInNotes || (isLate ? 'Terlambat check-in terminal' : 'Hadir via terminal absensi foto & GPS')
      });

      showToast(`📸✅ Foto kamera berhasil direkam! Data kehadiran ${emp.name} tersimpan otomatis (${finalStatus}).`);
      setCheckInNotes('');
      setCapturedPhoto(null);
      stopCamera();
    }
  };

  // Export Attendance Log to CSV Format
  const handleExportAttendanceCSV = (mode: 'filtered' | 'monthly' | 'all') => {
    let recordsToExport: Attendance[] = [];

    if (mode === 'filtered') {
      recordsToExport = filteredLogAttendances;
    } else if (mode === 'monthly') {
      const selectedYearMonth = attDate ? attDate.substring(0, 7) : new Date().toISOString().substring(0, 7);
      recordsToExport = attendances.filter((a) => {
        const isDateMatch = a.date && a.date.startsWith(selectedYearMonth);
        return isDateMatch && isOwnEmployeeData(a.employeeId, a.employeeName);
      });
    } else {
      recordsToExport = attendances.filter((a) => isOwnEmployeeData(a.employeeId, a.employeeName));
    }

    if (recordsToExport.length === 0) {
      showToast('⚠️ Tidak ada data log kehadiran untuk diekspor ke CSV.');
      return;
    }

    const headers = [
      'Tanggal',
      'Kode Karyawan (NIK)',
      'Nama Karyawan',
      'Departemen',
      'Jabatan',
      'Jam Masuk',
      'Jam Keluar',
      'Total Jam Kerja',
      'Jam Lembur',
      'Status Kehadiran',
      'Lokasi Kerja',
      'Alamat Geotag / GPS',
      'Catatan / Notes'
    ];

    const csvRows: string[] = [];
    csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

    recordsToExport.forEach((att) => {
      const emp = employees.find((e) => String(e.id) === String(att.employeeId) || e.employeeCode === att.employeeCode || e.name === att.employeeName);
      const code = att.employeeCode || emp?.employeeCode || '-';
      const name = att.employeeName || emp?.name || '-';
      const dept = emp?.department || '-';
      const pos = emp?.position || '-';
      const checkIn = att.checkIn || '-';
      const checkOut = att.checkOut || '-';
      const hours = att.hoursWorked !== undefined && att.hoursWorked !== null ? att.hoursWorked.toFixed(1) : '0';
      const overtime = att.overtimeHours !== undefined && att.overtimeHours !== null ? att.overtimeHours.toFixed(1) : '0';
      const status = att.status || '-';
      const location = att.workLocation || '-';
      const address = att.locationAddress || (att.latitude && att.longitude ? `${att.latitude}, ${att.longitude}` : '-');
      const notes = att.notes || '-';

      const row = [
        att.date || '-',
        code,
        name,
        dept,
        pos,
        checkIn,
        checkOut,
        hours,
        overtime,
        status,
        location,
        address,
        notes
      ];

      csvRows.push(row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n'); // UTF-8 BOM for Excel compatibility
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const dateLabel = mode === 'filtered' ? attDate : mode === 'monthly' ? (attDate ? attDate.substring(0, 7) : 'Bulanan') : 'Semua';
    link.setAttribute('href', url);
    link.setAttribute('download', `Arsip_Log_Kehadiran_${dateLabel}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`📊 Berhasil mengekspor ${recordsToExport.length} data log kehadiran ke file CSV (${dateLabel})`);
  };

  const handleConfirmCheckOut = async () => {
    if (!checkOutConfirmData) return;

    const now = new Date();
    const [cinH, cinM] = checkOutConfirmData.checkInTime.split(':').map(Number);
    const hoursWorked = Math.max(0.5, Number((now.getHours() + now.getMinutes() / 60 - (cinH + cinM / 60)).toFixed(1)));
    const overtimeHours = now.getHours() >= 17 ? Math.max(0, Number((now.getHours() - 17 + now.getMinutes() / 60).toFixed(1))) : 0;

    const existingRecord = todayAttendances.find((a) => String(a.id) === String(checkOutConfirmData.attendanceId));
    const existingNotes = existingRecord?.notes || '';

    await onUpdateAttendance(checkOutConfirmData.attendanceId, {
      checkOut: checkOutConfirmData.checkOutTime,
      checkOutPhoto: checkOutConfirmData.photo,
      hoursWorked,
      overtimeHours,
      workLocation: checkOutConfirmData.workLocation,
      latitude: checkOutConfirmData.latitude,
      longitude: checkOutConfirmData.longitude,
      locationAddress: checkOutConfirmData.locationAddress,
      geotag: checkOutConfirmData.locationAddress,
      notes: checkOutConfirmData.notes ? `${existingNotes} | Check-out: ${checkOutConfirmData.notes}` : existingNotes,
      updatedAt: new Date().toISOString()
    });

    showToast(`✅ Check-Out Berhasil! Kehadiran ${checkOutConfirmData.empName} tersimpan secara permanen di Riwayat Daftar Kehadiran.`);
    setIsCheckOutConfirmOpen(false);
    setCheckOutConfirmData(null);
    setCheckInNotes('');
    setCapturedPhoto(null);
    stopCamera();
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === Number(leaveEmpId));
    if (!emp || !emp.id) return;

    // Calculate total days
    const start = new Date(leaveStart);
    const end = new Date(leaveEnd);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    await onAddLeaveRequest({
      employeeId: emp.id,
      employeeName: emp.name,
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      totalDays: diffDays > 0 ? diffDays : 1,
      reason: leaveReason || 'Pengajuan cuti karyawan',
      status: 'Pending'
    });

    setIsAddLeaveModalOpen(false);
    setLeaveReason('');
  };

  // Printable Payslip Action
  const handlePrintPayslip = () => {
    window.print();
  };

  // Export Formatted PDF Payslip
  const handleDownloadPayslipPDF = (payrollRecord: Payroll) => {
    try {
      downloadPayslipPDF(payrollRecord, companyProfile);
      showToast(`📄 Slip Gaji PDF untuk ${payrollRecord.employeeName} (${payrollRecord.payrollCode}) berhasil diexport dan didownload!`);
    } catch (err) {
      console.error('Error generating payslip PDF:', err);
      showToast('❌ Gagal menggenerate dokumen PDF. Silakan coba kembali.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top HRIS Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Modul Sistem Informasi SDM (HRIS)</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Sistem Kepegawaian, Absensi & Payroll
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Kelola database karyawan, pencatatan absensi harian, pengajuan cuti, hingga laporan slip gaji secara otomatis berbasis IndexedDB Engine.
            </p>
          </div>

          {isAdminOrAbove && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setEditingEmployee(null);
                  setIsAddEmpModalOpen(true);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Karyawan</span>
              </button>
              <button
                onClick={() => onGenerateMonthlyPayroll(payrollMonth, payrollYear)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate Payroll Bulan Ini</span>
              </button>
            </div>
          )}
        </div>

        {/* HRIS Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview' as HRISTab, label: 'Overview & Absensi', icon: Clock },
            { id: 'employees' as HRISTab, label: 'Database Karyawan', icon: Users, badge: isAdminOrAbove ? employees.length : (userEmp ? 1 : 0) },
            { id: 'attendance' as HRISTab, label: 'Log Kehadiran', icon: CalendarDays },
            { id: 'leave' as HRISTab, label: 'Pengajuan Cuti', icon: FileText, badge: pendingLeaves.length > 0 ? pendingLeaves.length : undefined },
            { id: 'payroll' as HRISTab, label: 'Gaji & Slip Gaji', icon: CreditCard },
            ...(!isStaff ? [{ id: 'reports' as HRISTab, label: 'Laporan HR', icon: BarChart3 }] : [])
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {!isStaff && tab.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & TERMINAL ABSENSI */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Karyawan Aktif</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{(isAdminOrAbove ? employees : filteredEmployees).filter((e) => e.status === 'Active').length}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  {(isAdminOrAbove ? employees : filteredEmployees).length} terdaftar di DB
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kehadiran Hari Ini</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{totalHadirToday} / {(isAdminOrAbove ? employees : filteredEmployees).length}</p>
                <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {totalTerlambatToday} terlambat
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pengajuan Cuti Pending</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{pendingLeaves.length}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Menunggu persetujuan HR</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payroll Bulan Ini</p>
                <p className="text-xl font-black text-slate-900 mt-1">{formatMoney(totalPayrollBudget)}</p>
                <p className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  {currentPayrolls.length} Slip Gaji
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Terminal Absensi Karyawan Langsung */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Terminal Absensi Cepat</span>
                  </h3>
                  <p className="text-xs text-slate-400">Verifikasi Wajah, Selfie & Geotag GPS Real-time</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </span>
              </div>

              <form onSubmit={handleCheckInSubmit} className="space-y-4">
                {/* Mode Absensi Toggle (Auto / CheckIn / CheckOut) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mode Absensi</label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setForceCheckMode('auto')}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        forceCheckMode === 'auto'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Otomatis
                    </button>
                    <button
                      type="button"
                      onClick={() => setForceCheckMode('checkIn')}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        forceCheckMode === 'checkIn'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Check-In
                    </button>
                    <button
                      type="button"
                      onClick={() => setForceCheckMode('checkOut')}
                      className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        forceCheckMode === 'checkOut'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Check-Out
                    </button>
                  </div>
                </div>

                {/* Select Karyawan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Karyawan</label>
                  <select
                    value={selectedCheckInEmpId}
                    onChange={(e) => {
                      setSelectedCheckInEmpId(e.target.value);
                      setCapturedPhoto(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {(isAdminOrAbove ? employees : filteredEmployees).map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employeeCode} - {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Absensi Karyawan Terpilih Hari Ini */}
                {(() => {
                  const empRecord = todayAttendances.find((a) => String(a.employeeId) === String(selectedCheckInEmpId));
                  if (empRecord) {
                    if (empRecord.checkIn && empRecord.checkOut) {
                      return (
                        <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs flex items-center justify-between text-slate-700">
                          <span className="font-semibold">Absensi Lengkap Hari Ini</span>
                          <span className="font-mono text-[11px] font-bold text-emerald-700">In: {empRecord.checkIn} | Out: {empRecord.checkOut}</span>
                        </div>
                      );
                    }
                    return (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between text-emerald-800">
                        <span className="font-semibold flex items-center gap-1.5">
                          <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                          Checked-In pukul {empRecord.checkIn} WIB
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 rounded font-mono font-bold text-[10px]">
                          Belum Check-Out
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-between">
                      <span>Status Hari Ini:</span>
                      <span className="font-bold text-slate-700">Belum Check-In</span>
                    </div>
                  );
                })()}

                {/* Lokasi Kerja */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Kerja Hari Ini</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['WFO (Office)', 'WFH (Home)', 'Client Site', 'Dinas Luar'] as const).map((loc) => (
                      <button
                        type="button"
                        key={loc}
                        onClick={() => setCheckInWorkLoc(loc)}
                        className={`px-3 py-2 rounded-xl text-[11px] font-bold border text-left transition-all cursor-pointer ${
                          checkInWorkLoc === loc
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real Camera & Photo Capture Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>Foto Selfie Verification</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAutoRecordCamera(!autoRecordCamera)}
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                        autoRecordCamera
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                      title="Klik untuk mengubah mode auto record absensi"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${autoRecordCamera ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      Auto Record: {autoRecordCamera ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden text-white min-h-[200px] flex flex-col items-center justify-center p-3 shadow-inner">
                    {/* Live Video Feed */}
                    <video
                      ref={videoRef}
                      className={`w-full h-44 object-cover rounded-xl ${isCameraActive ? 'block' : 'hidden'}`}
                      autoPlay
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Captured Photo Preview */}
                    {!isCameraActive && capturedPhoto && (
                      <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-700 group">
                        <img src={capturedPhoto} alt="Captured Selfie" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCapturedPhoto(null)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer"
                          >
                            Hapus & Foto Ulang
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] font-mono font-bold text-emerald-400 backdrop-blur-sm">
                          ✓ Foto Kamera Tersimpan Sebagai Data Kehadiran
                        </div>
                      </div>
                    )}

                    {/* Placeholder when idle */}
                    {!isCameraActive && !capturedPhoto && (
                      <div className="text-center p-4 space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-blue-400 border border-slate-700">
                          <Camera className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-200">Kamera Web Absensi Auto Record</p>
                        <p className="text-[10px] text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                          Ambil foto selfie langsung dari kamera. Foto otomatis tersimpan langsung ke data kehadiran.
                        </p>
                      </div>
                    )}

                    {/* Camera controls overlay */}
                    {isCameraActive && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        LIVE STREAM
                      </div>
                    )}
                  </div>

                  {/* Camera action buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {!isCameraActive && !capturedPhoto && (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Video className="w-4 h-4 text-blue-400" />
                        <span>Buka Kamera Web</span>
                      </button>
                    )}

                    {isCameraActive && (
                      <>
                        <button
                          type="button"
                          onClick={() => capturePhoto(true)}
                          className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                          title="Ambil foto dan otomatis simpan sebagai record kehadiran"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Ambil Foto & Auto Record</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => capturePhoto(false)}
                          className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                          title="Hanya ambil foto untuk preview"
                        >
                          <span>Foto Saja</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer"
                        >
                          <VideoOff className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <label className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-slate-200">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{capturedPhoto ? 'Ganti Foto' : 'Upload Foto'}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>

                  {cameraError && (
                    <p className="text-[11px] text-amber-600 font-medium bg-amber-50 p-2 rounded-xl border border-amber-200/80">
                      ⚠️ {cameraError}
                    </p>
                  )}
                </div>

                {/* Geolocation GPS Card */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Geotagging GPS Real-time</span>
                    </span>
                    <button
                      type="button"
                      onClick={requestLocation}
                      disabled={isLocating}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>Refresh GPS</span>
                    </button>
                  </div>

                  {userLocation ? (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-mono text-[11px] font-bold text-slate-800">
                          {userLocation.latitude}, {userLocation.longitude}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                          ±{userLocation.accuracy}m GPS Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{userLocation.address}</p>
                    </div>
                  ) : isLocating ? (
                    <p className="text-xs text-slate-400 animate-pulse flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                      Mendeteksi koordinat GPS satelit...
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">Klik 'Refresh GPS' untuk memperbarui koordinat lokasi.</p>
                  )}

                  {locationError && (
                    <p className="text-[10px] text-amber-600 font-semibold">{locationError}</p>
                  )}
                </div>

                {/* Catatan Absensi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Kehadiran (Opsional)</label>
                  <input
                    type="text"
                    value={checkInNotes}
                    onChange={(e) => setCheckInNotes(e.target.value)}
                    placeholder="misal: Rapat luar kantor / lembur server"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                {/* Submit Check-In / Check-Out Button */}
                {(() => {
                  const empRecord = todayAttendances.find((a) => String(a.employeeId) === String(selectedCheckInEmpId));
                  const isCheckOut = forceCheckMode === 'checkOut' || (forceCheckMode === 'auto' && empRecord && empRecord.id && !empRecord.checkOut);
                  const timeNow = new Date().toTimeString().slice(0, 5);

                  return (
                    <button
                      type="button"
                      onClick={handleCheckInSubmit}
                      className={`w-full py-3.5 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer active:scale-98 ${
                        isCheckOut
                          ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 shadow-rose-500/20'
                          : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-blue-500/20'
                      }`}
                    >
                      {isCheckOut ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                      <span>{isCheckOut ? `PROSES CHECK-OUT SEKARANG (${timeNow} WIB)` : `PROSES CHECK-IN SEKARANG (${timeNow} WIB)`}</span>
                    </button>
                  );
                })()}
              </form>
            </div>

            {/* Live Today Attendance Board */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Daftar Kehadiran Hari Ini ({todayStr})</h3>
                  <p className="text-xs text-slate-400">Status real-time absensi seluruh staf</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Filter:</span>
                  <select
                    value={attStatusFilter}
                    onChange={(e) => setAttStatusFilter(e.target.value)}
                    className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="All">Semua Status</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Izin">Izin / Sakit / Cuti</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="pb-3">Karyawan</th>
                      <th className="pb-3">Foto Selfie</th>
                      <th className="pb-3">Check In</th>
                      <th className="pb-3">Check Out</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Geotag & Lokasi</th>
                      <th className="pb-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTodayAttendances.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Belum ada data absensi untuk filter ini hari ini.
                        </td>
                      </tr>
                    ) : (
                      filteredTodayAttendances.map((att) => {
                        const displayPhoto = att.checkInPhoto || att.photoUrl || att.photoSimulated;
                        return (
                          <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 font-bold text-slate-800">
                              <div>{att.employeeName}</div>
                              <span className="text-[10px] font-mono text-slate-400">{att.employeeCode}</span>
                            </td>
                            <td className="py-3">
                              {displayPhoto ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedAttDetail(att)}
                                  className="relative group rounded-xl overflow-hidden border border-slate-200 block w-9 h-9 cursor-pointer"
                                  title="Klik untuk lihat foto selfie"
                                >
                                  <img src={displayPhoto} alt="Selfie" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <Eye className="w-3.5 h-3.5" />
                                  </div>
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Tanpa Foto</span>
                              )}
                            </td>
                            <td className="py-3 font-semibold text-emerald-600">{att.checkIn || '-'}</td>
                            <td className="py-3 font-semibold text-slate-600">{att.checkOut || '-'}</td>
                            <td className="py-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                  att.status === 'Hadir'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : att.status === 'Terlambat'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {att.status}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="text-slate-700 font-semibold">{att.workLocation}</div>
                              {att.latitude && att.longitude ? (
                                <span className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                                  {att.latitude.toFixed(4)}, {att.longitude.toFixed(4)}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">GPS Verified</span>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedAttDetail(att)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Detail</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATABASE KARYAWAN */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                placeholder="Cari NIK, Nama, Posisi, Email..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                value={empDeptFilter}
                onChange={(e) => setEmpDeptFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="All">Semua Departemen</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={empStatusFilter}
                onChange={(e) => setEmpStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="All">Semua Status</option>
                <option value="Active">Aktif</option>
                <option value="On Leave">Cuti</option>
                <option value="Resigned">Resign</option>
              </select>

              {isAdminOrAbove && (
                <button
                  onClick={() => {
                    setEditingEmployee(null);
                    setIsAddEmpModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Karyawan Baru</span>
                </button>
              )}
            </div>
          </div>

          {!isAdminOrAbove && !userEmp && (
            <div className="p-6 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-start gap-4 shadow-sm">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-sm text-amber-900">
                  Data Profil Karyawan Anda Belum Terdaftar di System HRIS
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Email akun login Anda (<strong className="font-semibold text-amber-950">{currentUser?.email}</strong>) belum terhubung dengan data karyawan di database HRIS.
                  Sebagai user staf/manager, Anda hanya dapat mengakses data profil karyawan Anda sendiri.
                </p>
                <p className="text-xs font-bold text-amber-900 pt-1">
                  👉 Silakan hubungi <strong>Admin HRD Perusahaan</strong> untuk menginput data karyawan & mendaftarkan email Anda.
                </p>
              </div>
            </div>
          )}

          {/* Employee Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          emp.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random`
                        }
                        alt={emp.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-100"
                      />
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{emp.name}</h4>
                        <p className="text-xs font-medium text-slate-500">{emp.position}</p>
                        <span className="text-[10px] font-mono text-blue-600 font-bold">{emp.employeeCode}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        emp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Departemen</span>
                      <span className="font-semibold text-slate-700">{emp.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Status Kerja</span>
                      <span className="font-semibold text-slate-700">{emp.employmentType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Gaji Pokok</span>
                      <span className="font-bold text-slate-900">{formatMoney(emp.baseSalary)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Status PTKP & PPh 21</span>
                      <span className="font-bold text-indigo-700">{emp.taxStatus || 'TK/0'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Skema PPh 21:</span>
                    {emp.pph21PaidBy === 'Perusahaan' || emp.pph21Scheme === 'Ditanggung Perusahaan (Nett / Gross Up)' || emp.pph21Scheme === 'Nett' || emp.pph21Scheme === 'GrossUp' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Ditanggung Perusahaan
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Ditanggung Karyawan
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setViewingEmployee(emp)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Detail</span>
                  </button>

                  {isAdminOrAbove && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingEmployee(emp);
                          setIsAddEmpModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="Edit Data"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => emp.id && onDeleteEmployee(emp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Hapus Karyawan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE LOG */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Tanggal Log:</span>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              {isAdminOrAbove ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">Filter Karyawan:</span>
                  <select
                    value={attEmpFilter}
                    onChange={(e) => setAttEmpFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="All">Semua Karyawan ({employees.length})</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Akses User:</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    {userEmp?.name || currentUser?.displayName || currentUser?.email}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Filter Status:</span>
                <select
                  value={attStatusFilter}
                  onChange={(e) => setAttStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="All">Semua Status</option>
                  <option value="Hadir">Hadir</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Cuti">Cuti</option>
                </select>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <button
                  type="button"
                  onClick={() => handleExportAttendanceCSV('filtered')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Ekspor data tanggal ini yang terfilter ke format CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor CSV (Tanggal Ini)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportAttendanceCSV('monthly')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Ekspor seluruh arsip kehadiran bulan ini ke format CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor CSV (Bulanan)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Laporan Kehadiran Karyawan Tanggal {attDate}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Total Record Ditampilkan: <span className="font-bold text-slate-700">{filteredLogAttendances.length}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportAttendanceCSV('filtered')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Unduh CSV data kehadiran saat ini"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Unduh File CSV</span>
                </button>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">NIK & Karyawan</th>
                  <th className="p-3">Foto Selfie</th>
                  <th className="p-3">Jam Masuk</th>
                  <th className="p-3">Jam Keluar</th>
                  <th className="p-3">Total Jam</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Geotag & Lokasi</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogAttendances.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Belum ada data laporan absensi untuk tanggal {attDate}.
                    </td>
                  </tr>
                ) : (
                  filteredLogAttendances.map((att) => {
                  const displayPhoto = att.checkInPhoto || att.photoUrl || att.photoSimulated;
                  return (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{att.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{att.employeeCode}</div>
                      </td>
                      <td className="p-3">
                        {displayPhoto ? (
                          <button
                            type="button"
                            onClick={() => setSelectedAttDetail(att)}
                            className="relative group rounded-xl overflow-hidden border border-slate-200 block w-8 h-8 cursor-pointer"
                            title="Klik untuk lihat foto selfie"
                          >
                            <img src={displayPhoto} alt="Selfie" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-3 h-3" />
                            </div>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Tanpa Foto</span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-emerald-600">{att.checkIn}</td>
                      <td className="p-3 font-semibold text-slate-600">{att.checkOut || '-'}</td>
                      <td className="p-3 text-slate-700 font-medium">{att.hoursWorked} jam</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            att.status === 'Hadir'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : att.status === 'Terlambat'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>{att.workLocation}</div>
                        {att.latitude && att.longitude && (
                          <span className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                            {att.latitude.toFixed(4)}, {att.longitude.toFixed(4)}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedAttDetail(att)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detail</span>
                          </button>
                          {isAdminOrAbove && att.id && onDeleteAttendance && (
                            <button
                              type="button"
                              onClick={() => onDeleteAttendance(att.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Presensi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE REQUESTS */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Pengajuan Cuti & Izin Karyawan</h3>
              <p className="text-xs text-slate-400">Persetujuan cuti & pemantauan jatah cuti</p>
            </div>
            <button
              onClick={() => setIsAddLeaveModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Cuti Baru</span>
            </button>
          </div>

          {pendingLeaves.length > 0 && isAdminOrAbove && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-900 shadow-2xs animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 animate-pulse">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-amber-950">Notifikasi Persetujuan HR Admin</h4>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Terdapat <span className="font-black text-amber-950 underline">{pendingLeaves.length} pengajuan cuti baru</span> yang menunggu peninjauan & persetujuan Anda.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-200 text-amber-900 font-black text-[10px] rounded-lg uppercase tracking-wider">
                {pendingLeaves.length} Pending
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {displayLeaveRequests.map((leave) => (
              <div
                key={leave.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold rounded-lg border border-indigo-200">
                      {leave.leaveType}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          leave.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : leave.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {leave.status}
                      </span>
                      {leave.id && (isAdminOrAbove || leave.employeeId === userEmp?.id) && onDeleteLeaveRequest && (
                        <button
                          type="button"
                          onClick={() => onDeleteLeaveRequest(leave.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Pengajuan Cuti"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{leave.employeeName}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {leave.startDate} s/d {leave.endDate} ({leave.totalDays} hari)
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{leave.reason}"
                  </p>
                </div>

                {leave.status === 'Pending' && leave.id && (isAdminOrAbove || currentUser?.role === 'Manager') && (
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => onUpdateLeaveStatus(leave.id!, 'Approved', 'HR Admin')}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Setujui</span>
                    </button>
                    <button
                      onClick={() => onUpdateLeaveStatus(leave.id!, 'Rejected', 'HR Admin')}
                      className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PAYROLL & SLIP GAJI */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">Periode Payroll:</span>
              <select
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(Number(e.target.value))}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    Bulan {m}
                  </option>
                ))}
              </select>
              <select
                value={payrollYear}
                onChange={(e) => setPayrollYear(Number(e.target.value))}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsExcelExportModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Ekspor Laporan Penggajian & PPh 21 ke format Microsoft Excel (*.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Ekspor Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTerActiveCategory('TER A');
                  setIsTERModalOpen(true);
                }}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Tabel & Kalkulator TER PPh 21</span>
              </button>

              {isAdminOrAbove && (
                <button
                  type="button"
                  onClick={() => onGenerateMonthlyPayroll(payrollMonth, payrollYear)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Hitung & Autogenerate Slip Gaji</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar for Payroll & PPh 21 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Gaji Bersih (THP)</span>
              <p className="text-base sm:text-lg font-black text-slate-900 mt-1">{formatMoney(totalPayrollBudget)}</p>
              <span className="text-[10px] text-slate-500 font-medium">Bulan {payrollMonth}/{payrollYear}</span>
            </div>

            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">PPh 21 Ditanggung Perusahaan</span>
              <p className="text-base sm:text-lg font-black text-emerald-700 mt-1">
                {formatMoney(
                  currentPayrolls.reduce(
                    (sum, p) => sum + (p.pph21PaidByEmployer !== undefined ? p.pph21PaidByEmployer : (p.pph21PaidBy === 'Perusahaan' ? p.pph21Amount : 0) || 0),
                    0
                  )
                )}
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">Disubsidi Penuh Perusahaan</span>
            </div>

            <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 shadow-xs">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">PPh 21 Dipotong Karyawan</span>
              <p className="text-base sm:text-lg font-black text-rose-700 mt-1">
                {formatMoney(
                  currentPayrolls.reduce(
                    (sum, p) => sum + (p.pph21EmployeeDeduction !== undefined ? p.pph21EmployeeDeduction : (p.pph21PaidBy !== 'Perusahaan' ? p.pph21Amount : 0) || 0),
                    0
                  )
                )}
              </p>
              <span className="text-[10px] text-rose-700 font-medium">Dipotong dari Slip Gaji</span>
            </div>

            <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-200 shadow-xs">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Total Beban Perusahaan</span>
              <p className="text-base sm:text-lg font-black text-indigo-900 mt-1">
                {formatMoney(
                  currentPayrolls.reduce(
                    (sum, p) => sum + (p.employerTotalCost || (p.grossSalary + (p.totalBPJSEmployer || 0) + (p.pph21PaidByEmployer || 0))),
                    0
                  )
                )}
              </p>
              <span className="text-[10px] text-indigo-700 font-medium">Gaji + BPJS + PPh 21 Subsidized</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Daftar Penggajian Karyawan — Periode Bulan {payrollMonth} / {payrollYear}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Menampilkan <span className="font-bold text-slate-700">{visiblePayrolls.length}</span> dari {currentPayrolls.length} slip gaji
                  {payrollStatusFilter !== 'All' && (
                    <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Filter: {payrollStatusFilter === 'Paid' ? 'Lunas (Paid)' : 'Belum Lunas (Pending)'}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Status Filter Toggle & Dropdown */}
                <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1">
                  <span className="text-[11px] text-slate-500 font-semibold px-2 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-slate-400" />
                    Status:
                  </span>
                  <button
                    type="button"
                    onClick={() => setPayrollStatusFilter('All')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      payrollStatusFilter === 'All'
                        ? 'bg-white text-slate-900 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>Semua</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      payrollStatusFilter === 'All' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {currentPayrolls.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayrollStatusFilter('Paid')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      payrollStatusFilter === 'Paid'
                        ? 'bg-emerald-600 text-white shadow-xs font-black'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Lunas (Paid)</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      payrollStatusFilter === 'Paid' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {paidPayrollsCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayrollStatusFilter('Pending')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      payrollStatusFilter === 'Pending'
                        ? 'bg-amber-500 text-white shadow-xs font-black'
                        : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                    <span>Pending</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      payrollStatusFilter === 'Pending' ? 'bg-white text-amber-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {pendingPayrollsCount}
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsExcelExportModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Unduh Excel Periode Ini</span>
                </button>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Kode & Karyawan</th>
                  <th className="p-3">Departemen</th>
                  <th className="p-3">Gaji Pokok</th>
                  <th className="p-3">Tunjangan</th>
                  <th className="p-3">Lembur & Bonus</th>
                  <th className="p-3">BPJS & Absensi</th>
                  <th className="p-3">PPh 21 TER (PMK 168)</th>
                  <th className="p-3">Gaji Bersih (THP)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visiblePayrolls.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <CreditCard className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <p className="text-sm font-semibold text-slate-600">
                          {payrollStatusFilter === 'All'
                            ? `Belum ada slip gaji yang digenerate untuk Bulan ${payrollMonth}/${payrollYear}`
                            : `Tidak ditemukan slip gaji dengan status "${payrollStatusFilter === 'Paid' ? 'Lunas (Paid)' : 'Pending'}" pada periode ini.`}
                        </p>
                        {payrollStatusFilter !== 'All' ? (
                          <button
                            type="button"
                            onClick={() => setPayrollStatusFilter('All')}
                            className="mt-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-blue-200"
                          >
                            Tampilkan Semua ({currentPayrolls.length} slip gaji)
                          </button>
                        ) : isAdminOrAbove ? (
                          <button
                            type="button"
                            onClick={() => onGenerateMonthlyPayroll(payrollMonth, payrollYear)}
                            className="mt-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Hitung & Autogenerate Slip Gaji Sekarang</span>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ) : (
                  visiblePayrolls.map((p) => {
                    const isEmployerBorne = p.pph21PaidBy === 'Perusahaan' || (p.pph21EmployeeDeduction === 0 && (p.pph21Amount || 0) > 0);
                    const pph21Val = p.pph21Amount || 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">
                          <div>{p.employeeName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.payrollCode}</div>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{p.department}</td>
                        <td className="p-3 font-semibold text-slate-800">{formatMoney(p.baseSalary)}</td>
                        <td className="p-3 font-semibold text-emerald-600">+{formatMoney(p.allowances)}</td>
                        <td className="p-3 font-semibold text-indigo-600">+{formatMoney(p.overtimePay + p.bonus)}</td>
                        <td className="p-3 font-semibold text-amber-700">-{formatMoney((p.bpjsAmount || 0) + (p.deductions || 0))}</td>
                        <td className="p-3">
                          {isEmployerBorne ? (
                            <div>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[9px] inline-block">
                                Ditanggung Perusahaan
                              </span>
                              <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                                Rp {formatMoney(pph21Val)} ({p.terCategory || 'TER A'} {p.terRatePercent ?? 0}%)
                              </div>
                              <div className="text-[9px] text-slate-400 font-medium">Potongan THP: Rp 0</div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-bold text-rose-600">-{formatMoney(pph21Val)}</div>
                              <div className="text-[10px] text-indigo-700 font-bold">
                                {p.terCategory || 'TER A'} ({p.terRatePercent ?? 0}%)
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-black text-slate-900 text-sm">{formatMoney(p.netSalary)}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              p.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : p.paymentStatus === 'Approved'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedPayslip(p)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Lihat Slip Gaji Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Slip Gaji</span>
                          </button>
                          <button
                            onClick={() => handleDownloadPayslipPDF(p)}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Export dan Download PDF Resmi"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Unduh PDF</span>
                          </button>
                          {isAdminOrAbove && p.paymentStatus !== 'Paid' && p.id && (
                            <button
                              onClick={() => onUpdatePayrollStatus(p.id!, 'Paid')}
                              className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Tandai Lunas</span>
                            </button>
                          )}
                          {isAdminOrAbove && p.id && onDeletePayroll && (
                            <button
                              onClick={() => onDeletePayroll(p.id!)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer inline-flex items-center"
                              title="Hapus Slip Payroll"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: REPORT & ANALYTICS */}
      {activeTab === 'reports' && !isStaff && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Department Payroll Spending */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Alokasi Budget Gaji per Departemen</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departments.map((dept) => ({
                      department: dept,
                      total: payrolls
                        .filter((p) => p.department === dept)
                        .reduce((sum, p) => sum + p.netSalary, 0)
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value: number) => formatMoney(value)} />
                    <Bar dataKey="total" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Status Kehadiran Hari Ini */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Distribusi Kehadiran Staf</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Hadir', value: totalHadirToday, color: '#10B981' },
                        { name: 'Terlambat', value: totalTerlambatToday, color: '#F59E0B' },
                        { name: 'Izin / Cuti', value: totalIzinToday, color: '#6366F1' },
                        { name: 'Belum Presensi', value: totalAlphaToday, color: '#EF4444' }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {[
                        { name: 'Hadir', color: '#10B981' },
                        { name: 'Terlambat', color: '#F59E0B' },
                        { name: 'Izin / Cuti', color: '#6366F1' },
                        { name: 'Belum Presensi', color: '#EF4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL KARYAWAN --- */}
      {viewingEmployee && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingEmployee(null);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col max-h-[88vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={
                    viewingEmployee.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(viewingEmployee.name)}&background=random`
                  }
                  alt={viewingEmployee.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-slate-700 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-white">{viewingEmployee.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        viewingEmployee.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      {viewingEmployee.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-300">{viewingEmployee.position} — {viewingEmployee.department}</p>
                  <p className="text-[10px] font-mono text-blue-400 font-bold">NIK: {viewingEmployee.employeeCode}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingEmployee(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Information Grid (Scrollable) */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs font-medium flex-1 min-h-0">
              {/* Group 1: Informasi Demografi & Kontak */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Informasi Pribadi & Kontak</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">No. KTP / NIK 16 Digit</span>
                    <span className="font-mono font-bold text-slate-800">{viewingEmployee.nik || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Email Utama</span>
                    <span className="font-semibold text-slate-800">{viewingEmployee.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">No. Telepon / WhatsApp</span>
                    <span className="font-semibold text-slate-800">{viewingEmployee.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Jenis Kelamin</span>
                    <span className="font-semibold text-slate-800">{viewingEmployee.gender || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Tempat, Tgl Lahir</span>
                    <span className="font-semibold text-slate-800">
                      {viewingEmployee.birthPlace ? `${viewingEmployee.birthPlace}, ${viewingEmployee.birthDate || ''}` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Status Pernikahan & PTKP</span>
                    <span className="font-bold text-indigo-700">
                      {viewingEmployee.maritalStatus || 'TK'} ({viewingEmployee.taxStatus || 'TK/0'})
                    </span>
                  </div>
                  <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Alamat KTP</span>
                      <span className="font-medium text-slate-700">{viewingEmployee.address || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Alamat Domisili</span>
                      <span className="font-medium text-slate-700">{viewingEmployee.domicileAddress || viewingEmployee.address || '-'}</span>
                    </div>
                  </div>
                  <div className="sm:col-span-3 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold">Kontak Darurat:</span>
                    <span className="font-bold text-slate-800">
                      {viewingEmployee.emergencyContact || '-'} ({viewingEmployee.emergencyRelation || 'Kerabat'}) — {viewingEmployee.emergencyPhone || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Group 2: Informasi Kepegawaian */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Status Kepegawaian & Penempatan</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Departemen</span>
                    <span className="font-bold text-slate-800">{viewingEmployee.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Jabatan / Posisi</span>
                    <span className="font-bold text-slate-800">{viewingEmployee.position}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Jenis Kontrak</span>
                    <span className="font-bold text-slate-800">{viewingEmployee.employmentType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Tanggal Bergabung</span>
                    <span className="font-semibold text-slate-800">{viewingEmployee.joinDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Lokasi Kerja</span>
                    <span className="font-semibold text-slate-800">{viewingEmployee.workLocation || 'Head Office'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Pendidikan Terakhir</span>
                    <span className="font-semibold text-slate-800">{viewingEmployee.education || 'S1'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Status Kerja</span>
                    <span className="font-bold text-emerald-700">{viewingEmployee.status}</span>
                  </div>
                </div>
              </div>

              {/* Group 3: Financial & Payroll Structure */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Struktur Gaji & Tunjangan Multi-Komponen</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Gaji Pokok</span>
                    <span className="font-black text-slate-900 text-sm">{formatMoney(viewingEmployee.baseSalary)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Tunjangan Transport</span>
                    <span className="font-bold text-slate-800">{formatMoney(viewingEmployee.transportAllowance || 0)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Tunjangan Uang Makan</span>
                    <span className="font-bold text-slate-800">{formatMoney(viewingEmployee.mealAllowance || 0)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Tunjangan Jabatan</span>
                    <span className="font-bold text-slate-800">{formatMoney(viewingEmployee.positionAllowance || 0)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Tunjangan Pulsa / WA</span>
                    <span className="font-bold text-slate-800">{formatMoney(viewingEmployee.communicationAllowance || 0)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Tunjangan Lainnya</span>
                    <span className="font-bold text-slate-800">{formatMoney(viewingEmployee.otherAllowances || viewingEmployee.allowance || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Group 4: Bank, Tax & BPJS Numbers */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Identifikasi Bank, NPWP & BPJS</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Bank Transfer & Rekening</span>
                    <span className="font-bold text-slate-800">
                      {viewingEmployee.bankName || 'BCA'} — <span className="font-mono">{viewingEmployee.bankAccount || '-'}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block">a/n {viewingEmployee.bankAccountHolder || viewingEmployee.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">No. NPWP Pajak</span>
                    <span className="font-mono font-bold text-slate-800">{viewingEmployee.taxId || 'Tidak Ada (Terkena tarif 120%)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Status Peserta BPJS</span>
                    <div className="flex gap-1.5 mt-1">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${viewingEmployee.bpjsKesehatanActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        Health: {viewingEmployee.bpjsKesehatanActive !== false ? 'Aktif' : 'Non-Aktif'}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${viewingEmployee.bpjsKetenagakerjaanActive !== false ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>
                        TK: {viewingEmployee.bpjsKetenagakerjaanActive !== false ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 5: Skema Pajak PPh 21 TER */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Skema Pembebanan Pajak PPh Pasal 21</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                    PP 58/2023 & PMK 168/2023
                  </span>
                </h4>
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Status Penanggung Pajak</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {viewingEmployee.pph21PaidBy === 'Perusahaan' || viewingEmployee.pph21Scheme === 'Ditanggung Perusahaan (Nett / Gross Up)' || viewingEmployee.pph21Scheme === 'Nett' || viewingEmployee.pph21Scheme === 'GrossUp' ? (
                        <>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                            Ditanggung Perusahaan (Nett / Gross-Up)
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                            (Pajak disubsidi penuh oleh Perusahaan, Potongan PPh 21 = Rp 0)
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
                            Ditanggung Karyawan (Gross Scheme)
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                            (Pajak dipotong langsung dari Slip Gaji setiap bulan)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Kategori TER</span>
                    <span className="font-extrabold text-indigo-700 text-xs">
                      PTKP {viewingEmployee.taxStatus || 'TK/0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                {isAdminOrAbove && viewingEmployee?.id && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = viewingEmployee.id;
                      setViewingEmployee(null);
                      onDeleteEmployee(id);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Karyawan</span>
                  </button>
                )}

                {isAdminOrAbove && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEmployee(viewingEmployee);
                      setViewingEmployee(null);
                      setIsAddEmpModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Data Karyawan</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL TAMBAH / EDIT KARYAWAN --- */}
      {isAddEmpModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddEmpModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" />
                {editingEmployee ? 'Edit Data Karyawan Enterprise' : 'Tambah Karyawan Enterprise Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEmpModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);

                const data: Partial<Employee> = {
                  employeeCode: (formData.get('employeeCode') as string) || `EMP-00${employees.length + 1}`,
                  nik: formData.get('nik') as string,
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                  phone: formData.get('phone') as string,
                  gender: (formData.get('gender') as any) || 'Laki-laki',
                  birthPlace: formData.get('birthPlace') as string,
                  birthDate: formData.get('birthDate') as string,
                  maritalStatus: (formData.get('maritalStatus') as any) || 'Single (TK)',
                  taxStatus: (formData.get('taxStatus') as any) || 'TK/0',
                  pph21PaidBy: (formData.get('pph21PaidBy') as 'Karyawan' | 'Perusahaan') || 'Karyawan',
                  pph21Scheme: formData.get('pph21PaidBy') === 'Perusahaan' ? 'Ditanggung Perusahaan (Nett / Gross Up)' : 'Ditanggung Karyawan (Gross)',
                  address: formData.get('address') as string,
                  domicileAddress: formData.get('domicileAddress') as string,
                  emergencyContact: formData.get('emergencyContact') as string,
                  emergencyPhone: formData.get('emergencyPhone') as string,
                  emergencyRelation: formData.get('emergencyRelation') as string,
                  department: formData.get('department') as string,
                  position: formData.get('position') as string,
                  employmentType: formData.get('employmentType') as any,
                  status: (formData.get('status') as any) || 'Active',
                  joinDate: formData.get('joinDate') as string,
                  workLocation: formData.get('workLocation') as string,
                  education: formData.get('education') as string,
                  baseSalary: Number(formData.get('baseSalary')),
                  transportAllowance: Number(formData.get('transportAllowance')),
                  mealAllowance: Number(formData.get('mealAllowance')),
                  positionAllowance: Number(formData.get('positionAllowance')),
                  communicationAllowance: Number(formData.get('communicationAllowance')),
                  otherAllowances: Number(formData.get('otherAllowances')),
                  allowance: Number(formData.get('transportAllowance')) + Number(formData.get('mealAllowance')) + Number(formData.get('positionAllowance')),
                  bankName: formData.get('bankName') as string,
                  bankAccount: formData.get('bankAccount') as string,
                  bankAccountHolder: formData.get('bankAccountHolder') as string,
                  taxId: formData.get('taxId') as string,
                  bpjsKetenagakerjaan: formData.get('bpjsKetenagakerjaan') as string,
                  bpjsKesehatan: formData.get('bpjsKesehatan') as string,
                  bpjsKesehatanActive: formData.get('bpjsKesehatanActive') === 'on',
                  bpjsKetenagakerjaanActive: formData.get('bpjsKetenagakerjaanActive') === 'on'
                };

                if (editingEmployee && editingEmployee.id) {
                  await onUpdateEmployee(editingEmployee.id, data);
                } else {
                  await onAddEmployee(data as any);
                }
                setIsAddEmpModalOpen(false);
              }}
              className="flex flex-col flex-1 overflow-hidden min-h-0"
            >
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-medium flex-1">
                {/* Section 1: Data Identitas Personal */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-xs font-extrabold text-blue-700 block uppercase tracking-wider">
                    1. Data Diri, NIK & Status Pajak (PTKP)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">NIK Karyawan (ID)</label>
                      <input
                        type="text"
                        name="employeeCode"
                        defaultValue={editingEmployee?.employeeCode || `EMP-00${employees.length + 1}`}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">No. KTP 16 Digit</label>
                      <input
                        type="text"
                        name="nik"
                        maxLength={16}
                        defaultValue={editingEmployee?.nik || '3171012804950001'}
                        placeholder="3171xxxxxxxxxxxx"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={editingEmployee?.name || ''}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Perusahaan</label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={editingEmployee?.email || ''}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">No. HP / WhatsApp</label>
                      <input
                        type="text"
                        name="phone"
                        defaultValue={editingEmployee?.phone || ''}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                      <select
                        name="gender"
                        defaultValue={editingEmployee?.gender || 'Laki-laki'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                      <input
                        type="text"
                        name="birthPlace"
                        defaultValue={editingEmployee?.birthPlace || 'Jakarta'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                      <input
                        type="date"
                        name="birthDate"
                        defaultValue={editingEmployee?.birthDate || '1995-04-12'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Status Pajak (PTKP)</label>
                      <select
                        name="taxStatus"
                        defaultValue={editingEmployee?.taxStatus || 'TK/0'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="TK/0">TK/0 (Tidak Kawin, 0 Tanggungan - Rp 54jt)</option>
                        <option value="TK/1">TK/1 (Tidak Kawin, 1 Tanggungan - Rp 58.5jt)</option>
                        <option value="TK/2">TK/2 (Tidak Kawin, 2 Tanggungan - Rp 63jt)</option>
                        <option value="TK/3">TK/3 (Tidak Kawin, 3 Tanggungan - Rp 67.5jt)</option>
                        <option value="K/0">K/0 (Kawin, 0 Tanggungan - Rp 58.5jt)</option>
                        <option value="K/1">K/1 (Kawin, 1 Tanggungan - Rp 63jt)</option>
                        <option value="K/2">K/2 (Kawin, 2 Tanggungan - Rp 67.5jt)</option>
                        <option value="K/3">K/3 (Kawin, 3 Tanggungan - Rp 72jt)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Sesuai KTP</label>
                      <input
                        type="text"
                        name="address"
                        defaultValue={editingEmployee?.address || 'Jl. Sudirman No. 45, Jakarta Selatan'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Domisili Saat Ini</label>
                      <input
                        type="text"
                        name="domicileAddress"
                        defaultValue={editingEmployee?.domicileAddress || editingEmployee?.address || 'Jl. Sudirman No. 45, Jakarta Selatan'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Data Kepegawaian & Penempatan */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-xs font-extrabold text-indigo-700 block uppercase tracking-wider">
                    2. Kepegawaian, Departemen & Pendidikan
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Departemen</label>
                      <input
                        type="text"
                        name="department"
                        defaultValue={editingEmployee?.department || 'Engineering'}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Posisi</label>
                      <input
                        type="text"
                        name="position"
                        defaultValue={editingEmployee?.position || 'Software Engineer'}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kontrak Kerja</label>
                      <select
                        name="employmentType"
                        defaultValue={editingEmployee?.employmentType || 'Full-Time'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Full-Time">Full-Time (Tetap)</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract (PKWT)</option>
                        <option value="Internship">Internship (Magang)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Bergabung</label>
                      <input
                        type="date"
                        name="joinDate"
                        defaultValue={editingEmployee?.joinDate || new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Kerja Utama</label>
                      <input
                        type="text"
                        name="workLocation"
                        defaultValue={editingEmployee?.workLocation || 'Head Office Jakarta'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pendidikan Terakhir</label>
                      <select
                        name="education"
                        defaultValue={editingEmployee?.education || 'S1'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="S1">S1 / Sarjana</option>
                        <option value="S2">S2 / Magister</option>
                        <option value="D3">D3 / Diploma</option>
                        <option value="SMA/SMK">SMA / SMK</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Rincian Gaji Pokok & Tunjangan Multi-Komponen */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-xs font-extrabold text-emerald-700 block uppercase tracking-wider">
                    3. Rincian Gaji Pokok & Tunjangan Tetap (Multi-Komponen)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Gaji Pokok (Base Salary)</label>
                      <input
                        type="number"
                        name="baseSalary"
                        defaultValue={editingEmployee?.baseSalary || 12000000}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tunjangan Transportasi</label>
                      <input
                        type="number"
                        name="transportAllowance"
                        defaultValue={editingEmployee?.transportAllowance || 1000000}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tunjangan Uang Makan</label>
                      <input
                        type="number"
                        name="mealAllowance"
                        defaultValue={editingEmployee?.mealAllowance || 750000}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tunjangan Jabatan</label>
                      <input
                        type="number"
                        name="positionAllowance"
                        defaultValue={editingEmployee?.positionAllowance || 1500000}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tunjangan Pulsa/Komunikasi</label>
                      <input
                        type="number"
                        name="communicationAllowance"
                        defaultValue={editingEmployee?.communicationAllowance || 250000}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tunjangan Lainnya</label>
                      <input
                        type="number"
                        name="otherAllowances"
                        defaultValue={editingEmployee?.otherAllowances || 0}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Data Rekening Bank & Identifikasi BPJS/NPWP */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <span className="text-xs font-extrabold text-slate-800 block uppercase tracking-wider">
                    4. Data Bank, NPWP & Integrasi BPJS (Otomatis)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Bank Transfer</label>
                      <input
                        type="text"
                        name="bankName"
                        defaultValue={editingEmployee?.bankName || 'BCA'}
                        placeholder="BCA / Mandiri / BNI"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Rekening Bank</label>
                      <input
                        type="text"
                        name="bankAccount"
                        defaultValue={editingEmployee?.bankAccount || '8830192831'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pemilik Rekening</label>
                      <input
                        type="text"
                        name="bankAccountHolder"
                        defaultValue={editingEmployee?.bankAccountHolder || editingEmployee?.name || ''}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">No. NPWP Pajak</label>
                      <input
                        type="text"
                        name="taxId"
                        defaultValue={editingEmployee?.taxId || '71.283.910.2-015.000'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">No. BPJS Kesehatan</label>
                      <input
                        type="text"
                        name="bpjsKesehatan"
                        defaultValue={editingEmployee?.bpjsKesehatan || '000182930192'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">No. BPJS Ketenagakerjaan</label>
                      <input
                        type="text"
                        name="bpjsKetenagakerjaan"
                        defaultValue={editingEmployee?.bpjsKetenagakerjaan || '21098293012'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        name="bpjsKesehatanActive"
                        defaultChecked={editingEmployee?.bpjsKesehatanActive !== false}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span>Potong BPJS Kesehatan (1% Pekerja, 4% Perusahaan)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        name="bpjsKetenagakerjaanActive"
                        defaultChecked={editingEmployee?.bpjsKetenagakerjaanActive !== false}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span>Potong BPJS Ketenagakerjaan (JHT 2%, JP 1%)</span>
                    </label>
                  </div>
                </div>

                {/* Section 5: Pengaturan Skema PPh 21 (Ditanggung Perusahaan vs Ditanggung Karyawan) */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-800 block uppercase tracking-wider">
                      5. Skema Pajak PPh 21 (TER PP 58/2023 & PMK 168/2023)
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded-md">
                      Opsi Payroll
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Penanggung Pajak PPh Pasal 21:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-start gap-3 p-3 bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-400 rounded-xl cursor-pointer transition-all">
                        <input
                          type="radio"
                          name="pph21PaidBy"
                          value="Perusahaan"
                          defaultChecked={
                            editingEmployee?.pph21PaidBy === 'Perusahaan' ||
                            editingEmployee?.pph21Scheme === 'Ditanggung Perusahaan (Nett / Gross Up)' ||
                            editingEmployee?.pph21Scheme === 'Nett' ||
                            editingEmployee?.pph21Scheme === 'GrossUp'
                          }
                          className="mt-0.5 w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-emerald-800">Ditanggung Perusahaan</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">Nett / Gross-Up</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            PPh 21 bulanan <strong>disubsidi / ditanggung penuh oleh perusahaan</strong>. Karyawan menerima Take Home Pay tanpa potongan PPh 21 (Potongan PPh 21 = Rp 0).
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-400 rounded-xl cursor-pointer transition-all">
                        <input
                          type="radio"
                          name="pph21PaidBy"
                          value="Karyawan"
                          defaultChecked={
                            editingEmployee?.pph21PaidBy !== 'Perusahaan' &&
                            editingEmployee?.pph21Scheme !== 'Ditanggung Perusahaan (Nett / Gross Up)' &&
                            editingEmployee?.pph21Scheme !== 'Nett' &&
                            editingEmployee?.pph21Scheme !== 'GrossUp'
                          }
                          className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-800">Ditanggung Karyawan</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-200 text-slate-800 rounded">Gross Scheme</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            PPh 21 bulanan dihitung berdasarkan tarif TER resmi dan <strong>dipotong langsung</strong> dari gaji kotor pada slip gaji karyawan.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-2 shrink-0">
                {editingEmployee && editingEmployee.id && isAdminOrAbove ? (
                  <button
                    type="button"
                    onClick={() => {
                      const id = editingEmployee.id;
                      setIsAddEmpModalOpen(false);
                      onDeleteEmployee(id);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Karyawan</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddEmpModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
                  >
                    Simpan Data Karyawan Enterprise
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL SLIP GAJI ENTERPRISE (PRINTABLE PAYSLIP WITH BPJS & PPH 21) --- */}
      {selectedPayslip && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPayslip(null);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 print:max-h-none print:shadow-none print:border-none">
            {/* Header Slip Gaji */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
              <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Slip Gaji Enterprise Resmi ({selectedPayslip.periodName})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPayslipPDF(selectedPayslip)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Unduh format PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayslip(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Header Company Details */}
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    {companyProfile?.logoUrl ? (
                      <img
                        src={companyProfile.logoUrl}
                        alt="Company Logo"
                        className="w-10 h-10 rounded-xl object-contain bg-slate-50 p-1 border border-slate-200 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm shrink-0">
                        {(companyProfile?.companyName || 'E').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-xl font-black tracking-tight text-slate-900">
                        {companyProfile?.companyName || 'ErmApps Enterprise HRIS'}
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {(companyProfile?.legalName || 'PT ERMAPPS DIGITAL NUSANTARA').toUpperCase()} — PENGGAJIAN TERINTEGRASI
                      </p>
                      {companyProfile?.address && (
                        <p className="text-[10px] text-slate-400">
                          {companyProfile.address}, {companyProfile.city || ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-extrabold px-2.5 py-1 bg-slate-100 rounded-lg text-blue-600 border border-slate-200">
                    {selectedPayslip.payrollCode}
                  </span>
                  <p className="text-xs font-extrabold text-slate-800 mt-2">PERIODE: {selectedPayslip.periodName.toUpperCase()}</p>
                  <p className="text-[10px] text-slate-400">Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              {/* Info Karyawan Grid */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Nama Karyawan</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedPayslip.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">NIK Karyawan</span>
                  <span className="font-mono font-bold text-slate-800">{selectedPayslip.employeeCode || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Departemen / Jabatan</span>
                  <span className="font-bold text-slate-800">{selectedPayslip.department} — {selectedPayslip.position}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Status PTKP Pajak</span>
                  <span className="font-extrabold text-indigo-700">{selectedPayslip.taxStatus || 'TK/0'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Metode Pajak</span>
                  <span className="font-bold text-slate-800">{selectedPayslip.pph21Method || 'TER (PMK 168/2023)'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Kategori & Tarif TER</span>
                  <span className="font-bold text-indigo-700">
                    {selectedPayslip.terCategory || 'TER A'} ({selectedPayslip.terRatePercent ?? 0}%)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Status NPWP</span>
                  <span className={`font-bold ${selectedPayslip.hasNPWP !== false ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {selectedPayslip.hasNPWP !== false ? 'Ber-NPWP' : 'Tanpa NPWP (+20%)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Bank & Rekening</span>
                  <span className="font-bold text-slate-800">{selectedPayslip.bankName || 'BCA'} ({selectedPayslip.bankAccount || '-'})</span>
                </div>
              </div>

              {/* Earning & Deduction Multi-Column Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* PENERIMAAN (EARNINGS) */}
                <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-200/80 space-y-2">
                  <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                    <h4 className="font-extrabold text-emerald-900 text-xs tracking-wider uppercase">1. PENERIMAAN (EARNINGS)</h4>
                    <span className="text-[10px] font-bold text-emerald-700">NOMINAL</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-emerald-100/60">
                    <span className="text-slate-700 font-medium">Gaji Pokok (Base Salary)</span>
                    <span className="font-bold text-slate-900">{formatMoney(selectedPayslip.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100/60">
                    <span className="text-slate-700 font-medium">Tunjangan Transportasi</span>
                    <span className="font-semibold text-slate-800">{formatMoney(selectedPayslip.transportAllowance || 0)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100/60">
                    <span className="text-slate-700 font-medium">Tunjangan Uang Makan</span>
                    <span className="font-semibold text-slate-800">{formatMoney(selectedPayslip.mealAllowance || 0)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100/60">
                    <span className="text-slate-700 font-medium">Tunjangan Jabatan</span>
                    <span className="font-semibold text-slate-800">{formatMoney(selectedPayslip.positionAllowance || 0)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100/60">
                    <span className="text-slate-700 font-medium">Tunjangan Pulsa / WA</span>
                    <span className="font-semibold text-slate-800">{formatMoney(selectedPayslip.communicationAllowance || 0)}</span>
                  </div>
                  {Boolean(selectedPayslip.otherAllowances) && (
                    <div className="flex justify-between py-1 border-b border-emerald-100/60">
                      <span className="text-slate-700 font-medium">Tunjangan Lainnya</span>
                      <span className="font-semibold text-slate-800">{formatMoney(selectedPayslip.otherAllowances || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-emerald-100/60">
                    <span className="text-slate-700 font-medium">Upah Lembur (Overtime)</span>
                    <span className="font-semibold text-slate-800">{formatMoney(selectedPayslip.overtimePay)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100/60">
                    <span className="text-slate-700 font-medium">Bonus / Insentif THR</span>
                    <span className="font-semibold text-slate-800">{formatMoney(selectedPayslip.bonus)}</span>
                  </div>

                  <div className="flex justify-between pt-2 text-emerald-950 font-black text-xs">
                    <span>TOTAL PENERIMAAN KOTOR:</span>
                    <span>{formatMoney(selectedPayslip.grossSalary || (selectedPayslip.baseSalary + selectedPayslip.allowances + selectedPayslip.overtimePay + selectedPayslip.bonus))}</span>
                  </div>
                </div>

                {/* POTONGAN (DEDUCTIONS) */}
                <div className="bg-rose-50/40 rounded-2xl p-4 border border-rose-200/80 space-y-2">
                  <div className="flex justify-between items-center border-b border-rose-200 pb-2">
                    <h4 className="font-extrabold text-rose-900 text-xs tracking-wider uppercase">2. POTONGAN (DEDUCTIONS)</h4>
                    <span className="text-[10px] font-bold text-rose-700">NOMINAL</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-rose-100/60">
                    <span className="text-slate-700 font-medium">BPJS Kesehatan (1% Pekerja)</span>
                    <span className="font-semibold text-rose-700">-{formatMoney(selectedPayslip.bpjsKesehatanEmployee || Math.round(selectedPayslip.bpjsAmount * 0.25))}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-rose-100/60">
                    <span className="text-slate-700 font-medium">BPJS TK - JHT (2% Pekerja)</span>
                    <span className="font-semibold text-rose-700">-{formatMoney(selectedPayslip.bpjsJHTEmployee || Math.round(selectedPayslip.bpjsAmount * 0.5))}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-rose-100/60">
                    <span className="text-slate-700 font-medium">BPJS TK - JP (1% Pekerja)</span>
                    <span className="font-semibold text-rose-700">-{formatMoney(selectedPayslip.bpjsJPEmployee || Math.round(selectedPayslip.bpjsAmount * 0.25))}</span>
                  </div>
                  
                  {/* PPh 21 Deduction Line */}
                  <div className="flex justify-between py-1 border-b border-rose-100/60">
                    <div>
                      <span className="text-slate-700 font-medium block">Pajak PPh 21 (TER PMK 168)</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-indigo-700">
                          {selectedPayslip.terCategory || 'TER A'} ({selectedPayslip.terRatePercent ?? 0}%)
                          {selectedPayslip.npwpSurchargeApplied ? ' + Surcharge 20%' : ''}
                        </span>
                        {selectedPayslip.pph21PaidBy === 'Perusahaan' || (selectedPayslip.pph21EmployeeDeduction === 0 && (selectedPayslip.pph21Amount || 0) > 0) ? (
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded">
                            Ditanggung Perusahaan
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[9px] font-semibold rounded">
                            Ditanggung Karyawan
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedPayslip.pph21PaidBy === 'Perusahaan' || (selectedPayslip.pph21EmployeeDeduction === 0 && (selectedPayslip.pph21Amount || 0) > 0) ? (
                      <div className="text-right">
                        <span className="font-bold text-emerald-700">Rp 0</span>
                        <span className="text-[9px] text-emerald-600 font-medium block">Disubsidi Rp {formatMoney(selectedPayslip.pph21PaidByEmployer || selectedPayslip.pph21Amount || 0)}</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-rose-700">-{formatMoney(selectedPayslip.pph21EmployeeDeduction !== undefined ? selectedPayslip.pph21EmployeeDeduction : (selectedPayslip.pph21Amount || 0))}</span>
                    )}
                  </div>

                  <div className="flex justify-between py-1 border-b border-rose-100/60">
                    <span className="text-slate-700 font-medium">Potongan Mangkir (Alpha)</span>
                    <span className="font-semibold text-rose-700">-{formatMoney(selectedPayslip.unpaidLeaveDeduction || 0)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-rose-100/60">
                    <span className="text-slate-700 font-medium">Potongan Keterlambatan</span>
                    <span className="font-semibold text-rose-700">-{formatMoney(selectedPayslip.lateDeduction || 0)}</span>
                  </div>
                  {Boolean(selectedPayslip.otherDeductions) && (
                    <div className="flex justify-between py-1 border-b border-rose-100/60">
                      <span className="text-slate-700 font-medium">Potongan Lain (Kasbon)</span>
                      <span className="font-semibold text-rose-700">-{formatMoney(selectedPayslip.otherDeductions || 0)}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 text-rose-950 font-black text-xs">
                    <span>TOTAL SELURUH POTONGAN:</span>
                    <span>-{formatMoney(selectedPayslip.totalDeductionsAll || (selectedPayslip.bpjsAmount + (selectedPayslip.pph21EmployeeDeduction !== undefined ? selectedPayslip.pph21EmployeeDeduction : (selectedPayslip.pph21Amount || 0)) + selectedPayslip.deductions))}</span>
                  </div>
                </div>
              </div>

              {/* Tanggungan Perusahaan Sub-Section (Informatif & Transparan) */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 uppercase text-[11px]">
                  <span>3. TANGGUNGAN PERUSAHAAN (EMPLOYER CONTRIBUTIONS):</span>
                  <span className="text-indigo-800 font-black">
                    Total Beban: {formatMoney(selectedPayslip.employerTotalCost || ((selectedPayslip.grossSalary || 0) + (selectedPayslip.totalBPJSEmployer || 0) + (selectedPayslip.pph21PaidByEmployer || 0)))}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Iuran BPJS Perusahaan (Health + TK 10.24%):</span>
                    <span className="font-bold text-slate-900">{formatMoney(selectedPayslip.totalBPJSEmployer || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subsidi PPh 21 TER Perusahaan:</span>
                    <span className={`font-bold ${(selectedPayslip.pph21PaidByEmployer || (selectedPayslip.pph21PaidBy === 'Perusahaan' ? selectedPayslip.pph21Amount : 0)) ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {formatMoney(selectedPayslip.pph21PaidByEmployer || (selectedPayslip.pph21PaidBy === 'Perusahaan' ? selectedPayslip.pph21Amount : 0) || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total THP Highlight */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-4 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-blue-500/10">
                <div>
                  <span className="text-xs uppercase font-extrabold text-blue-200 tracking-wider">GAJI BERSIH DITERIMA (TAKE HOME PAY)</span>
                  <p className="text-2xl sm:text-3xl font-black">{formatMoney(selectedPayslip.netSalary)}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black backdrop-blur-sm border border-white/30">
                    STATUS: {selectedPayslip.paymentStatus.toUpperCase()}
                  </span>
                  <p className="text-[10px] text-blue-200 mt-1 font-mono">Transfer via {selectedPayslip.bankName || 'BCA'}</p>
                </div>
              </div>

              {/* Signatures & Footer */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p className="text-slate-400 font-semibold mb-12">Penerima Karyawan,</p>
                  <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 uppercase">{selectedPayslip.employeeName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold mb-12">Disetujui HR & Finance Admin,</p>
                  <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 uppercase">
                    {companyProfile?.signatoryName || 'Nabila Putri'} ({companyProfile?.signatoryTitle || 'HR Manager'})
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-2 flex-wrap shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayslip(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                {isAdminOrAbove && selectedPayslip?.id && onDeletePayroll && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = selectedPayslip.id;
                      setSelectedPayslip(null);
                      onDeletePayroll(id);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Slip Gaji</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const category = selectedPayslip.terCategory || 'TER A';
                    setTerActiveCategory(category);
                    setIsTERModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Cek Tabel {selectedPayslip.terCategory || 'TER'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintPayslip}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Cetak lewat jendela browser"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Cetak Browser</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPayslipPDF(selectedPayslip)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-colors cursor-pointer"
                  title="Generate dan download dokumen PDF resmi berlogo perusahaan"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Dokumen PDF Resmi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL PENGAJUAN CUTI --- */}
      {isAddLeaveModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddLeaveModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md flex flex-col max-h-[88vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-400" />
                Form Pengajuan Cuti / Izin
              </h3>
              <button
                type="button"
                onClick={() => setIsAddLeaveModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs font-medium flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Karyawan</label>
                  <select
                    value={leaveEmpId}
                    onChange={(e) => setLeaveEmpId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {(isAdminOrAbove ? employees : filteredEmployees).map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Cuti</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Cuti Tahunan">Cuti Tahunan</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Izin Menikah">Izin Menikah</option>
                    <option value="Melahirkan">Melahirkan</option>
                    <option value="Cuti Penting">Cuti Penting</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mulai Tanggal</label>
                    <input
                      type="date"
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sampai Tanggal</label>
                    <input
                      type="date"
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Pengajuan</label>
                  <textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Sebutkan keperluan cuti..."
                    rows={3}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddLeaveModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-colors"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL ABSENSI FOTO & GEOTAG GPS --- */}
      {selectedAttDetail && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedAttDetail(null);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold">{selectedAttDetail.employeeName}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {selectedAttDetail.employeeCode} • {selectedAttDetail.date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAttDetail(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Status Badge & Work Location */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Kehadiran</p>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                      selectedAttDetail.status === 'Hadir'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedAttDetail.status === 'Terlambat'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {selectedAttDetail.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lokasi Kerja</p>
                  <p className="font-bold text-slate-800 mt-1">{selectedAttDetail.workLocation}</p>
                </div>
              </div>

              {/* Photos Section */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>Foto Selfie Verification</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Check-In Photo */}
                  <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-2 text-white text-center space-y-1">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Check-In ({selectedAttDetail.checkIn || '-'})
                    </p>
                    {selectedAttDetail.checkInPhoto || selectedAttDetail.photoUrl || selectedAttDetail.photoSimulated ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-800">
                        <img
                          src={selectedAttDetail.checkInPhoto || selectedAttDetail.photoUrl || selectedAttDetail.photoSimulated}
                          alt="Check In Selfie"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm text-emerald-400 text-[9px] font-mono font-bold rounded">
                          VERIFIED
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 text-[11px] italic">
                        Tidak Ada Foto
                      </div>
                    )}
                  </div>

                  {/* Check-Out Photo */}
                  <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 p-2 text-white text-center space-y-1">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Check-Out ({selectedAttDetail.checkOut || '-'})
                    </p>
                    {selectedAttDetail.checkOutPhoto ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-800">
                        <img
                          src={selectedAttDetail.checkOutPhoto}
                          alt="Check Out Selfie"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm text-amber-400 text-[9px] font-mono font-bold rounded">
                          VERIFIED
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 text-[11px] italic">
                        {selectedAttDetail.checkOut ? 'Foto Otomatis Terverifikasi' : 'Belum Check-Out'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Geotagging GPS Location */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Geotagging Lokasi GPS Satelit</span>
                </h4>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  {selectedAttDetail.latitude && selectedAttDetail.longitude ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {selectedAttDetail.latitude}, {selectedAttDetail.longitude}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${selectedAttDetail.latitude},${selectedAttDetail.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-sm flex items-center gap-1 transition-all"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Buka Google Maps</span>
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {selectedAttDetail.locationAddress || selectedAttDetail.geotag || 'Lokasi terverifikasi oleh perangkat GPS satelit.'}
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Geotagging Aktif: Real GPS Coordinates Saved</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                        Verified WFO
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hours & Notes */}
              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Jam Kerja Effective</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedAttDetail.hoursWorked || 8} Jam</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Lembur Recorded</span>
                  <p className="font-bold text-amber-600 mt-0.5">{selectedAttDetail.overtimeHours || 0} Jam</p>
                </div>
              </div>

              {selectedAttDetail.notes && (
                <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl">
                  <span className="text-[10px] text-blue-600 font-bold uppercase">Catatan Karyawan</span>
                  <p className="text-slate-700 mt-0.5">{selectedAttDetail.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAttDetail(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow transition-all"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL TABEL & SIMULATOR TER PPh 21 (PP 58/2023 & PMK 168/2023) --- */}
      {isTERModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTERModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                  <TableIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold flex items-center gap-2">
                    <span>Tabel Referensi Resmi TER PPh 21</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                      PP 58/2023 & PMK 168/2023
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tarif Efektif Rata-Rata Bulanan PPh Pasal 21 — Berlaku Efektif Mulai 1 Januari 2024
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTERModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setTerActiveCategory('TER A')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    terActiveCategory === 'TER A'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>Kategori TER A</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${terActiveCategory === 'TER A' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
                    44 Lapisan
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTerActiveCategory('TER B')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    terActiveCategory === 'TER B'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>Kategori TER B</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${terActiveCategory === 'TER B' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
                    40 Lapisan
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTerActiveCategory('TER C')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    terActiveCategory === 'TER C'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>Kategori TER C</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${terActiveCategory === 'TER C' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'}`}>
                    41 Lapisan
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTerActiveCategory('PTKP')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    terActiveCategory === 'PTKP'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>Tabel PTKP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTerActiveCategory('SIMULATOR')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    terActiveCategory === 'SIMULATOR'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Kalkulator & Simulator</span>
                </button>
              </div>

              {terActiveCategory !== 'PTKP' && terActiveCategory !== 'SIMULATOR' && (
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari bruto / tarif..."
                    value={terSearchQuery}
                    onChange={(e) => setTerSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              )}
            </div>

            {/* Modal Body Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* Category Intro Banners */}
              {terActiveCategory === 'TER A' && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-indigo-950 block text-sm">
                      Kategori TER A Diterapkan Untuk Status PTKP: TK/0, TK/1, K/0
                    </span>
                    <p className="text-indigo-900 mt-1 leading-relaxed">
                      Terdiri atas <strong>44 Lapisan Tarif Efektif</strong> mulai dari tarif <strong>0%</strong> (s.d. Rp 5.400.000/bulan) hingga tarif tertinggi <strong>34%</strong> (di atas Rp 1,4 Miliar/bulan).
                    </p>
                  </div>
                </div>
              )}

              {terActiveCategory === 'TER B' && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-indigo-950 block text-sm">
                      Kategori TER B Diterapkan Untuk Status PTKP: TK/2, TK/3, K/1, K/2
                    </span>
                    <p className="text-indigo-900 mt-1 leading-relaxed">
                      Terdiri atas <strong>40 Lapisan Tarif Efektif</strong> mulai dari tarif <strong>0%</strong> (s.d. Rp 6.200.000/bulan) hingga tarif tertinggi <strong>34%</strong> (di atas Rp 1,405 Miliar/bulan).
                    </p>
                  </div>
                </div>
              )}

              {terActiveCategory === 'TER C' && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-indigo-950 block text-sm">
                      Kategori TER C Diterapkan Untuk Status PTKP: K/3
                    </span>
                    <p className="text-indigo-900 mt-1 leading-relaxed">
                      Terdiri atas <strong>41 Lapisan Tarif Efektif</strong> mulai dari tarif <strong>0%</strong> (s.d. Rp 6.600.000/bulan) hingga tarif tertinggi <strong>34%</strong> (di atas Rp 1,419 Miliar/bulan).
                    </p>
                  </div>
                </div>
              )}

              {/* TABLES FOR TER A, B, C */}
              {(terActiveCategory === 'TER A' || terActiveCategory === 'TER B' || terActiveCategory === 'TER C') && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3 text-center w-12">No</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Status PTKP</th>
                        <th className="p-3 text-right">Min Bruto Bulanan</th>
                        <th className="p-3 text-right">Max Bruto Bulanan</th>
                        <th className="p-3 text-center">Tarif TER</th>
                        <th className="p-3 text-right">Contoh Pajak (Atas Max)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(() => {
                        const tableData =
                          terActiveCategory === 'TER A'
                            ? TER_A_TABLE
                            : terActiveCategory === 'TER B'
                            ? TER_B_TABLE
                            : TER_C_TABLE;

                        const filtered = tableData.filter((row) => {
                          if (!terSearchQuery) return true;
                          const q = terSearchQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
                          const noStr = String(row.no);
                          const rateStr = String(row.rate);
                          const minStr = String(row.minGross);
                          const maxStr = String(row.maxGross);
                          return (
                            noStr.includes(q) ||
                            rateStr.includes(q) ||
                            minStr.includes(q) ||
                            maxStr.includes(q) ||
                            row.category.toLowerCase().includes(q) ||
                            row.statusPTKP.toLowerCase().includes(q)
                          );
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                                Tidak ada lapisan tarif yang sesuai dengan pencarian "{terSearchQuery}".
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((row) => {
                          const isZero = row.rate === 0;
                          const maxGrossVal = row.maxGross === Infinity ? row.minGross : row.maxGross;
                          const sampleTax = Math.round(maxGrossVal * (row.rate / 100));

                          return (
                            <tr
                              key={row.no}
                              className={`hover:bg-indigo-50/40 transition-colors ${
                                isZero ? 'bg-emerald-50/20' : ''
                              }`}
                            >
                              <td className="p-3 text-center font-bold text-slate-500">{row.no}</td>
                              <td className="p-3 font-extrabold text-indigo-700">{row.category}</td>
                              <td className="p-3 font-semibold text-slate-700">
                                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-mono font-bold">
                                  {row.statusPTKP}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-slate-800">
                                {formatMoney(row.minGross)}
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-slate-800">
                                {row.maxGross === Infinity ? 'Tidak Terbatas' : formatMoney(row.maxGross)}
                              </td>
                              <td className="p-3 text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono inline-block ${
                                    isZero
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                  }`}
                                >
                                  {row.rate}%
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono font-semibold text-rose-700">
                                {isZero ? 'Rp 0 (Bebas Pajak)' : formatMoney(sampleTax)}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PTKP SUMMARY VIEW */}
              {terActiveCategory === 'PTKP' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
                    <h4 className="font-extrabold text-slate-900 text-sm mb-1">
                      Daftar Status PTKP & Pemetaan Kategori TER (PP 58/2023)
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      Penghasilan Tidak Kena Pajak (PTKP) menentukan kategori tarif efektif bulanan yang digunakan untuk pemotongan PPh 21 pegawai tetap.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(PTKP_REFERENCE).map(([ptkpCode, item]) => (
                      <div
                        key={ptkpCode}
                        className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-slate-900 text-white rounded-xl text-xs font-extrabold font-mono">
                            {ptkpCode}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold ${
                              item.terCategory === 'TER A'
                                ? 'bg-blue-100 text-blue-800'
                                : item.terCategory === 'TER B'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {item.terCategory}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.description}</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            PTKP Tahunan:{' '}
                            <strong className="text-slate-900 font-mono font-extrabold">
                              {formatMoney(item.ptkpYearly)}
                            </strong>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SIMULATOR & TESTER VIEW */}
              {terActiveCategory === 'SIMULATOR' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Input Form */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-emerald-600" />
                      <span>Parameter Simulasi TER PPh 21</span>
                    </h4>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Penghasilan Bruto Sebulan (Gross Salary + Tunjangan)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                        <input
                          type="number"
                          value={simGrossSalary}
                          onChange={(e) => setSimGrossSalary(Math.max(0, Number(e.target.value)))}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          step={500000}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        Terbilang: {formatMoney(simGrossSalary)}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Status PTKP (Keluarga / Tanggungan)
                      </label>
                      <select
                        value={simTaxStatus}
                        onChange={(e) => setSimTaxStatus(e.target.value as PTKPStatus)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="TK/0">TK/0 — Tidak Kawin, 0 Tanggungan (TER A)</option>
                        <option value="TK/1">TK/1 — Tidak Kawin, 1 Tanggungan (TER A)</option>
                        <option value="K/0">K/0 — Kawin, 0 Tanggungan (TER A)</option>
                        <option value="TK/2">TK/2 — Tidak Kawin, 2 Tanggungan (TER B)</option>
                        <option value="TK/3">TK/3 — Tidak Kawin, 3 Tanggungan (TER B)</option>
                        <option value="K/1">K/1 — Kawin, 1 Tanggungan (TER B)</option>
                        <option value="K/2">K/2 — Kawin, 2 Tanggungan (TER B)</option>
                        <option value="K/3">K/3 — Kawin, 3 Tanggungan (TER C)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Kepemilikan NPWP
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSimHasNPWP(true)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            simHasNPWP
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          ✓ Memiliki NPWP
                        </button>
                        <button
                          type="button"
                          onClick={() => setSimHasNPWP(false)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            !simHasNPWP
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          ✕ Tanpa NPWP (+20%)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Real-time Calculation Result */}
                  {(() => {
                    const terResult = getTERCategoryAndRate(simTaxStatus, simGrossSalary);
                    const baseTax = Math.round(simGrossSalary * (terResult.ratePercent / 100));
                    const finalTax = simHasNPWP ? baseTax : Math.round(baseTax * 1.2);
                    const estimatedTHP = Math.max(0, simGrossSalary - finalTax);

                    return (
                      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">
                                Hasil Perhitungan TER
                              </span>
                              <span className="text-lg font-black text-white">
                                Kategori {terResult.category}
                              </span>
                            </div>
                            <span className="text-2xl font-black font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30">
                              {terResult.ratePercent}%
                            </span>
                          </div>

                          <div className="mt-4 space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-white/5">
                              <span className="text-slate-400">Penghasilan Bruto:</span>
                              <span className="font-mono font-bold text-white">{formatMoney(simGrossSalary)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/5">
                              <span className="text-slate-400">Status PTKP Terpilih:</span>
                              <span className="font-bold text-indigo-300">{simTaxStatus}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/5">
                              <span className="text-slate-400">Lapisan Rentang Bruto:</span>
                              <span className="font-mono text-slate-300 text-[11px]">
                                {formatMoney(terResult.minGross)} s.d.{' '}
                                {terResult.maxGross === Infinity
                                  ? 'Tak Terbatas'
                                  : formatMoney(terResult.maxGross)}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/5">
                              <span className="text-slate-400">Tarif Dasar TER:</span>
                              <span className="font-mono font-bold text-emerald-300">{terResult.ratePercent}%</span>
                            </div>
                            {!simHasNPWP && (
                              <div className="flex justify-between py-1 border-b border-white/5 text-amber-300">
                                <span>Surcharge Tanpa NPWP:</span>
                                <span className="font-mono font-bold">+20% (x1.20)</span>
                              </div>
                            )}
                            <div className="flex justify-between py-1.5 text-rose-300 font-extrabold text-sm border-t border-white/10 pt-2">
                              <span>Potongan PPh 21 Sebulan:</span>
                              <span className="font-mono">-{formatMoney(finalTax)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Estimasi Gaji Setelah PPh 21 (Sebelum BPJS)
                            </span>
                            <span className="text-base font-black text-white font-mono">
                              {formatMoney(estimatedTHP)}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-300 px-2 py-1 bg-indigo-900/60 rounded-lg">
                            PMK 168/2023
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
              <span className="text-slate-500 font-medium">
                Dasar Regulasi: <strong>PP No. 58/2023</strong> & <strong>PMK No. 168/2023</strong> (Kemenkeu & Dirjen Pajak RI)
              </span>
              <button
                type="button"
                onClick={() => setIsTERModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Tutup Referensi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI CHECK-OUT / PULANG --- */}
      {isCheckOutConfirmOpen && checkOutConfirmData && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCheckOutConfirmOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-rose-600 to-red-600 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setIsCheckOutConfirmOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-black/20 text-white/80 hover:text-white hover:bg-black/30 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-3">
                <AlertTriangle className="w-6 h-6 text-amber-200" />
              </div>
              <h3 className="text-lg font-black tracking-tight">Yakin mau keluar pulang!</h3>
              <p className="text-xs text-amber-100 font-medium mt-1">
                Konfirmasi proses Check-Out akhir jam kerja hari ini
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 text-sm">{checkOutConfirmData.empName}</span>
                  <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 font-mono font-extrabold text-[10px] rounded-md">
                    {checkOutConfirmData.empCode}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                  <div className="p-2 bg-white rounded-xl border border-amber-100">
                    <span className="text-[10px] text-slate-400 font-bold block">Jam Check-In</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">{checkOutConfirmData.checkInTime} WIB</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-amber-100">
                    <span className="text-[10px] text-slate-400 font-bold block">Jam Check-Out (Sekarang)</span>
                    <span className="font-mono font-bold text-rose-600 text-xs">{checkOutConfirmData.checkOutTime} WIB</span>
                  </div>
                </div>
              </div>

              {/* Photo & GPS preview */}
              {checkOutConfirmData.photo && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <img
                    src={checkOutConfirmData.photo}
                    alt="Selfie Check-Out"
                    className="w-12 h-12 object-cover rounded-xl border border-slate-300 shrink-0"
                  />
                  <div className="text-[11px] space-y-0.5">
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-blue-600" />
                      <span>Foto Selfie Check-Out Verified</span>
                    </p>
                    <p className="text-slate-500 text-[10px]">
                      Lokasi: {checkOutConfirmData.workLocation}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-slate-500 leading-relaxed text-center font-medium">
                Setelah dikonfirmasi, jam keluar akan disimpan dan data kehadiran ini otomatis tercatat secara permanen di <strong>Riwayat Daftar Kehadiran</strong>.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsCheckOutConfirmOpen(false)}
                className="py-3 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer text-center"
              >
                Batal / Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckOut}
                className="py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-rose-500/25 transition-all hover:scale-101 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Ya, Keluar Pulang!</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PAYROLL EXCEL EXPORT MODAL --- */}
      <PayrollExcelExportModal
        isOpen={isExcelExportModalOpen}
        onClose={() => setIsExcelExportModalOpen(false)}
        payrolls={payrolls}
        employees={employees}
        currentMonth={payrollMonth}
        currentYear={payrollYear}
        companyProfile={companyProfile}
        currency={currency}
        onSuccess={(msg) => setToastMessage(msg)}
      />

      {/* --- TOAST NOTIFICATION BANNER --- */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
