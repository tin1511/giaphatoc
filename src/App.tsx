import React, { useState, useEffect, useRef } from 'react';
import { 
  FamilyMember, 
  Contribution, 
  NewsArticle, 
  ChangeRequest, 
  UserRole,
  UserAccount,
  AuditLog,
  ClanSettings
} from './types';
import { 
  INITIAL_MEMBERS, 
  INITIAL_CONTRIBUTIONS, 
  INITIAL_ARTICLES, 
  INITIAL_CHANGE_REQUESTS, 
  INITIAL_BOARD_MEMBERS,
  INITIAL_ACCOUNTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CLAN_SETTINGS
} from './data/initialData';
import { Header } from './components/Header';
import { FamilyTree } from './components/FamilyTree';
import { MemberSearch } from './components/MemberSearch';
import { MemberModal } from './components/MemberModal';
import { NewsAndMedia } from './components/NewsAndMedia';
import { ContributionView } from './components/ContributionView';
import { AdminApprovalPanel } from './components/AdminApprovalPanel';
import { AddMemberModal } from './components/AddMemberModal';
import { DeleteMemberModal } from './components/DeleteMemberModal';
import { AuthModal } from './components/AuthModal';
import { AdminProfileModal } from './components/AdminProfileModal';
import { EditSiteContentModal } from './components/EditSiteContentModal';
import { AIScannerModal } from './components/AIScannerModal';
import { Palette, Shield } from 'lucide-react';

export default function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<'tree' | 'search' | 'news' | 'contribution' | 'admin'>('tree');
  const [currentRole, setCurrentRole] = useState<UserRole>('member');

  // Authentication & System State
  const [accounts, setAccounts] = useState<UserAccount[]>(INITIAL_ACCOUNTS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [clanSettings, setClanSettings] = useState<ClanSettings>(INITIAL_CLAN_SETTINGS);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSiteContentModalOpen, setIsSiteContentModalOpen] = useState(false);
  const [siteContentModalInitialTab, setSiteContentModalInitialTab] = useState<'header' | 'footer' | 'general'>('header');
  const [isGlobalAIScannerOpen, setIsGlobalAIScannerOpen] = useState(false);
  const [prefilledScannedMember, setPrefilledScannedMember] = useState<Partial<FamilyMember> | null>(null);

  // Master Data State
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_MEMBERS);
  const [contributions, setContributions] = useState<Contribution[]>(INITIAL_CONTRIBUTIONS);
  const [articles, setArticles] = useState<NewsArticle[]>(INITIAL_ARTICLES);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(INITIAL_CHANGE_REQUESTS);
  const [boardMembers] = useState(INITIAL_BOARD_MEMBERS);

  // Modal States
  const [selectedMemberForModal, setSelectedMemberForModal] = useState<FamilyMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editTargetMember, setEditTargetMember] = useState<FamilyMember | null>(null);
  const [initialParentIdForAdd, setInitialParentIdForAdd] = useState<string | null>(null);
  const [deleteTargetMember, setDeleteTargetMember] = useState<FamilyMember | null>(null);

  // Persistence & Synced DB Engine State
  const [isLoading, setIsLoading] = useState(true);
  const isLoadedRef = useRef(false);
  const [activeSaves, setActiveSaves] = useState<Record<string, boolean>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(localStorage.getItem('clan_last_saved') || null);

  // Stable callback to save to both server and local storage
  const persistData = React.useCallback(async (key: string, data: any) => {
    localStorage.setItem(`clan_${key}`, JSON.stringify(data));
    setActiveSaves(prev => ({ ...prev, [key]: true }));
    setSaveError(null);
    try {
      const response = await fetch('/api/data/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, data }),
      });
      if (!response.ok) {
        throw new Error(`Máy chủ phản hồi trạng thái ${response.status}`);
      }
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSaved(nowStr);
      localStorage.setItem('clan_last_saved', nowStr);
    } catch (err: any) {
      console.error(`Failed to persist ${key} to server:`, err);
      setSaveError(err.message || 'Mất kết nối với máy chủ');
    } finally {
      setActiveSaves(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }, []);

  // Action for manual sync/force-save everything
  const handleForceSync = async () => {
    setSaveError(null);
    const datasets = {
      members,
      contributions,
      articles,
      changeRequests,
      accounts,
      auditLogs,
      clanSettings
    };
    
    // Mark as saving
    setActiveSaves({ manual: true });
    
    try {
      let hasError = false;
      for (const [key, data] of Object.entries(datasets)) {
        const response = await fetch('/api/data/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, data }),
        });
        if (!response.ok) {
          hasError = true;
        }
      }
      if (hasError) {
        throw new Error('Một số dữ liệu không thể đồng bộ thành công');
      }
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSaved(nowStr);
      localStorage.setItem('clan_last_saved', nowStr);
      addAuditLog(
        'Đồng bộ cơ sở dữ liệu thủ công',
        'system',
        'Admin đã chủ động đồng bộ hóa toàn bộ dữ liệu hệ thống lên máy chủ'
      );
    } catch (err: any) {
      setSaveError(err.message || 'Lỗi kết nối máy chủ khi đồng bộ');
    } finally {
      setActiveSaves({});
    }
  };

  // 1. Fetch initial dataset on boot
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const result = await response.json();
          if (result.initialized) {
            // Found existing database on server, restore state
            setMembers(result.members);
            setContributions(result.contributions);
            setArticles(result.articles);
            setChangeRequests(result.changeRequests);
            setAccounts(result.accounts);
            setAuditLogs(result.auditLogs);
            setClanSettings(result.clanSettings);

            // Back up to client storage
            localStorage.setItem('clan_members', JSON.stringify(result.members));
            localStorage.setItem('clan_contributions', JSON.stringify(result.contributions));
            localStorage.setItem('clan_articles', JSON.stringify(result.articles));
            localStorage.setItem('clan_changeRequests', JSON.stringify(result.changeRequests));
            localStorage.setItem('clan_accounts', JSON.stringify(result.accounts));
            localStorage.setItem('clan_auditLogs', JSON.stringify(result.auditLogs));
            localStorage.setItem('clan_clanSettings', JSON.stringify(result.clanSettings));
          } else {
            // Server database is uninitialized, retrieve from local storage fallback or standard defaults
            const localMembers = localStorage.getItem('clan_members');
            const localContributions = localStorage.getItem('clan_contributions');
            const localArticles = localStorage.getItem('clan_articles');
            const localChangeRequests = localStorage.getItem('clan_changeRequests');
            const localAccounts = localStorage.getItem('clan_accounts');
            const localAuditLogs = localStorage.getItem('clan_auditLogs');
            const localClanSettings = localStorage.getItem('clan_clanSettings');

            let initMembers = INITIAL_MEMBERS;
            let initContributions = INITIAL_CONTRIBUTIONS;
            let initArticles = INITIAL_ARTICLES;
            let initChangeRequests = INITIAL_CHANGE_REQUESTS;
            let initAccounts = INITIAL_ACCOUNTS;
            let initAuditLogs = INITIAL_AUDIT_LOGS;
            let initClanSettings = INITIAL_CLAN_SETTINGS;

            if (localMembers) {
              try { initMembers = JSON.parse(localMembers); } catch (e) {}
            }
            if (localContributions) {
              try { initContributions = JSON.parse(localContributions); } catch (e) {}
            }
            if (localArticles) {
              try { initArticles = JSON.parse(localArticles); } catch (e) {}
            }
            if (localChangeRequests) {
              try { initChangeRequests = JSON.parse(localChangeRequests); } catch (e) {}
            }
            if (localAccounts) {
              try { initAccounts = JSON.parse(localAccounts); } catch (e) {}
            }
            if (localAuditLogs) {
              try { initAuditLogs = JSON.parse(localAuditLogs); } catch (e) {}
            }
            if (localClanSettings) {
              try { initClanSettings = JSON.parse(localClanSettings); } catch (e) {}
            }

            setMembers(initMembers);
            setContributions(initContributions);
            setArticles(initArticles);
            setChangeRequests(initChangeRequests);
            setAccounts(initAccounts);
            setAuditLogs(initAuditLogs);
            setClanSettings(initClanSettings);

            // Populate the server-side persistence files
            await fetch('/api/data/init', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                members: initMembers,
                contributions: initContributions,
                articles: initArticles,
                changeRequests: initChangeRequests,
                accounts: initAccounts,
                auditLogs: initAuditLogs,
                clanSettings: initClanSettings,
              }),
            });
          }
        }
      } catch (err) {
        console.error('Failed to communicate with server DB, falling back to localStorage:', err);
        const localMembers = localStorage.getItem('clan_members');
        if (localMembers) {
          try { setMembers(JSON.parse(localMembers)); } catch (e) {}
        }
        const localContributions = localStorage.getItem('clan_contributions');
        if (localContributions) {
          try { setContributions(JSON.parse(localContributions)); } catch (e) {}
        }
        const localArticles = localStorage.getItem('clan_articles');
        if (localArticles) {
          try { setArticles(JSON.parse(localArticles)); } catch (e) {}
        }
        const localChangeRequests = localStorage.getItem('clan_changeRequests');
        if (localChangeRequests) {
          try { setChangeRequests(JSON.parse(localChangeRequests)); } catch (e) {}
        }
        const localAccounts = localStorage.getItem('clan_accounts');
        if (localAccounts) {
          try { setAccounts(JSON.parse(localAccounts)); } catch (e) {}
        }
        const localAuditLogs = localStorage.getItem('clan_auditLogs');
        if (localAuditLogs) {
          try { setAuditLogs(JSON.parse(localAuditLogs)); } catch (e) {}
        }
        const localClanSettings = localStorage.getItem('clan_clanSettings');
        if (localClanSettings) {
          try { setClanSettings(JSON.parse(localClanSettings)); } catch (e) {}
        }
      } finally {
        isLoadedRef.current = true;
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 2. Automated Sync Triggers (Listen to state changes and persist in real-time)
  useEffect(() => {
    if (!isLoadedRef.current) return;
    persistData('members', members);
  }, [members, persistData]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    persistData('contributions', contributions);
  }, [contributions, persistData]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    persistData('articles', articles);
  }, [articles, persistData]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    persistData('changeRequests', changeRequests);
  }, [changeRequests, persistData]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    persistData('accounts', accounts);
  }, [accounts, persistData]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    persistData('auditLogs', auditLogs);
  }, [auditLogs, persistData]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    persistData('clanSettings', clanSettings);
  }, [clanSettings, persistData]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    addAuditLog(
      'Chuyển trang hiển thị',
      'system',
      `Người dùng truy cập phân hệ: ${
        activeTab === 'tree' ? 'Sơ đồ cây gia phả' :
        activeTab === 'search' ? 'Tìm kiếm thành viên' :
        activeTab === 'news' ? 'Bản tin & Sự kiện dòng họ' :
        activeTab === 'contribution' ? 'Quỹ công đức gia tộc' :
        activeTab === 'admin' ? 'Ban Quản Trị Hệ Thống' : activeTab
      }`
    );
  }, [activeTab]);

  // Helper: Append Audit Log
  const addAuditLog = (
    action: string, 
    category: 'auth' | 'tree' | 'fund' | 'user' | 'system', 
    details?: string
  ) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'usr_guest',
      userName: currentUser?.fullName || 'Khách vãng lai',
      userRole: currentRole,
      action,
      category,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role !== 'admin' && activeTab === 'admin') {
      setActiveTab('tree');
    }
    addAuditLog(
      'Đăng nhập hệ thống thành công', 
      'auth', 
      `Người dùng ${user.fullName} (@${user.username}) đăng nhập vai trò ${user.role}`
    );
  };

  const handleLogout = () => {
    if (currentUser) {
      addAuditLog(
        'Đăng xuất khỏi hệ thống', 
        'auth', 
        `Tài khoản @${currentUser.username} (${currentUser.fullName}) đã đăng xuất`
      );
    }
    setCurrentUser(null);
    setCurrentRole('member');
    if (activeTab === 'admin') {
      setActiveTab('tree');
    }
  };

  const handleUpdateProfile = (updatedUser: UserAccount) => {
    setAccounts(prev => prev.map(a => a.id === updatedUser.id ? updatedUser : a));
    setCurrentUser(updatedUser);
    addAuditLog(
      'Cập nhật hồ sơ cá nhân', 
      'auth', 
      `Cập nhật thành công thông tin / mật khẩu tài khoản @${updatedUser.username}`
    );
  };

  // User RBAC Management Handlers
  const handleCreateAccount = (newAccData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const newAcc: UserAccount = {
      ...newAccData,
      id: `usr_${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString()
    };
    setAccounts(prev => [newAcc, ...prev]);
    addAuditLog(
      'Cấp tài khoản mới', 
      'user', 
      `Tạo tài khoản @${newAcc.username} cho ${newAcc.fullName}, vai trò: ${newAcc.role}`
    );
  };

  const handleToggleLockAccount = (userId: string) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === userId) {
        const nextStatus = a.status === 'active' ? 'locked' : 'active';
        addAuditLog(
          nextStatus === 'locked' ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
          'user',
          `${nextStatus === 'locked' ? 'Khóa' : 'Mở khóa'} tài khoản @${a.username} (${a.fullName})`
        );
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  const handleResetUserPassword = (userId: string) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === userId) {
        addAuditLog(
          'Đặt lại mật khẩu tài khoản',
          'user',
          `Đặt lại mật khẩu mặc định (123456) cho @${a.username}`
        );
        return { ...a, password: 'password123' };
      }
      return a;
    }));
    alert('Đã đặt lại mật khẩu về mặc định: password123');
  };

  const handleDeleteAccount = (userId: string) => {
    const acc = accounts.find(a => a.id === userId);
    setAccounts(prev => prev.filter(a => a.id !== userId));
    addAuditLog(
      'Xóa tài khoản khỏi hệ thống',
      'user',
      `Đã xóa vĩnh viễn tài khoản @${acc?.username || userId}`
    );
  };

  const handleUpdateClanSettings = (newSettings: ClanSettings) => {
    setClanSettings(newSettings);
    addAuditLog(
      'Cập nhật cấu hình dòng họ',
      'system',
      `Thay đổi thông tin nhà thờ từ đường, tài khoản ngân hàng quỹ công đức`
    );
  };

  const handleRestoreBackup = (data: { members: FamilyMember[]; contributions?: Contribution[] }) => {
    setMembers(data.members);
    if (data.contributions) {
      setContributions(data.contributions);
    }
    addAuditLog(
      'Khôi phục dữ liệu từ tệp sao lưu JSON',
      'system',
      `Khôi phục thành công ${data.members.length} thành viên phả đồ`
    );
  };

  // Workflow 1: Admin Approves Liaison Request
  const handleApproveRequest = (requestId: string) => {
    const req = changeRequests.find(r => r.id === requestId);
    if (!req) return;

    if (req.type === 'create_member') {
      const newMember: FamilyMember = {
        id: `mem_gen${req.proposedData.generation || 5}_${Date.now().toString().slice(-4)}`,
        fullName: req.proposedData.fullName || 'Thành viên mới',
        birthYear: req.proposedData.birthYear || 2024,
        deathYear: req.proposedData.deathYear || null,
        isAlive: req.proposedData.isAlive ?? true,
        gender: req.proposedData.gender || 'male',
        generation: req.proposedData.generation || 5,
        branch: req.proposedData.branch || 'Chi 1',
        title: req.proposedData.title || '',
        fatherId: req.proposedData.fatherId || null,
        motherId: req.proposedData.motherId || null,
        spouseName: req.proposedData.spouseName || null,
        spouses: req.proposedData.spouses || (req.proposedData.spouseName ? [{ fullName: req.proposedData.spouseName }] : []),
        lunarDeathDate: req.proposedData.lunarDeathDate || '',
        burialPlace: req.proposedData.burialPlace || '',
        phoneNumber: req.proposedData.phoneNumber || '',
        email: req.proposedData.email || '',
        currentAddress: req.proposedData.currentAddress || '',
        workplace: req.proposedData.workplace || '',
        bio: req.proposedData.bio || '',
        status: 'active',
        childrenIds: [],
        bankAccount: req.proposedData.bankAccount
      };

      setMembers(prev => [...prev, newMember]);
      addAuditLog('Phê duyệt thêm thành viên', 'tree', `Thêm ${newMember.fullName} vào đời ${newMember.generation}`);
    } else if (req.type === 'update_member' && req.targetMemberId) {
      setMembers(prev => prev.map(m => {
        if (m.id === req.targetMemberId) {
          return { ...m, ...req.proposedData };
        }
        return m;
      }));
      addAuditLog('Phê duyệt cập nhật thành viên', 'tree', `Cập nhật thông tin cho ID ${req.targetMemberId}`);
    } else if (req.type === 'delete_member' && req.targetMemberId) {
      const targetId = req.targetMemberId;
      const target = members.find(m => m.id === targetId);
      setMembers(prev => prev
        .filter(m => m.id !== targetId)
        .map(m => {
          const updated = { ...m };
          if (updated.fatherId === targetId) updated.fatherId = null;
          if (updated.motherId === targetId) updated.motherId = null;
          if (updated.childrenIds) {
            updated.childrenIds = updated.childrenIds.filter(id => id !== targetId);
          }
          return updated;
        })
      );
      if (selectedMemberForModal?.id === targetId) {
        setSelectedMemberForModal(null);
      }
      addAuditLog('Phê duyệt xóa thành viên', 'tree', `Xóa ${target?.fullName || targetId} khỏi phả đồ`);
    }

    setChangeRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'approved',
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Ban Quản Trị'
        };
      }
      return r;
    }));
  };

  // Workflow 1: Admin Rejects Liaison Request
  const handleRejectRequest = (requestId: string, reason: string) => {
    setChangeRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'rejected',
          reviewComment: reason,
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Ban Quản Trị'
        };
      }
      return r;
    }));
    addAuditLog('Từ chối đề xuất thay đổi', 'tree', `Từ chối đề xuất #${requestId}. Lý do: ${reason}`);
  };

  // Workflow 2: Admin confirms Fund Contribution
  const handleConfirmContribution = (contributionId: string) => {
    setContributions(prev => prev.map(c => {
      if (c.id === contributionId) {
        addAuditLog(
          'Duyệt giao dịch công đức', 
          'fund', 
          `Xác nhận ${c.amount.toLocaleString('vi-VN')} VNĐ từ ${c.donorName} (Mã GD: ${c.transactionRef})`
        );
        return {
          ...c,
          status: 'confirmed',
          confirmedAt: new Date().toISOString(),
          confirmedBy: currentUser ? currentUser.fullName : 'Thủ Quỹ Dòng Họ'
        };
      }
      return c;
    }));
  };

  // Member Form Submit (Direct Admin Add vs Liaison Proposal)
  const handleMemberSubmit = (data: Partial<FamilyMember>, isDirectAdminAdd: boolean) => {
    if (isDirectAdminAdd) {
      if (editTargetMember) {
        // Direct update
        setMembers(prev => prev.map(m => m.id === editTargetMember.id ? { ...m, ...data } : m));
        addAuditLog('Cập nhật trực tiếp thành viên', 'tree', `Admin cập nhật thông tin ${editTargetMember.fullName}`);
      } else {
        // Direct create
        const newMember: FamilyMember = {
          id: `mem_gen${data.generation || 5}_${Date.now().toString().slice(-4)}`,
          fullName: data.fullName || '',
          birthYear: data.birthYear || 2024,
          deathYear: data.deathYear || null,
          isAlive: data.isAlive ?? true,
          gender: data.gender || 'male',
          generation: data.generation || 5,
          branch: data.branch || 'Chi 1',
          title: data.title || '',
          fatherId: data.fatherId || null,
          motherId: data.motherId || null,
          spouseName: data.spouseName || null,
          spouses: data.spouses || (data.spouseName ? [{ fullName: data.spouseName }] : []),
          lunarDeathDate: data.lunarDeathDate || '',
          burialPlace: data.burialPlace || '',
          phoneNumber: data.phoneNumber || '',
          email: data.email || '',
          currentAddress: data.currentAddress || '',
          workplace: data.workplace || '',
          bio: data.bio || '',
          status: 'active',
          childrenIds: [],
          bankAccount: data.bankAccount
        };
        setMembers(prev => [...prev, newMember]);
        addAuditLog('Thêm trực tiếp thành viên', 'tree', `Admin thêm ${newMember.fullName} vào cây`);
      }
    } else {
      // Liaison proposal -> enqueue into changeRequests
      const newRequest: ChangeRequest = {
        id: `req_${Date.now().toString().slice(-4)}`,
        type: editTargetMember ? 'update_member' : 'create_member',
        targetMemberId: editTargetMember?.id,
        proposedBy: currentUser?.id || 'usr_liaison_01',
        proposedByName: currentUser ? `${currentUser.fullName} (${currentUser.branch})` : 'Nguyễn Lan Anh (Liên lạc viên Chi 1)',
        proposedByRole: 'liaison',
        proposedData: data,
        currentData: editTargetMember || undefined,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        reviewComment: editTargetMember 
          ? `Đề xuất cập nhật thông tin cho thành viên ${editTargetMember.fullName}.` 
          : `Đề xuất thêm thành viên mới ${data.fullName} vào cây gia phả.`
      };

      setChangeRequests(prev => [newRequest, ...prev]);
      addAuditLog('Gửi đề xuất sửa đổi gia phả', 'tree', `Liên lạc viên đề xuất: ${newRequest.reviewComment}`);
      alert('Đề xuất đã được gửi thành công! Quản trị viên (Admin) sẽ xét duyệt và cập nhật lên cây gia phả chính.');
    }
    setEditTargetMember(null);
  };

  // Member Modal Actions
  const handleProposeEdit = (member: FamilyMember) => {
    setEditTargetMember(member);
    setInitialParentIdForAdd(null);
    setSelectedMemberForModal(null);
    setIsAddModalOpen(true);
  };

  const handleDirectEdit = (member: FamilyMember) => {
    setEditTargetMember(member);
    setInitialParentIdForAdd(null);
    setSelectedMemberForModal(null);
    setIsAddModalOpen(true);
  };

  const handleOpenDelete = (member: FamilyMember) => {
    setDeleteTargetMember(member);
  };

  const handleConfirmDelete = (memberId: string, isDirectAdmin: boolean, reason?: string) => {
    if (isDirectAdmin) {
      // Direct Admin Delete
      const target = members.find(m => m.id === memberId);
      setMembers(prev => prev
        .filter(m => m.id !== memberId)
        .map(m => {
          const updated = { ...m };
          if (updated.fatherId === memberId) updated.fatherId = null;
          if (updated.motherId === memberId) updated.motherId = null;
          if (updated.childrenIds) {
            updated.childrenIds = updated.childrenIds.filter(id => id !== memberId);
          }
          return updated;
        })
      );
      if (selectedMemberForModal?.id === memberId) {
        setSelectedMemberForModal(null);
      }
      addAuditLog('Xóa trực tiếp thành viên', 'tree', `Admin xóa ${target?.fullName || memberId} khỏi phả đồ`);
    } else {
      // Liaison Proposal
      const target = members.find(m => m.id === memberId);
      if (!target) return;
      const newRequest: ChangeRequest = {
        id: `req_${Date.now().toString().slice(-4)}`,
        type: 'delete_member',
        targetMemberId: memberId,
        proposedBy: currentUser?.id || 'usr_liaison_01',
        proposedByName: currentUser ? `${currentUser.fullName} (${currentUser.branch})` : 'Nguyễn Lan Anh (Liên lạc viên Chi 1)',
        proposedByRole: 'liaison',
        proposedData: target,
        currentData: target,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        reviewComment: reason || `Đề xuất xoá thành viên ${target.fullName} khỏi cây phả đồ.`
      };
      setChangeRequests(prev => [newRequest, ...prev]);
      addAuditLog('Đề xuất xóa thành viên', 'tree', `Liên lạc viên đề xuất xóa ${target.fullName}`);
      alert('Đề xuất xoá thành viên đã được gửi đến Ban Quản Trị để xét duyệt!');
    }
    setDeleteTargetMember(null);
  };

  const handleAddChild = (parentMember: FamilyMember) => {
    setEditTargetMember(null);
    setInitialParentIdForAdd(parentMember.id);
    setIsAddModalOpen(true);
  };

  const handleSelectMember = (member: FamilyMember) => {
    setSelectedMemberForModal(member);
    addAuditLog(
      'Xem thông tin thành viên',
      'tree',
      `Người dùng xem hồ sơ chi tiết của ${member.fullName} (Đời ${member.generation}, ${member.branch})`
    );
  };

  const handleNavigateToTreeWithMember = (member: FamilyMember) => {
    setActiveTab('tree');
    handleSelectMember(member);
  };

  // Add News Article
  const handleAddArticle = (newArt: Partial<NewsArticle>) => {
    const article: NewsArticle = {
      id: `art_${Date.now().toString().slice(-4)}`,
      title: newArt.title || '',
      slug: (newArt.title || '').toLowerCase().replace(/\s+/g, '-'),
      category: newArt.category || 'news',
      summary: newArt.summary || '',
      content: newArt.content || '',
      authorId: currentUser?.id || 'usr_current',
      authorName: newArt.authorName || currentUser?.fullName || 'Ban Biên Tập',
      authorRole: currentRole,
      coverImageUrl: newArt.coverImageUrl,
      publishedAt: new Date().toISOString(),
      status: newArt.status || 'published',
      views: 1
    };
    setArticles(prev => [article, ...prev]);
    addAuditLog('Đăng bản tin dòng họ', 'system', `Bài viết: "${article.title}"`);
  };

  // User role update inside RBAC manager
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === userId) {
        addAuditLog('Thay đổi vai trò người dùng', 'user', `Cập nhật @${a.username} thành ${newRole}`);
        return { ...a, role: newRole };
      }
      return a;
    }));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
      setCurrentRole(newRole);
    }
  };

  // Contributions Submit
  const handleSubmitContribution = (data: Omit<Contribution, 'id' | 'createdAt' | 'status'>) => {
    const newContrib: Contribution = {
      ...data,
      id: `contrib_${Date.now().toString().slice(-4)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setContributions(prev => [newContrib, ...prev]);
    addAuditLog(
      'Gửi đóng góp quỹ công đức', 
      'fund', 
      `${data.donorName} đóng góp ${data.amount.toLocaleString('vi-VN')} VNĐ (Mã GD: ${data.transactionRef})`
    );
  };

  const pendingApprovalsCount = changeRequests.filter(r => r.status === 'pending').length;
  const pendingContributionsCount = contributions.filter(c => c.status === 'pending').length;

  const handleOpenEditContentModal = (tab: 'header' | 'footer' | 'general' = 'header') => {
    setSiteContentModalInitialTab(tab);
    setIsSiteContentModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfbf9] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-amber-900 font-serif-display animate-pulse">
          Đang kết nối & tải dữ liệu gia phả...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Primary Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        pendingApprovalsCount={pendingApprovalsCount}
        pendingContributionsCount={pendingContributionsCount}
        currentUser={currentUser}
        clanSettings={clanSettings}
        onOpenLoginModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenEditContentModal={handleOpenEditContentModal}
        onOpenAIScanner={currentRole === 'admin' ? () => setIsGlobalAIScannerOpen(true) : undefined}
        onLogout={handleLogout}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-20 md:pb-6">
        {activeTab === 'tree' && (
          <FamilyTree
            members={members}
            onSelectMember={handleSelectMember}
            currentRole={currentRole}
            onAddNewMember={() => {
              setEditTargetMember(null);
              setInitialParentIdForAdd(null);
              setIsAddModalOpen(true);
            }}
            onEditMember={(m) => {
              setEditTargetMember(m);
              setInitialParentIdForAdd(null);
              setIsAddModalOpen(true);
            }}
            onDeleteMember={handleOpenDelete}
            onAddChild={handleAddChild}
          />
        )}

        {activeTab === 'search' && (
          <MemberSearch
            members={members}
            onSelectMember={handleSelectMember}
            onNavigateToTreeWithMember={handleNavigateToTreeWithMember}
            currentRole={currentRole}
            onAddNewMember={() => {
              setEditTargetMember(null);
              setInitialParentIdForAdd(null);
              setIsAddModalOpen(true);
            }}
            onEditMember={(m) => {
              setEditTargetMember(m);
              setInitialParentIdForAdd(null);
              setIsAddModalOpen(true);
            }}
            onDeleteMember={handleOpenDelete}
          />
        )}

        {activeTab === 'news' && (
          <NewsAndMedia
            articles={articles}
            boardMembers={boardMembers}
            currentRole={currentRole}
            onAddArticle={handleAddArticle}
            onViewArticle={(art) => {
              addAuditLog('Xem bản tin dòng họ', 'system', `Đọc bài viết: "${art.title}"`);
            }}
          />
        )}

        {activeTab === 'contribution' && (
          <ContributionView
            contributions={contributions}
            currentRole={currentRole}
            clanSettings={clanSettings}
            onUpdateClanSettings={handleUpdateClanSettings}
            onSubmitContribution={handleSubmitContribution}
            onConfirmContribution={handleConfirmContribution}
          />
        )}

        {activeTab === 'admin' && (
          currentRole === 'admin' ? (
            <AdminApprovalPanel
              changeRequests={changeRequests}
              members={members}
              contributions={contributions}
              currentRole={currentRole}
              currentUser={currentUser}
              accounts={accounts}
              auditLogs={auditLogs}
              clanSettings={clanSettings}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
              onConfirmContribution={handleConfirmContribution}
              onUpdateUserRole={handleUpdateUserRole}
              onCreateAccount={handleCreateAccount}
              onToggleLockAccount={handleToggleLockAccount}
              onResetUserPassword={handleResetUserPassword}
              onDeleteAccount={handleDeleteAccount}
              onUpdateClanSettings={handleUpdateClanSettings}
              onRestoreBackup={handleRestoreBackup}
              onAddNewMemberDirect={() => {
                setEditTargetMember(null);
                setInitialParentIdForAdd(null);
                setIsAddModalOpen(true);
              }}
              onOpenLoginModal={() => setIsAuthModalOpen(true)}
              onOpenEditContentModal={handleOpenEditContentModal}
              saveStatus={Object.keys(activeSaves).length > 0 ? 'saving' : saveError ? 'error' : 'saved'}
              saveError={saveError}
              lastSaved={lastSaved}
              onForceSync={handleForceSync}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 p-8 bg-white border border-amber-200 rounded-2xl shadow-sm text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
                <Shield className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 font-serif-display">Khu Vực Phê Duyệt & Quản Trị Dòng Họ</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Phân hệ này chỉ dành riêng cho Ban Quản Trị (Admin). Vui lòng đăng nhập với tài khoản có quyền Quản trị viên để truy cập.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Đăng Nhập Quản Trị
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tree')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Về Cây Phả Đồ
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer with dynamic branding & admin quick-edit */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500 mt-auto mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-sm font-serif-display">
                  {clanSettings.footerTitle || 'Gia Phả Họ Tộc Online'}
                </span>
                {clanSettings.footerSubtitle && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-800 font-medium">{clanSettings.footerSubtitle}</span>
                  </>
                )}
              </div>
              {clanSettings.footerDescription && (
                <p className="text-slate-500 max-w-2xl text-[11px] leading-relaxed">
                  {clanSettings.footerDescription}
                </p>
              )}
            </div>

            {currentRole === 'admin' && (
              <button
                id="btn-footer-edit-content"
                onClick={() => handleOpenEditContentModal('footer')}
                className="self-start md:self-auto px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs shrink-0"
                title="Chỉnh sửa nội dung Header & Footer"
              >
                <Palette className="w-3.5 h-3.5 text-amber-700" />
                <span>Chỉnh Sửa Giao Diện & Chân Trang</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div>
              {clanSettings.footerCopyright || `© ${new Date().getFullYear()} Ban Trị Sự Họ Tộc. Bảo lưu mọi quyền.`}
            </div>
            <div>
              {clanSettings.footerLinksNote || `${clanSettings.clanName} • ${clanSettings.branchName}`}
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Edit Site Content (Header & Footer) Modal */}
      <EditSiteContentModal
        isOpen={isSiteContentModalOpen}
        onClose={() => setIsSiteContentModalOpen(false)}
        clanSettings={clanSettings}
        onSave={(updated) => {
          handleUpdateClanSettings(updated);
        }}
        initialTab={siteContentModalInitialTab}
      />

      {/* Member Detail & 3-Generation Mini Subtree Modal */}
      {selectedMemberForModal && (
        <MemberModal
          member={selectedMemberForModal}
          allMembers={members}
          onClose={() => setSelectedMemberForModal(null)}
          onSelectMember={(id) => {
            const m = members.find(item => item.id === id);
            if (m) handleSelectMember(m);
          }}
          currentRole={currentRole}
          onProposeEdit={handleProposeEdit}
          onDirectEdit={handleDirectEdit}
          onDeleteMember={handleOpenDelete}
          onAddChild={handleAddChild}
        />
      )}

      {/* Add / Edit / Propose Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditTargetMember(null);
          setInitialParentIdForAdd(null);
          setPrefilledScannedMember(null);
        }}
        allMembers={members}
        currentRole={currentRole}
        editTargetMember={editTargetMember}
        initialParentId={initialParentIdForAdd}
        initialScannedData={prefilledScannedMember}
        onSubmit={handleMemberSubmit}
      />

      {/* Delete / Propose Delete Member Modal */}
      <DeleteMemberModal
        isOpen={!!deleteTargetMember}
        onClose={() => setDeleteTargetMember(null)}
        member={deleteTargetMember}
        currentRole={currentRole}
        allMembers={members}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Login / Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        accounts={accounts}
        members={members}
        onLogin={handleLogin}
        onLoginSuccess={handleLogin}
        onLogout={handleLogout}
      />

      {/* Admin Profile & Password Management Modal */}
      <AdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />

      {/* Global AI Scanner Modal (Admin Only) */}
      {currentRole === 'admin' && (
        <AIScannerModal
          isOpen={isGlobalAIScannerOpen}
          onClose={() => setIsGlobalAIScannerOpen(false)}
          onApplyMember={(scannedMember) => {
            setIsGlobalAIScannerOpen(false);
            const mapped: Partial<FamilyMember> = {
              fullName: scannedMember.fullName,
              birthYear: scannedMember.birthYear,
              deathYear: scannedMember.deathYear,
              isAlive: scannedMember.isAlive,
              gender: scannedMember.gender,
              generation: scannedMember.generation || 4,
              branch: scannedMember.branch || 'Chi 1',
              workplace: scannedMember.workplace,
              currentAddress: scannedMember.currentAddress,
              spouseName: scannedMember.spouseName,
              bio: scannedMember.notes,
              bankAccount: scannedMember.bankAccount ? {
                bankName: scannedMember.bankAccount.bankName,
                accountNumber: scannedMember.bankAccount.accountNumber,
                accountHolder: scannedMember.bankAccount.accountHolder,
                branchName: scannedMember.bankAccount.branchName,
                qrCodeUrl: scannedMember.bankAccount.qrCodeUrl
              } : undefined
            };
            setEditTargetMember(null);
            setInitialParentIdForAdd(null);
            setPrefilledScannedMember(mapped);
            setIsAddModalOpen(true);
            addAuditLog(
              'Số hóa AI thành viên',
              'system',
              `Quét và số hóa thành công thông tin thành viên ${mapped.fullName || 'vừa phân tích'}`
            );
          }}
        />
      )}
    </div>
  );
}

