import React, { useState, useEffect } from 'react';
import { 
  ChangeRequest, 
  FamilyMember, 
  Contribution, 
  UserRole, 
  UserAccount, 
  AuditLog, 
  ClanSettings 
} from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  FileEdit, 
  Coins, 
  Eye, 
  AlertTriangle, 
  ArrowRight,
  UserPlus,
  Trash2,
  Download,
  Upload,
  Settings,
  Activity,
  Database,
  Lock,
  Unlock,
  RefreshCw,
  FileSpreadsheet,
  Building,
  Crown,
  Search,
  Filter,
  Calendar,
  Sparkles,
  Save,
  KeyRound,
  LogIn,
  Palette,
  PanelTop,
  PanelBottom,
  Megaphone,
  CreditCard,
  QrCode
} from 'lucide-react';
import { generateVietQRUrl } from '../utils/vietqr';

interface AdminApprovalPanelProps {
  changeRequests: ChangeRequest[];
  members: FamilyMember[];
  contributions: Contribution[];
  currentRole: UserRole;
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  auditLogs: AuditLog[];
  clanSettings: ClanSettings;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onConfirmContribution: (contributionId: string) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onCreateAccount: (newAcc: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  onToggleLockAccount: (userId: string) => void;
  onResetUserPassword: (userId: string) => void;
  onDeleteAccount: (userId: string) => void;
  onUpdateClanSettings: (settings: ClanSettings) => void;
  onRestoreBackup: (data: { members: FamilyMember[]; contributions?: Contribution[] }) => void;
  onAddNewMemberDirect: () => void;
  onOpenLoginModal: () => void;
  onOpenEditContentModal?: (tab: 'header' | 'footer' | 'general') => void;
  saveStatus?: 'saved' | 'saving' | 'error';
  saveError?: string | null;
  lastSaved?: string | null;
  onForceSync?: () => Promise<void>;
}

export const AdminApprovalPanel: React.FC<AdminApprovalPanelProps> = ({
  changeRequests,
  members,
  contributions,
  currentRole,
  currentUser,
  accounts,
  auditLogs,
  clanSettings,
  onApproveRequest,
  onRejectRequest,
  onConfirmContribution,
  onUpdateUserRole,
  onCreateAccount,
  onToggleLockAccount,
  onResetUserPassword,
  onDeleteAccount,
  onUpdateClanSettings,
  onRestoreBackup,
  onAddNewMemberDirect,
  onOpenLoginModal,
  onOpenEditContentModal,
  saveStatus = 'saved',
  saveError = null,
  lastSaved = null,
  onForceSync
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'requests' | 'funds' | 'users' | 'logs' | 'backup' | 'settings'
  >('overview');
  
  const [rejectReasonInput, setRejectReasonInput] = useState<{ id: string; text: string } | null>(null);

  // New Account Form State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('liaison');
  const [newBranch, setNewBranch] = useState('Chi 1');
  const [newTitle, setNewTitle] = useState('');

  // Settings Form State - General, Header & Footer
  const [settingsClanName, setSettingsClanName] = useState(clanSettings.clanName);
  const [settingsBranchName, setSettingsBranchName] = useState(clanSettings.branchName);
  const [settingsHeadOfClan, setSettingsHeadOfClan] = useState(clanSettings.headOfClan);
  const [settingsHallAddress, setSettingsHallAddress] = useState(clanSettings.ancestralHallAddress);
  const [settingsWorshipDate, setSettingsWorshipDate] = useState(clanSettings.worshipDateLunar);
  const [settingsContactPhone, setSettingsContactPhone] = useState(clanSettings.contactPhone || '');
  const [settingsContactEmail, setSettingsContactEmail] = useState(clanSettings.contactEmail || '');

  // Header State
  const [settingsHeaderLogoText, setSettingsHeaderLogoText] = useState(clanSettings.headerLogoText || '阮');
  const [settingsHeaderTitle, setSettingsHeaderTitle] = useState(clanSettings.headerTitle || 'Gia Phả Họ Tộc Online');
  const [settingsHeaderSubtitle, setSettingsHeaderSubtitle] = useState(clanSettings.headerSubtitle || '');
  const [settingsHeaderBadgeText, setSettingsHeaderBadgeText] = useState(clanSettings.headerBadgeText || '');
  const [settingsHeaderEstText, setSettingsHeaderEstText] = useState(clanSettings.headerEstText || '');
  const [settingsHeaderAnnouncement, setSettingsHeaderAnnouncement] = useState(clanSettings.headerAnnouncement || '');
  const [settingsShowAnnouncement, setSettingsShowAnnouncement] = useState(clanSettings.showHeaderAnnouncement ?? true);

  // Footer State
  const [settingsFooterTitle, setSettingsFooterTitle] = useState(clanSettings.footerTitle || 'Gia Phả Họ Tộc Online');
  const [settingsFooterSubtitle, setSettingsFooterSubtitle] = useState(clanSettings.footerSubtitle || '');
  const [settingsFooterDescription, setSettingsFooterDescription] = useState(clanSettings.footerDescription || '');
  const [settingsFooterCopyright, setSettingsFooterCopyright] = useState(clanSettings.footerCopyright || '');
  const [settingsFooterLinksNote, setSettingsFooterLinksNote] = useState(clanSettings.footerLinksNote || '');

  // Bank Info State
  const [settingsBankName, setSettingsBankName] = useState(clanSettings.bankAccount.bankName);
  const [settingsAccountNumber, setSettingsAccountNumber] = useState(clanSettings.bankAccount.accountNumber);
  const [settingsAccountHolder, setSettingsAccountHolder] = useState(clanSettings.bankAccount.accountHolder);
  const [settingsBranchBank, setSettingsBranchBank] = useState(clanSettings.bankAccount.branchName);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  useEffect(() => {
    setSettingsClanName(clanSettings.clanName);
    setSettingsBranchName(clanSettings.branchName);
    setSettingsHeadOfClan(clanSettings.headOfClan);
    setSettingsHallAddress(clanSettings.ancestralHallAddress);
    setSettingsWorshipDate(clanSettings.worshipDateLunar);
    setSettingsContactPhone(clanSettings.contactPhone || '');
    setSettingsContactEmail(clanSettings.contactEmail || '');

    setSettingsHeaderLogoText(clanSettings.headerLogoText || '阮');
    setSettingsHeaderTitle(clanSettings.headerTitle || 'Gia Phả Họ Tộc Online');
    setSettingsHeaderSubtitle(clanSettings.headerSubtitle || '');
    setSettingsHeaderBadgeText(clanSettings.headerBadgeText || '');
    setSettingsHeaderEstText(clanSettings.headerEstText || '');
    setSettingsHeaderAnnouncement(clanSettings.headerAnnouncement || '');
    setSettingsShowAnnouncement(clanSettings.showHeaderAnnouncement ?? true);

    setSettingsFooterTitle(clanSettings.footerTitle || 'Gia Phả Họ Tộc Online');
    setSettingsFooterSubtitle(clanSettings.footerSubtitle || '');
    setSettingsFooterDescription(clanSettings.footerDescription || '');
    setSettingsFooterCopyright(clanSettings.footerCopyright || '');
    setSettingsFooterLinksNote(clanSettings.footerLinksNote || '');

    setSettingsBankName(clanSettings.bankAccount.bankName);
    setSettingsAccountNumber(clanSettings.bankAccount.accountNumber);
    setSettingsAccountHolder(clanSettings.bankAccount.accountHolder);
    setSettingsBranchBank(clanSettings.bankAccount.branchName);
  }, [clanSettings]);

  // Logs Filter State
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Computed metrics
  const pendingRequests = changeRequests.filter(r => r.status === 'pending');
  const pendingContributions = contributions.filter(c => c.status === 'pending');
  const confirmedContributions = contributions.filter(c => c.status === 'confirmed');
  const totalFundCollected = confirmedContributions.reduce((sum, c) => sum + c.amount, 0);
  const totalPendingFund = pendingContributions.reduce((sum, c) => sum + c.amount, 0);

  const maleMembers = members.filter(m => m.gender === 'male');
  const femaleMembers = members.filter(m => m.gender === 'female');
  const livingMembers = members.filter(m => m.isAlive);
  const deceasedMembers = members.filter(m => !m.isAlive);

  const isAdmin = currentRole === 'admin';

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Họ Và Tên',
      'Giới Tính',
      'Đời (Thế Hệ)',
      'Chi Phái',
      'Chức Danh / Danh Xưng',
      'Năm Sinh',
      'Năm Mất',
      'Tình Trạng',
      'Vợ / Chồng',
      'Số Điện Thoại',
      'Địa Chỉ Hiện Tại',
      'Nơi Công Tác',
      'Ngày Giỗ Âm Lịch',
      'Nơi An Táng'
    ];

    const rows = members.map(m => [
      m.id,
      `"${m.fullName}"`,
      m.gender === 'male' ? 'Nam' : 'Nữ',
      `"Đời ${m.generation}"`,
      `"${m.branch}"`,
      `"${m.title || ''}"`,
      m.birthYear,
      m.deathYear || '',
      m.isAlive ? 'Còn sống' : 'Đã mất',
      `"${m.spouseName || ''}"`,
      `"${m.phoneNumber || ''}"`,
      `"${m.currentAddress || ''}"`,
      `"${m.workplace || ''}"`,
      `"${m.lunarDeathDate || ''}"`,
      `"${m.burialPlace || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_gia_pha_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      exportTimestamp: new Date().toISOString(),
      clanName: clanSettings.clanName,
      branchName: clanSettings.branchName,
      version: '3.2',
      statistics: {
        totalMembers: members.length,
        totalContributions: contributions.length,
        totalAccounts: accounts.length
      },
      members,
      contributions,
      accounts: accounts.map(({ password, ...safeAcc }) => safeAcc),
      clanSettings
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sao_luu_gia_pha_toan_toc_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.members && Array.isArray(parsed.members)) {
          if (window.confirm(`Tìm thấy tệp sao lưu gồm ${parsed.members.length} thành viên. Bạn có chắc muốn khôi phục cơ sở dữ liệu phả đồ không?`)) {
            onRestoreBackup({
              members: parsed.members,
              contributions: parsed.contributions
            });
            alert('Khôi phục dữ liệu từ tệp sao lưu thành công!');
          }
        } else {
          alert('Tệp sao lưu không đúng định dạng chuẩn của hệ thống Gia Phả.');
        }
      } catch (err) {
        alert('Lỗi đọc tệp JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClanSettings({
      ...clanSettings,
      clanName: settingsClanName,
      branchName: settingsBranchName,
      headOfClan: settingsHeadOfClan,
      ancestralHallAddress: settingsHallAddress,
      worshipDateLunar: settingsWorshipDate,
      contactPhone: settingsContactPhone,
      contactEmail: settingsContactEmail,
      headerLogoText: settingsHeaderLogoText,
      headerTitle: settingsHeaderTitle,
      headerSubtitle: settingsHeaderSubtitle,
      headerBadgeText: settingsHeaderBadgeText,
      headerEstText: settingsHeaderEstText,
      headerAnnouncement: settingsHeaderAnnouncement,
      showHeaderAnnouncement: settingsShowAnnouncement,
      footerTitle: settingsFooterTitle,
      footerSubtitle: settingsFooterSubtitle,
      footerDescription: settingsFooterDescription,
      footerCopyright: settingsFooterCopyright,
      footerLinksNote: settingsFooterLinksNote,
      bankAccount: {
        ...clanSettings.bankAccount,
        bankName: settingsBankName,
        accountNumber: settingsAccountNumber,
        accountHolder: settingsAccountHolder,
        branchName: settingsBranchBank
      }
    });
    setSettingsSavedSuccess(true);
    setTimeout(() => setSettingsSavedSuccess(false), 2500);
  };

  // Create User Submit
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newUsername || !newEmail || !newPassword) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    onCreateAccount({
      username: newUsername.trim().toLowerCase(),
      email: newEmail.trim().toLowerCase(),
      fullName: newFullName.trim(),
      phone: newPhone.trim(),
      password: newPassword.trim(),
      role: newRole,
      branch: newBranch,
      title: newTitle.trim(),
      status: 'active'
    });

    setIsAddUserModalOpen(false);
    setNewFullName('');
    setNewUsername('');
    setNewEmail('');
    setNewPhone('');
    setNewPassword('');
    setNewTitle('');
    alert('Đã tạo tài khoản thành công!');
  };

  // Filtered logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesCategory = logCategoryFilter === 'all' || log.category === logCategoryFilter;
    const matchesSearch = !logSearchQuery || 
      log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(logSearchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner with Clan branding & Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              Trung Tâm Quản Trị Hệ Thống
            </span>
            <span className="text-xs text-slate-500 font-mono">Phiên Bản 3.2 Pro</span>
            {saveStatus === 'saved' && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50/80 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã lưu đám mây {lastSaved ? `(lúc ${lastSaved})` : ''}</span>
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                <span>Đang đồng bộ...</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <button
                onClick={onForceSync}
                className="text-[11px] font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                title={saveError || 'Lỗi lưu dữ liệu'}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Lỗi lưu. Nhấp để thử lại!</span>
              </button>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-display mt-1">
            Ban Quản Trị Gia Tộc • {clanSettings.clanName} ({clanSettings.branchName})
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Quản trị toàn diện: Duyệt phả đồ, kiểm toán sổ quỹ công đức, phân quyền RBAC, sao lưu dữ liệu và cấu hình từ đường
          </p>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
          <button
            id="admin-tab-overview"
            onClick={() => setActiveAdminTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeAdminTab === 'overview' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Tổng Quan
          </button>

          <button
            id="admin-tab-requests"
            onClick={() => setActiveAdminTab('requests')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeAdminTab === 'requests' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            Đề Xuất ({pendingRequests.length})
          </button>

          <button
            id="admin-tab-funds"
            onClick={() => setActiveAdminTab('funds')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeAdminTab === 'funds' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Quỹ Công Đức ({pendingContributions.length})
          </button>

          <button
            id="admin-tab-users"
            onClick={() => setActiveAdminTab('users')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeAdminTab === 'users' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Tài Khoản & RBAC
          </button>

          <button
            id="admin-tab-logs"
            onClick={() => setActiveAdminTab('logs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeAdminTab === 'logs' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Nhật Ký ({auditLogs.length})
          </button>

          <button
            id="admin-tab-backup"
            onClick={() => setActiveAdminTab('backup')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeAdminTab === 'backup' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Sao Lưu & Xuất
          </button>

          <button
            id="admin-tab-settings"
            onClick={() => setActiveAdminTab('settings')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeAdminTab === 'settings' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Cấu Hình
          </button>
        </div>
      </div>

      {/* Warning banner if not admin */}
      {!isAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start justify-between gap-3 text-xs sm:text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Lưu ý về Phân quyền Quản Trị:</strong> Bạn hiện đang đăng nhập với vai trò{' '}
              <span className="font-bold uppercase text-amber-950 underline">{currentRole}</span>. Một số tác vụ cấp cao (Duyệt đề xuất, Thay đổi quyền tài khoản, Khôi phục dữ liệu) yêu cầu quyền{' '}
              <strong>Quản trị viên (Admin)</strong>.
            </div>
          </div>
          <button
            onClick={onOpenLoginModal}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-800 hover:bg-amber-900 text-white rounded-xl shadow-xs shrink-0 flex items-center gap-1"
          >
            <LogIn className="w-3.5 h-3.5" />
            Đăng Nhập Admin
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW & DASHBOARD                              */}
      {/* ======================================================== */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Tổng Đinh & Thành Viên</span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display">
                {members.length} <span className="text-xs font-normal text-slate-500">người</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center gap-2 pt-1 border-t border-slate-100">
                <span>Nam: <strong className="text-blue-700">{maleMembers.length}</strong></span>
                <span>•</span>
                <span>Nữ: <strong className="text-rose-700">{femaleMembers.length}</strong></span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Thế Hệ & Tình Trạng</span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display">
                5 <span className="text-xs font-normal text-slate-500">thế hệ</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center gap-2 pt-1 border-t border-slate-100">
                <span>Còn sống: <strong className="text-emerald-700">{livingMembers.length}</strong></span>
                <span>•</span>
                <span>Đã khuất: <strong className="text-slate-700">{deceasedMembers.length}</strong></span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Quỹ Công Đức Đã Thu</span>
              <div className="text-xl sm:text-2xl font-bold text-amber-900 font-mono">
                {totalFundCollected.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">đ</span>
              </div>
              <div className="text-[11px] text-amber-800 flex items-center gap-1 pt-1 border-t border-slate-100">
                <span>Chờ duyệt: <strong>{pendingContributions.length}</strong> ({totalPendingFund.toLocaleString('vi-VN')} đ)</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Đề Xuất Gia Phả Chờ Duyệt</span>
              <div className="text-2xl sm:text-3xl font-bold text-blue-900 font-serif-display">
                {pendingRequests.length} <span className="text-xs font-normal text-slate-500">yêu cầu</span>
              </div>
              <div className="text-[11px] text-blue-800 flex items-center gap-1 pt-1 border-t border-slate-100">
                <span>Từ các Liên lạc viên chi phái</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Lối Tắt Tác Vụ Nhanh (Admin Quick Actions)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={onAddNewMemberDirect}
                className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-semibold text-left transition-all flex flex-col gap-1 shadow-2xs"
              >
                <UserPlus className="w-4 h-4 text-amber-700" />
                <span>+ Thêm thành viên mới</span>
                <span className="text-[10px] text-amber-700 font-normal">Cập nhật trực tiếp lên cây</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('requests')}
                className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-semibold text-left transition-all flex flex-col gap-1 shadow-2xs"
              >
                <FileEdit className="w-4 h-4 text-blue-700" />
                <span>Xét duyệt đề xuất ({pendingRequests.length})</span>
                <span className="text-[10px] text-blue-700 font-normal">Xem diff & phê chuẩn</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('funds')}
                className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-semibold text-left transition-all flex flex-col gap-1 shadow-2xs"
              >
                <Coins className="w-4 h-4 text-emerald-700" />
                <span>Duyệt quỹ công đức ({pendingContributions.length})</span>
                <span className="text-[10px] text-emerald-700 font-normal">Đối soát biên lai đóng góp</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-900 text-xs font-semibold text-left transition-all flex flex-col gap-1 shadow-2xs"
              >
                <Download className="w-4 h-4 text-purple-700" />
                <span>Sao lưu toàn bộ gia phả</span>
                <span className="text-[10px] text-purple-700 font-normal">Tải tệp an toàn .json</span>
              </button>
            </div>
          </div>

          {/* Two-column layout: Upcoming anniversaries & Recent audit logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Anniversaries */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  Lễ Giỗ Tổ & Ngày Giỗ Trong Dòng Họ
                </h3>
                <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Âm Lịch
                </span>
              </div>
              <div className="space-y-2.5">
                {deceasedMembers.slice(0, 4).map(m => (
                  <div key={m.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{m.fullName}</div>
                      <div className="text-[11px] text-slate-500">Đời {m.generation} • {m.branch} ({m.title || 'Tiền nhân'})</div>
                    </div>
                    <div className="text-right font-medium text-amber-900">
                      <div>{m.lunarDeathDate || 'Ngày giỗ truyền thống'}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Hưởng thọ: {m.deathYear && m.birthYear ? `${m.deathYear - m.birthYear} tuổi` : 'Cao niên'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Audit Logs */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-700" />
                  Nhật Ký Thao Tác Quản Trị Gần Đây
                </h3>
                <button
                  onClick={() => setActiveAdminTab('logs')}
                  className="text-xs text-blue-700 hover:underline font-semibold"
                >
                  Xem tất cả →
                </button>
              </div>
              <div className="space-y-2.5">
                {auditLogs.slice(0, 4).map(log => (
                  <div key={log.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('vi-VN')} {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex items-center justify-between">
                      <span>Người thực hiện: <strong className="text-slate-800">{log.userName}</strong></span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700 text-[10px] font-mono">{log.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: REQUESTS APPROVAL                                */}
      {/* ======================================================== */}
      {activeAdminTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800 font-serif-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Danh Sách Đề Xuất Chờ Phê Duyệt Của Liên Lạc Viên ({pendingRequests.length})
            </h3>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((req) => {
                const targetMember = req.targetMemberId ? members.find(m => m.id === req.targetMemberId) : null;

                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          req.type === 'create_member' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : req.type === 'delete_member'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {req.type === 'create_member' 
                            ? '+ Thêm Thành Viên Mới' 
                            : req.type === 'delete_member'
                            ? '✕ Đề Xuất Xoá Thành Viên'
                            : '✎ Sửa Đổi Thông Tin'}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">#{req.id}</span>
                      </div>

                      <div className="text-xs text-slate-600">
                        Người đề xuất: <strong className="text-slate-800">{req.proposedByName}</strong> (Liên lạc viên) •{' '}
                        {new Date(req.submittedAt).toLocaleTimeString('vi-VN')} {new Date(req.submittedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    {/* Diff view / Proposed Data */}
                    {req.type === 'delete_member' ? (
                      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 text-xs text-rose-950 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Yêu cầu xoá thành viên khỏi cơ sở dữ liệu phả đồ</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-rose-200 text-slate-800 space-y-1">
                          <div><strong>Thành viên:</strong> {targetMember?.fullName || req.proposedData.fullName || 'Thành viên'}</div>
                          <div><strong>Thế hệ & Chi phái:</strong> Đời {targetMember?.generation || req.proposedData.generation} ({targetMember?.branch || req.proposedData.branch})</div>
                          <div><strong>Năm sinh - Năm mất:</strong> {targetMember?.birthYear || req.proposedData.birthYear} - {targetMember?.isAlive ? 'Còn sống' : (targetMember?.deathYear || 'Đã mất')}</div>
                          {(targetMember?.currentAddress || req.proposedData.currentAddress) && (
                            <div><strong>Địa chỉ:</strong> {targetMember?.currentAddress || req.proposedData.currentAddress}</div>
                          )}
                        </div>
                        <p className="text-rose-800 text-[11px]">
                          Khi được Admin phê duyệt, thành viên này sẽ bị gỡ bỏ vĩnh viễn khỏi cây gia phả. Mọi liên kết cha con sẽ được giải phóng an toàn.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Current Data if update */}
                        {req.type === 'update_member' && (
                          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                            <span className="font-bold text-slate-600 uppercase tracking-wider block text-[11px]">
                              Dữ Liệu Hiện Tại Trên Cây Gia Phả
                            </span>
                            <div className="space-y-1 text-slate-700">
                              <div><strong>Họ tên:</strong> {targetMember?.fullName}</div>
                              <div><strong>Nơi công tác cũ:</strong> {req.currentData?.workplace || targetMember?.workplace}</div>
                              <div><strong>Địa chỉ:</strong> {targetMember?.currentAddress}</div>
                            </div>
                          </div>
                        )}

                        {/* Proposed Data */}
                        <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                          req.type === 'create_member' 
                            ? 'border-emerald-200 bg-emerald-50/50 md:col-span-2' 
                            : 'border-amber-300 bg-amber-50/50'
                        }`}>
                          <span className="font-bold text-amber-900 uppercase tracking-wider block text-[11px]">
                            Dữ Liệu Đề Xuất Mới (Cần Duyệt)
                          </span>
                          <div className="space-y-1.5 text-slate-800">
                            {req.proposedData.fullName && (
                              <div><strong>Họ tên thành viên:</strong> {req.proposedData.fullName}</div>
                            )}
                            {req.proposedData.generation && (
                              <div><strong>Thế hệ đề xuất:</strong> Đời thứ {req.proposedData.generation} ({req.proposedData.branch})</div>
                            )}
                            {req.proposedData.birthYear && (
                              <div><strong>Năm sinh:</strong> {req.proposedData.birthYear}</div>
                            )}
                            {req.proposedData.workplace && (
                              <div><strong>Chức danh / Nơi công tác mới:</strong> {req.proposedData.workplace}</div>
                            )}
                            {req.proposedData.bio && (
                              <div><strong>Ghi chú / Tiểu sử:</strong> {req.proposedData.bio}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {req.reviewComment && (
                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900">
                        <strong>Ý kiến của Liên lạc viên:</strong> "{req.reviewComment}"
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">
                        Sau khi phê duyệt, thông tin sẽ được cập nhật đồng bộ lên toàn hệ thống gia tộc.
                      </div>

                      <div className="flex items-center gap-2">
                        {rejectReasonInput?.id === req.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Lý do từ chối..."
                              value={rejectReasonInput.text}
                              onChange={(e) => setRejectReasonInput({ id: req.id, text: e.target.value })}
                              className="px-2.5 py-1 text-xs border border-rose-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                            />
                            <button
                              onClick={() => {
                                onRejectRequest(req.id, rejectReasonInput.text || 'Thông tin chưa đầy đủ');
                                setRejectReasonInput(null);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
                            >
                              Xác nhận từ chối
                            </button>
                            <button
                              onClick={() => setRejectReasonInput(null)}
                              className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              disabled={!isAdmin}
                              onClick={() => setRejectReasonInput({ id: req.id, text: '' })}
                              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Từ Chối
                            </button>
                            <button
                              disabled={!isAdmin}
                              onClick={() => onApproveRequest(req.id)}
                              className={`px-4 py-1.5 text-xs font-semibold text-white rounded-xl shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 ${
                                req.type === 'delete_member'
                                  ? 'bg-rose-700 hover:bg-rose-800'
                                  : 'bg-emerald-700 hover:bg-emerald-800'
                              }`}
                            >
                              {req.type === 'delete_member' ? (
                                <>
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Duyệt Xoá Khỏi Phả Đồ
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Phê Duyệt & Đẩy Lên Cây Gia Phả
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-semibold text-slate-800 text-sm">Hàng đợi trống</p>
              <p>Hiện không có đề xuất thay đổi gia phả nào đang chờ phê duyệt.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: FUNDS VERIFICATION                                */}
      {/* ======================================================== */}
      {activeAdminTab === 'funds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800 font-serif-display flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              Danh Sách Giao Dịch Chờ Xác Nhận Vào Sổ Quỹ ({pendingContributions.length})
            </h3>
            <div className="text-xs text-slate-600">
              Tổng tiền chờ duyệt: <strong className="text-amber-900 font-mono">{totalPendingFund.toLocaleString('vi-VN')} VNĐ</strong>
            </div>
          </div>

          {pendingContributions.length > 0 ? (
            <div className="space-y-4">
              {pendingContributions.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {c.receiptImageUrl && (
                      <img
                        src={c.receiptImageUrl}
                        alt="Bill"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                      />
                    )}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{c.donorName}</span>
                        <span className="text-xs text-slate-500">({c.generationOrBranch})</span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-semibold">
                          {c.purpose === 'duty' ? 'Nghĩa vụ' : (c.purpose === 'construction' ? 'Tu bổ từ đường' : (c.purpose === 'study_fund' ? 'Khuyến học' : 'Lễ cúng'))}
                        </span>
                      </div>
                      <div className="text-base font-bold text-amber-900 font-mono">
                        {c.amount.toLocaleString('vi-VN')} VNĐ
                      </div>
                      <p className="text-xs text-slate-600">
                        Mã GD: <span className="font-mono">{c.transactionRef}</span> • {c.notes || 'Không có ghi chú'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      disabled={!isAdmin}
                      onClick={() => onConfirmContribution(c.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Xác Nhận Đã Nhận Tiền
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-semibold text-slate-800 text-sm">Tất cả giao dịch đã được đối soát</p>
              <p>Không có giao dịch đóng góp nào đang chờ phê duyệt.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: USERS & RBAC MANAGEMENT                          */}
      {/* ======================================================== */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg text-slate-900 font-serif-display">
                Quản Lý Tài Khoản & Phân Quyền (3 Cấp RBAC)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấp tài khoản cho con cháu, chỉ định liên lạc viên các chi, khóa tài khoản hoặc reset mật khẩu
              </p>
            </div>

            <button
              disabled={!isAdmin}
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-3.5 py-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              + Cấp Tài Khoản Mới
            </button>
          </div>

          {/* User list table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-3">Họ Tên / Tài Khoản</th>
                  <th className="py-3 px-3">Số Điện Thoại / Email</th>
                  <th className="py-3 px-3">Chi Phái / Đơn Vị</th>
                  <th className="py-3 px-3">Trạng Thái</th>
                  <th className="py-3 px-3">Vai Trò Hệ Thống</th>
                  <th className="py-3 px-3 text-right">Thao Tác Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{user.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">@{user.username}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-700">{user.phone}</div>
                      <div className="text-[11px] text-slate-500">{user.email}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{user.branch}</div>
                      {user.title && <div className="text-[10px] text-amber-800 font-medium">{user.title}</div>}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {user.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        disabled={!isAdmin}
                        value={user.role}
                        onChange={(e) => onUpdateUserRole(user.id, e.target.value as UserRole)}
                        className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                      >
                        <option value="admin">Quản Trị Viên (Admin)</option>
                        <option value="liaison">Liên Lạc Viên (Liaison)</option>
                        <option value="reporter">Phóng Viên (Reporter)</option>
                        <option value="member">Thành Viên (Member)</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          disabled={!isAdmin}
                          onClick={() => onResetUserPassword(user.id)}
                          className="p-1.5 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors disabled:opacity-40"
                          title="Đặt lại mật khẩu mặc định (123456)"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={!isAdmin || user.id === currentUser?.id}
                          onClick={() => onToggleLockAccount(user.id)}
                          className={`p-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                            user.status === 'active'
                              ? 'text-amber-700 hover:bg-amber-50 border-amber-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                          }`}
                          title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {user.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                        {user.id !== 'usr_admin_01' && user.id !== currentUser?.id && (
                          <button
                            disabled={!isAdmin}
                            onClick={() => {
                              if (window.confirm(`Xác nhận xóa tài khoản ${user.fullName}?`)) {
                                onDeleteAccount(user.id);
                              }
                            }}
                            className="p-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors disabled:opacity-40"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: AUDIT LOGS                                       */}
      {/* ======================================================== */}
      {activeAdminTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg text-slate-900 font-serif-display">
                Nhật Ký Thao Tác & Kiểm Toán Hệ Thống (Audit Logs)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lưu vết tự động mọi hành động thêm, sửa, xóa, duyệt phả đồ, duyệt quỹ và đăng nhập
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm hành động, người thực hiện..."
                  value={logSearchQuery}
                  onChange={e => setLogSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <select
                value={logCategoryFilter}
                onChange={e => setLogCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 font-medium"
              >
                <option value="all">Tất cả danh mục</option>
                <option value="auth">Đăng nhập / Xác thực</option>
                <option value="tree">Cây Phả Đồ</option>
                <option value="fund">Quỹ Công Đức</option>
                <option value="user">Quản Trị Người Dùng</option>
                <option value="system">Hệ Thống / Sao Lưu</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-mono uppercase bg-slate-200 text-slate-700">
                      {log.category}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-[11px] text-slate-600">{log.details}</p>
                  )}
                </div>

                <div className="text-right shrink-0 text-slate-500 text-[11px]">
                  <div>Thực hiện bởi: <strong className="text-slate-800">{log.userName}</strong></div>
                  <div className="font-mono">{new Date(log.timestamp).toLocaleString('vi-VN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: BACKUP & RESTORE                                 */}
      {/* ======================================================== */}
      {activeAdminTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-lg text-slate-900 font-serif-display">
              Sao Lưu & Xuất Bản Dữ Liệu Gia Phả
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đảm bảo an toàn tuyệt đối cho cơ sở dữ liệu dòng họ, chống thất lạc và phục vụ in ấn sách gia phả
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. JSON Full Backup */}
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Sao Lưu Toàn Bộ (Tệp JSON)</h4>
                <p className="text-xs text-slate-600">
                  Đóng gói toàn bộ cây gia phả, thế hệ, sổ quỹ công đức và thiết lập gia tộc thành 1 tệp JSON duy nhất.
                </p>
              </div>
              <button
                onClick={handleExportJSON}
                className="w-full py-2 px-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                Tải Tệp Sao Lưu (.json)
              </button>
            </div>

            {/* 2. CSV Export for Excel */}
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Xuất Danh Sách Excel (CSV)</h4>
                <p className="text-xs text-slate-600">
                  Xuất danh sách tất cả các đinh, thành viên, ngày giỗ, năm sinh, nơi an táng để mở bằng Excel hoặc in ấn.
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                Xuất Bảng Tính (.csv)
              </button>
            </div>

            {/* 3. Restore from JSON */}
            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Khôi Phục Dữ Liệu (Restore)</h4>
                <p className="text-xs text-slate-600">
                  Tải lên tệp sao lưu JSON đã tải về trước đó để khôi phục toàn bộ cây phả đồ khi cần thiết.
                </p>
              </div>
              <label className={`w-full py-2 px-3 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors ${!isAdmin ? 'opacity-40 pointer-events-none' : ''}`}>
                <Upload className="w-4 h-4" />
                <span>Chọn Tệp Khôi Phục</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={!isAdmin}
                />
              </label>
            </div>

            {/* 4. Real-time Cloud Sync Card */}
            <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-800">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Đồng Bộ Đám Mây Hệ Thống</h4>
                <p className="text-xs text-slate-600">
                  Mọi thay đổi của admin sẽ tự động đồng bộ thời gian thực lên máy chủ. Bạn có thể đồng bộ cưỡng bức tại đây.
                </p>
                <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                  <div>Trạng thái: <strong className={saveStatus === 'saved' ? 'text-emerald-700' : saveStatus === 'saving' ? 'text-amber-700' : 'text-rose-700'}>
                    {saveStatus === 'saved' ? 'Đã lưu đám mây' : saveStatus === 'saving' ? 'Đang đồng bộ...' : 'Lỗi kết nối máy chủ'}
                  </strong></div>
                  <div>Đồng bộ cuối: <strong className="text-slate-700">{lastSaved || 'Ngay bây giờ'}</strong></div>
                </div>
              </div>
              <button
                disabled={!isAdmin || saveStatus === 'saving'}
                onClick={onForceSync}
                className="w-full py-2 px-3 bg-indigo-800 hover:bg-indigo-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${saveStatus === 'saving' ? 'animate-spin' : ''}`} />
                {saveStatus === 'saving' ? 'Đang đồng bộ...' : 'Đồng Bộ Ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: SETTINGS                                          */}
      {/* ======================================================== */}
      {activeAdminTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 font-serif-display">
                Cấu Hình Hệ Thống, Header & Footer
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập thông tin hiển thị chính thức trên hệ thống gia phả điện tử, tiêu đề trang, biểu ngữ và tài khoản công đức
              </p>
            </div>
            {onOpenEditContentModal && (
              <button
                type="button"
                onClick={() => onOpenEditContentModal('header')}
                className="px-4 py-2 bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-amber-950 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all shrink-0 self-start sm:self-auto"
              >
                <Palette className="w-4 h-4 text-amber-300" />
                <span>Mở Trình Sửa Trực Quan</span>
              </button>
            )}
          </div>

          {settingsSavedSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">Đã lưu thông số cấu hình dòng họ, Header và Footer thành công!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* 1. HEADER SETTINGS */}
            <div className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
                <h4 className="font-bold text-xs text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <PanelTop className="w-4 h-4 text-amber-700" />
                  <span>1. Cấu Hình Thanh Đầu Trang (Header & Biểu Ngữ)</span>
                </h4>
                {onOpenEditContentModal && (
                  <button
                    type="button"
                    onClick={() => onOpenEditContentModal('header')}
                    className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 hover:underline"
                  >
                    Xem trước Header &rarr;
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Chữ Ký Tự Logo (1-3 ký tự)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={settingsHeaderLogoText}
                    onChange={e => setSettingsHeaderLogoText(e.target.value)}
                    placeholder="VD: 阮 hoặc N"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tiêu Đề Chính Header
                  </label>
                  <input
                    type="text"
                    value={settingsHeaderTitle}
                    onChange={e => setSettingsHeaderTitle(e.target.value)}
                    placeholder="VD: Gia Phả Họ Tộc Online"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nhãn Huy Hiệu Dòng Họ (Badge)
                  </label>
                  <input
                    type="text"
                    value={settingsHeaderBadgeText}
                    onChange={e => setSettingsHeaderBadgeText(e.target.value)}
                    placeholder="VD: Họ Nguyễn Văn • Chi Đệ Tam"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Thông Tin Niên Đại / Khởi Lập
                  </label>
                  <input
                    type="text"
                    value={settingsHeaderEstText}
                    onChange={e => setSettingsHeaderEstText(e.target.value)}
                    placeholder="VD: Khởi lập 1895"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Announcement Banner */}
              <div className="p-3 bg-white rounded-xl border border-amber-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-amber-700" />
                    Biểu Ngữ Thông Báo Đầu Trang (Chạy ở đầu website)
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={settingsShowAnnouncement}
                      onChange={e => setSettingsShowAnnouncement(e.target.checked)}
                      className="rounded text-amber-800 focus:ring-amber-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] font-medium text-slate-600">Hiển thị biểu ngữ</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={settingsHeaderAnnouncement}
                  onChange={e => setSettingsHeaderAnnouncement(e.target.value)}
                  placeholder="VD: Thông báo: Đại Lễ Giỗ Tổ Chi Đệ Tam sẽ diễn ra vào ngày 10/03 Âm lịch..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. FOOTER SETTINGS */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <PanelBottom className="w-4 h-4 text-slate-700" />
                  <span>2. Cấu Hình Chân Trang (Footer)</span>
                </h4>
                {onOpenEditContentModal && (
                  <button
                    type="button"
                    onClick={() => onOpenEditContentModal('footer')}
                    className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 hover:underline"
                  >
                    Xem trước Footer &rarr;
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tiêu Đề Chân Trang
                  </label>
                  <input
                    type="text"
                    value={settingsFooterTitle}
                    onChange={e => setSettingsFooterTitle(e.target.value)}
                    placeholder="VD: Gia Phả Họ Tộc Online"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Phụ Đề / Câu Khẩu Hiệu Gia Tộc
                  </label>
                  <input
                    type="text"
                    value={settingsFooterSubtitle}
                    onChange={e => setSettingsFooterSubtitle(e.target.value)}
                    placeholder="VD: Cây có cội mới trổ cành xanh ngọn, Nước có nguồn mới tủa khắp rạch sông."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Đoạn Văn Giới Thiệu / Sứ Mệnh Chân Trang
                </label>
                <textarea
                  rows={2}
                  value={settingsFooterDescription}
                  onChange={e => setSettingsFooterDescription(e.target.value)}
                  placeholder="Mô tả tóm tắt tôn chỉ lưu truyền gia phả..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Dòng Bản Quyền (Copyright)
                  </label>
                  <input
                    type="text"
                    value={settingsFooterCopyright}
                    onChange={e => setSettingsFooterCopyright(e.target.value)}
                    placeholder="VD: © 2026 Ban Trị Sự Họ Tộc. Bảo lưu mọi quyền."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Ghi Chú Công Nghệ / Liên Kết
                  </label>
                  <input
                    type="text"
                    value={settingsFooterLinksNote}
                    onChange={e => setSettingsFooterLinksNote(e.target.value)}
                    placeholder="VD: Hệ thống lưu trữ gia phả điện tử đa thế hệ"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. CLAN BASIC INFO */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-4">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Building className="w-4 h-4 text-amber-700" />
                <span>3. Thông Tin Nhà Thờ & Tế Tự Dòng Họ</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên Dòng Họ
                  </label>
                  <input
                    type="text"
                    value={settingsClanName}
                    onChange={e => setSettingsClanName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chi Phái / Phân Nhánh
                  </label>
                  <input
                    type="text"
                    value={settingsBranchName}
                    onChange={e => setSettingsBranchName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trưởng Tộc Đương Nhiệm
                  </label>
                  <input
                    type="text"
                    value={settingsHeadOfClan}
                    onChange={e => setSettingsHeadOfClan(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày Đại Lễ Giỗ Tổ (Âm Lịch)
                  </label>
                  <input
                    type="text"
                    value={settingsWorshipDate}
                    onChange={e => setSettingsWorshipDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa Chỉ Nhà Thờ Từ Đường
                </label>
                <input
                  type="text"
                  value={settingsHallAddress}
                  onChange={e => setSettingsHallAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Điện Thoại Liên Hệ Từ Đường
                  </label>
                  <input
                    type="text"
                    value={settingsContactPhone}
                    onChange={e => setSettingsContactPhone(e.target.value)}
                    placeholder="VD: 0912 345 678"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Liên Hệ
                  </label>
                  <input
                    type="email"
                    value={settingsContactEmail}
                    onChange={e => setSettingsContactEmail(e.target.value)}
                    placeholder="VD: lienhe@giaphanct.org"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. BANK INFO */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-bold text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-700" />
                  4. Tài Khoản Ngân Hàng Tiếp Nhận Quỹ Công Đức & VietQR
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tên Ngân Hàng
                  </label>
                  <input
                    type="text"
                    value={settingsBankName}
                    onChange={e => setSettingsBankName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Số Tài Khoản
                  </label>
                  <input
                    type="text"
                    value={settingsAccountNumber}
                    onChange={e => setSettingsAccountNumber(e.target.value.replace(/\s+/g, ''))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Chủ Tài Khoản
                  </label>
                  <input
                    type="text"
                    value={settingsAccountHolder}
                    onChange={e => setSettingsAccountHolder(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Chi Nhánh Ngân Hàng
                  </label>
                  <input
                    type="text"
                    value={settingsBranchBank}
                    onChange={e => setSettingsBranchBank(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* VietQR live preview */}
              <div className="mt-3 p-3 bg-white rounded-xl border border-amber-200 flex flex-col sm:flex-row items-center gap-3">
                <div className="w-24 h-24 bg-slate-50 p-1 rounded-lg border border-slate-200 shrink-0 flex items-center justify-center">
                  <img
                    src={generateVietQRUrl({
                      bankNameOrBin: settingsBankName,
                      accountNumber: settingsAccountNumber,
                      accountHolder: settingsAccountHolder,
                    })}
                    alt="VietQR Quỹ Họ Tộc"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    <QrCode className="w-3 h-3" />
                    Mã VietQR Quỹ Họ Tộc Tự Động
                  </span>
                  <p className="text-slate-800 font-semibold">
                    {settingsBankName} • STK: <span className="font-mono text-amber-900 font-bold">{settingsAccountNumber}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Chủ tài khoản: <span className="font-semibold uppercase">{settingsAccountHolder || '---'}</span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Mã QR này sẽ hiển thị tự động trên mục "Đóng Góp & Công Đức" để bà con quét chuyển khoản trực tiếp vào quỹ dòng họ.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Lưu ý: Mọi thay đổi sẽ lập tức có hiệu lực trên toàn bộ trang bao gồm Header, Footer và các biểu mẫu.
              </p>
              <button
                disabled={!isAdmin}
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-amber-800 hover:bg-amber-900 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                Lưu Toàn Bộ Cấu Hình Dòng Họ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE NEW USER ACCOUNT                           */}
      {/* ======================================================== */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="bg-amber-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm font-serif-display">Cấp Tài Khoản Mới Vào Hệ Thống</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-amber-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ Và Tên *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn Hải"
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên Đăng Nhập (Username) *</label>
                  <input
                    type="text"
                    placeholder="nguyenvanhai"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mật Khẩu Khởi Tạo *</label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    placeholder="hai.nguyen@email.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    placeholder="0912 345 678"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vai Trò Hệ Thống (RBAC)</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="liaison">Liên Lạc Viên (Chi họ)</option>
                    <option value="reporter">Phóng Viên (Bản tin)</option>
                    <option value="member">Thành Viên (Con cháu)</option>
                    <option value="admin">Quản Trị Viên (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chi Phái Trực Thuộc</label>
                  <input
                    type="text"
                    value={newBranch}
                    onChange={e => setNewBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chức Danh Gia Tộc (Nếu có)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thư ký Chi 1, Ban liên lạc miền Nam..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-semibold shadow-xs"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
