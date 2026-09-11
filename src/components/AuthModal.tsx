import React, { useState } from 'react';
import { UserAccount, UserRole, FamilyMember } from '../types';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  Crown, 
  FileEdit, 
  PenTool, 
  Users, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  LogOut,
  Sparkles,
  UserCheck,
  User
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserAccount | null;
  accounts: UserAccount[];
  members?: FamilyMember[];
  onLogin?: (account: UserAccount) => void;
  onLoginSuccess?: (account: UserAccount) => void;
  onLogout?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser = null,
  accounts,
  members = [],
  onLogin,
  onLoginSuccess,
  onLogout
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const triggerLogin = (account: UserAccount) => {
    if (typeof onLogin === 'function') {
      onLogin(account);
    }
    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess(account);
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedInput = usernameOrEmail.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedInput || !trimmedPass) {
      setErrorMessage('Vui lòng nhập tên tài khoản/tên thành viên và mật khẩu.');
      return;
    }

    const matched = accounts.find(
      acc => (acc.username.toLowerCase() === trimmedInput || acc.email.toLowerCase() === trimmedInput)
    );

    let matchedAccount: UserAccount | undefined = matched;

    // Check if it matches a family member in the genealogy tree
    if (!matchedAccount && members) {
      const removeVietnameseAccents = (str: string): string => {
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D');
      };

      const matchedMember = members.find(m => {
        const normInput = removeVietnameseAccents(trimmedInput.toLowerCase());
        const normMemberName = removeVietnameseAccents(m.fullName.toLowerCase());
        return normInput === normMemberName || m.fullName.toLowerCase() === trimmedInput.toLowerCase();
      });

      if (matchedMember) {
        if (!matchedMember.phoneNumber) {
          setErrorMessage('Thành viên này chưa đăng ký số điện thoại trong gia phả. Vui lòng liên hệ Admin để cập nhật số điện thoại trước.');
          return;
        }

        const cleanPhone = matchedMember.phoneNumber.replace(/\D/g, '');
        if (cleanPhone.length < 6) {
          setErrorMessage('Số điện thoại đăng ký trong gia phả không đúng định dạng (ít hơn 6 chữ số). Vui lòng liên hệ Admin để cập nhật.');
          return;
        }

        const last6Digits = cleanPhone.slice(-6);
        if (trimmedPass !== last6Digits) {
          setErrorMessage('Mật khẩu không đúng. Mật khẩu thành viên là 6 số cuối của số điện thoại đăng ký gia phả.');
          return;
        }

        // Generate dynamic user account for the member on-the-fly
        matchedAccount = {
          id: `member_acc_${matchedMember.id}`,
          username: matchedMember.fullName,
          email: matchedMember.email || `${matchedMember.id}@giaphaso.vn`,
          fullName: matchedMember.fullName,
          phone: matchedMember.phoneNumber,
          role: 'member',
          branch: matchedMember.branch,
          title: matchedMember.title || 'Thành viên Gia tộc',
          avatarUrl: matchedMember.avatarUrl,
          status: 'active',
          createdAt: new Date().toISOString()
        };
      }
    }

    if (!matchedAccount) {
      setErrorMessage('Tài khoản hoặc Tên thành viên không tồn tại trong hệ thống gia phả.');
      return;
    }

    if (matchedAccount.status === 'locked') {
      setErrorMessage('Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ Ban Trị Sự.');
      return;
    }

    // Only check password field for preset administrative/moderator accounts (non-dynamic member accounts)
    if (!matchedAccount.id.startsWith('member_acc_')) {
      if (matchedAccount.password && matchedAccount.password !== trimmedPass) {
        setErrorMessage('Mật khẩu không chính xác. Mẹo: Hãy sử dụng nút "Đăng nhập nhanh 1-chạm" bên dưới.');
        return;
      }
    }

    // Success
    setSuccessMessage(`Đăng nhập thành công với vai trò: ${getRoleLabel(matchedAccount.role)}`);
    const finalAccount = matchedAccount;
    setTimeout(() => {
      triggerLogin(finalAccount);
      onClose();
    }, 400);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            Quản Trị Viên (Admin)
          </span>
        );
      case 'liaison':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1">
            <FileEdit className="w-3.5 h-3.5 text-blue-600" />
            Liên Lạc Viên (Chi họ)
          </span>
        );
      case 'reporter':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
            <PenTool className="w-3.5 h-3.5 text-emerald-600" />
            Phóng Viên (Bản tin)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-600" />
            Con Cháu / Khách
          </span>
        );
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Quản trị viên (Admin)';
      case 'liaison': return 'Liên lạc viên (Chi họ)';
      case 'reporter': return 'Phóng viên (Bản tin)';
      default: return 'Thành viên / Con cháu';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-amber-900/10 overflow-hidden flex flex-col my-auto relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Clan Motif */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 px-6 py-5 text-amber-50 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-700/80 border border-amber-500/30 flex items-center justify-center text-amber-100 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="font-serif-display font-bold text-lg text-white">
                  {currentUser ? 'Tài Khoản Thành Viên' : 'Đăng Nhập Cổng Gia Tộc'}
                </h3>
                <p className="text-xs text-amber-200/80">
                  {currentUser ? 'Thông tin phiên làm việc hiện tại' : 'Hệ thống Quản trị & Phân quyền Gia Phả Online'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-amber-950/40 hover:bg-amber-950/80 text-amber-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {currentUser ? (
            /* Current User Logged In Info */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-200/80 border border-amber-400 flex items-center justify-center text-amber-900 shrink-0 shadow-2xs">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 text-base">{currentUser.fullName}</h4>
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong>Chức danh:</strong> {currentUser.title || 'Thành viên gia tộc'}
                  </p>
                  <p className="text-xs text-slate-600">
                    <strong>Chi phái:</strong> {currentUser.branch}
                  </p>
                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1 pt-1 font-mono">
                    <span>Email: {currentUser.email}</span>
                    <span>SĐT: {currentUser.phone}</span>
                  </div>
                </div>
              </div>

              {currentUser.role === 'admin' && (
                <div className="p-3.5 bg-amber-100/60 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Crown className="w-4 h-4 text-amber-700" />
                    <span>Quyền hạn Quản Trị Viên Tối Cao (Super Admin):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900/90 pl-1">
                    <li>Toàn quyền thêm, sửa, xóa thành viên trên cây gia phả.</li>
                    <li>Phê duyệt hoặc từ chối các đề xuất từ Liên lạc viên các chi.</li>
                    <li>Xác nhận biên lai công đức và kiểm toán quỹ dòng họ.</li>
                    <li>Cấp quyền tài khoản, khóa tài khoản và sao lưu dữ liệu toàn tộc.</li>
                  </ul>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Đóng Cửa Sổ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof onLogout === 'function') {
                      onLogout();
                    }
                    setSuccessMessage('Đã đăng xuất thành công.');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng Xuất Tài Khoản
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-4">
              {/* Member Login Guide Tip */}
              <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-2xl text-xs text-amber-900 leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                  Đăng nhập dành cho Thành viên dòng họ
                </p>
                <p className="text-[11px] text-amber-850">
                  Bà con có thể nhập trực tiếp <strong>Họ tên đầy đủ của mình</strong> làm tên đăng nhập và nhập <strong>6 chữ số cuối của Số điện thoại</strong> đã đăng ký trong gia phả làm mật khẩu để truy cập.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleManualLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ Tên Thành Viên hoặc Tên Đăng Nhập
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="login-input-username"
                      type="text"
                      value={usernameOrEmail}
                      onChange={e => setUsernameOrEmail(e.target.value)}
                      placeholder="Nhập họ tên (VD: Nguyễn Văn Hải Nam) hoặc Tên đăng nhập..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Mật Khẩu hoặc 6 Số Cuối Điện Thoại
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="login-input-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu quản trị hoặc 6 số cuối điện thoại..."
                      className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-amber-950 text-white font-semibold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-amber-200" />
                  Đăng Nhập Vào Hệ Thống
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Bảo mật dữ liệu gia tộc • Chuẩn ISO 27001</span>
          <span className="font-mono">v3.2 Quản Trị</span>
        </div>
      </div>
    </div>
  );
};
