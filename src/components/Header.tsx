import React, { useState } from 'react';
import { UserRole, UserAccount, ClanSettings } from '../types';
import { 
  GitFork, 
  Search, 
  Newspaper, 
  HeartHandshake, 
  ShieldCheck, 
  Layers, 
  UserCheck, 
  Crown, 
  FileEdit, 
  PenTool,
  Users,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Info,
  LogIn,
  LogOut,
  User,
  Settings,
  Palette,
  Megaphone
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'tree' | 'search' | 'news' | 'contribution' | 'admin';
  setActiveTab: (tab: 'tree' | 'search' | 'news' | 'contribution' | 'admin') => void;
  currentRole: UserRole;
  setCurrentRole?: (role: UserRole) => void;
  pendingApprovalsCount: number;
  pendingContributionsCount: number;
  currentUser: UserAccount | null;
  clanSettings?: ClanSettings;
  onOpenLoginModal: () => void;
  onOpenProfileModal: () => void;
  onOpenEditContentModal?: (tab: 'header' | 'footer' | 'general') => void;
  onOpenAIScanner?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  pendingApprovalsCount,
  pendingContributionsCount,
  currentUser,
  clanSettings,
  onOpenLoginModal,
  onOpenProfileModal,
  onOpenEditContentModal,
  onOpenAIScanner,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const roleConfig: Record<UserRole, { label: string; shortLabel: string; icon: React.ReactNode; color: string; desc: string }> = {
    admin: {
      label: 'Quản trị viên (Admin)',
      shortLabel: 'Admin',
      icon: <Crown className="w-4 h-4 text-amber-500" />,
      color: 'bg-amber-50 border-amber-300 text-amber-900',
      desc: 'Toàn quyền CRUD cây gia phả, phê duyệt đề xuất, phân quyền tài khoản & duyệt quỹ'
    },
    liaison: {
      label: 'Liên lạc viên (Chi họ)',
      shortLabel: 'Liên lạc viên',
      icon: <FileEdit className="w-4 h-4 text-blue-500" />,
      color: 'bg-blue-50 border-blue-300 text-blue-900',
      desc: 'Đề xuất thêm/sửa thành viên (chờ Admin duyệt), đăng tin bài hoạt động'
    },
    reporter: {
      label: 'Phóng viên (Bản tin)',
      shortLabel: 'Phóng viên',
      icon: <PenTool className="w-4 h-4 text-emerald-500" />,
      color: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      desc: 'Soạn thảo bài viết Tin tức, Hoạt động & quản lý thư viện hình ảnh'
    },
    member: {
      label: 'Con cháu / Khách',
      shortLabel: 'Con cháu',
      icon: <Users className="w-4 h-4 text-slate-500" />,
      color: 'bg-slate-50 border-slate-300 text-slate-900',
      desc: 'Tra cứu cây phả đồ, xem tin tức, quét mã QR đóng góp công đức'
    }
  };

  const totalNotifications = currentRole === 'admin' ? (pendingApprovalsCount + pendingContributionsCount) : 0;

  const handleTabClick = (tab: 'tree' | 'search' | 'news' | 'contribution' | 'admin') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        {/* Optional Announcement Banner */}
        {clanSettings?.showHeaderAnnouncement && clanSettings?.headerAnnouncement && (
          <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-100 text-xs px-3 sm:px-6 py-1.5 border-b border-amber-900/50">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="bg-amber-700 text-amber-100 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                  Thông báo
                </span>
                <span className="truncate text-[11px] sm:text-xs font-medium">
                  {clanSettings.headerAnnouncement}
                </span>
              </div>
              {currentRole === 'admin' && onOpenEditContentModal && (
                <button
                  onClick={() => onOpenEditContentModal('header')}
                  className="text-[10px] text-amber-300 hover:text-white underline underline-offset-2 shrink-0 ml-2 font-medium"
                >
                  Sửa thông báo
                </button>
              )}
            </div>
          </div>
        )}

        {/* Top Banner with Clan branding & Responsive Role / Menu Actions */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 border-b border-slate-100">
          {/* Logo & Clan Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-amber-100 shadow-xs font-serif-display font-bold text-base sm:text-lg shrink-0">
              {clanSettings?.headerLogoText || '阮'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full truncate">
                  {clanSettings?.headerBadgeText || `${clanSettings?.clanName || 'Họ Nguyễn Văn'} • ${clanSettings?.branchName || 'Chi Đệ Tam'}`}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 hidden sm:inline">
                  {clanSettings?.headerEstText || `Khởi lập ${clanSettings?.establishedYear || 1895}`}
                </span>
              </div>
              <h1 className="text-sm sm:text-lg font-bold text-slate-900 leading-tight font-serif-display truncate">
                {clanSettings?.headerTitle || 'Gia Phả Họ Tộc Online'}
              </h1>
            </div>
          </div>

          {/* Right Action: Desktop Role Switcher + Login / Profile + Mobile Role/Menu Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick AI Scanner Button - Admin Only */}
            {currentRole === 'admin' && onOpenAIScanner && (
              <button
                id="btn-quick-header-ai-scanner"
                onClick={onOpenAIScanner}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-850 hover:from-amber-650 hover:to-amber-800 text-amber-50 hover:text-white text-xs font-semibold shadow-xs transition-all border border-amber-600/50 cursor-pointer"
                title="Trợ lý AI số hóa trang sách gia phả, tờ khai lý lịch"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span className="hidden sm:inline">Gia Phả AI</span>
                <span className="text-[10px] bg-amber-900/60 px-1 py-0.2 rounded text-amber-200 uppercase font-mono">AI</span>
              </button>
            )}

            {/* Quick Edit Site Header/Footer Button for Admin */}
            {currentRole === 'admin' && onOpenEditContentModal && (
              <button
                id="btn-quick-edit-site-header"
                onClick={() => onOpenEditContentModal('header')}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold shadow-2xs transition-colors"
                title="Chỉnh sửa nội dung Header & Footer"
              >
                <Palette className="w-3.5 h-3.5 text-amber-700" />
                <span>Sửa Nội Dung Trang</span>
              </button>
            )}

            {/* User Account / Profile Button */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-user-profile"
                  onClick={onOpenProfileModal}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300 text-amber-950 transition-all flex items-center gap-2 shadow-2xs group"
                  title="Xem hồ sơ cá nhân & Đổi mật khẩu"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-200/80 border border-amber-400 flex items-center justify-center text-amber-900 shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left max-w-[120px] sm:max-w-[150px] truncate">
                    <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                      {currentUser.role === 'admin' && <Crown className="w-3 h-3 text-amber-600 shrink-0" />}
                      <span className="truncate">{currentUser.fullName}</span>
                    </div>
                    <div className="text-[10px] text-amber-800 font-medium truncate hidden sm:block">
                      {roleConfig[currentUser.role]?.shortLabel || 'Thành viên'}
                    </div>
                  </div>
                </button>

                <button
                  id="btn-quick-logout"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-open-login"
                onClick={onOpenLoginModal}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-amber-950 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-200" />
                <span className="hidden sm:inline">Đăng Nhập</span>
                <span className="sm:hidden">Đăng Nhập</span>
              </button>
            )}

            {/* Mobile Menu Drawer Toggle Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors md:hidden relative border border-slate-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {totalNotifications}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop & Tablet Navigation Tabs (Hidden on mobile phones, shown >= md) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hidden md:block">
          <nav className="flex space-x-1 overflow-x-auto py-2 no-scrollbar">
            <button
              id="nav-tab-tree"
              onClick={() => handleTabClick('tree')}
              className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'tree'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GitFork className="w-4 h-4" />
              <span>Cây Gia Phả Tương Tác</span>
            </button>

            <button
              id="nav-tab-search"
              onClick={() => handleTabClick('search')}
              className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'search'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Tra Cứu Nâng Cao</span>
            </button>

            <button
              id="nav-tab-news"
              onClick={() => handleTabClick('news')}
              className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'news'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Tin Tức & Truyền Thông</span>
            </button>

            <button
              id="nav-tab-contribution"
              onClick={() => handleTabClick('contribution')}
              className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all relative ${
                activeTab === 'contribution'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Quỹ & Đóng Góp</span>
              {pendingContributionsCount > 0 && currentRole === 'admin' && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {pendingContributionsCount}
                </span>
              )}
            </button>

            {currentRole === 'admin' && (
              <button
                id="nav-tab-admin"
                onClick={() => handleTabClick('admin')}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all relative ${
                  activeTab === 'admin'
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Phê Duyệt & Quản Trị</span>
                {pendingApprovalsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Mobile Slide-Down Menu Drawer (shown when hamburger is clicked) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 py-3 space-y-3 animate-in slide-in-from-top duration-200 shadow-lg">
            {/* User Account Info on Mobile Drawer */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
              {currentUser ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-200/80 border border-amber-400 flex items-center justify-center text-amber-900 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                      {currentUser.role === 'admin' && <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      <span className="truncate">{currentUser.fullName}</span>
                    </div>
                    <div className="text-[10px] text-amber-900 font-medium">
                      {roleConfig[currentUser.role]?.shortLabel} • {currentUser.branch}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Chưa đăng nhập tài khoản</span>
                </div>
              )}

              <div className="flex items-center gap-1 shrink-0">
                {currentUser ? (
                  <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenProfileModal();
                      }}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-amber-300 rounded-lg text-amber-900 hover:bg-amber-100/60 shadow-2xs"
                    >
                      Hồ sơ
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Đăng xuất"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenLoginModal();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-amber-800 hover:bg-amber-900 text-white rounded-xl flex items-center gap-1 shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Đăng nhập
                  </button>
                )}
              </div>
            </div>

            <div className="text-xs font-bold uppercase text-slate-500 tracking-wider px-1">
              Phân Hệ Chức Năng
            </div>
            <div className="grid grid-cols-1 gap-1">
              <button
                onClick={() => handleTabClick('tree')}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === 'tree' ? 'bg-amber-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GitFork className="w-4 h-4" />
                  <span>Cây Gia Phả Tương Tác</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleTabClick('search')}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === 'search' ? 'bg-amber-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4" />
                  <span>Tra Cứu Nâng Cao (Bộ lọc)</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleTabClick('news')}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === 'news' ? 'bg-amber-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Newspaper className="w-4 h-4" />
                  <span>Tin Tức & Truyền Thông Họ Tộc</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleTabClick('contribution')}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === 'contribution' ? 'bg-amber-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Quỹ Công Đức & VietQR</span>
                </div>
                {pendingContributionsCount > 0 && currentRole === 'admin' && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                    {pendingContributionsCount}
                  </span>
                )}
              </button>

              {currentRole === 'admin' && (
                <button
                  id="mobile-nav-tab-admin"
                  onClick={() => handleTabClick('admin')}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                    activeTab === 'admin' ? 'bg-amber-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Phê Duyệt & Phân Quyền RBAC</span>
                  </div>
                  {pendingApprovalsCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </button>
              )}

              {currentRole === 'admin' && onOpenAIScanner && (
                <button
                  id="mobile-btn-ai-scanner"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAIScanner();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-amber-750 to-amber-900 border border-amber-700 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>Trợ Lý AI Số Hóa Gia Phả</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">Gia Phả</span>
                </button>
              )}

              {currentRole === 'admin' && onOpenEditContentModal && (
                <button
                  id="mobile-btn-edit-site-content"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenEditContentModal('header');
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-amber-900 bg-amber-100/70 hover:bg-amber-100 border border-amber-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Palette className="w-4 h-4 text-amber-700" />
                    <span>Chỉnh Sửa Header & Footer</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed at screen bottom on smartphones < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg safe-area-bottom">
        <button
          id="bottom-nav-tree"
          onClick={() => handleTabClick('tree')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-medium transition-colors flex-1 ${
            activeTab === 'tree' ? 'text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitFork className={`w-5 h-5 mb-0.5 ${activeTab === 'tree' ? 'text-amber-800' : 'text-slate-400'}`} />
          <span>Phả đồ</span>
        </button>

        <button
          id="bottom-nav-search"
          onClick={() => handleTabClick('search')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-medium transition-colors flex-1 ${
            activeTab === 'search' ? 'text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className={`w-5 h-5 mb-0.5 ${activeTab === 'search' ? 'text-amber-800' : 'text-slate-400'}`} />
          <span>Tra cứu</span>
        </button>

        <button
          id="bottom-nav-news"
          onClick={() => handleTabClick('news')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-medium transition-colors flex-1 ${
            activeTab === 'news' ? 'text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Newspaper className={`w-5 h-5 mb-0.5 ${activeTab === 'news' ? 'text-amber-800' : 'text-slate-400'}`} />
          <span>Tin tức</span>
        </button>

        <button
          id="bottom-nav-contribution"
          onClick={() => handleTabClick('contribution')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-medium transition-colors flex-1 relative ${
            activeTab === 'contribution' ? 'text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartHandshake className={`w-5 h-5 mb-0.5 ${activeTab === 'contribution' ? 'text-amber-800' : 'text-slate-400'}`} />
          <span>Quỹ họ</span>
          {pendingContributionsCount > 0 && currentRole === 'admin' && (
            <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {pendingContributionsCount}
            </span>
          )}
        </button>

        <button
          id="bottom-nav-menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-medium transition-colors flex-1 relative ${
            isMobileMenuOpen || activeTab === 'admin' ? 'text-amber-900 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Menu className={`w-5 h-5 mb-0.5 ${isMobileMenuOpen || activeTab === 'admin' ? 'text-amber-800' : 'text-slate-400'}`} />
          <span>Thêm</span>
          {currentRole === 'admin' && pendingApprovalsCount > 0 && (
            <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {pendingApprovalsCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
};

