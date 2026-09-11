import { FamilyMember, Contribution, NewsArticle, ChangeRequest, BoardMember, UserAccount, AuditLog, ClanSettings } from '../types';

export const INITIAL_MEMBERS: FamilyMember[] = [
  // A clean, single root ancestor to start building the tree
  {
    id: 'root_ancestor',
    fullName: 'Cụ Thủy Tổ (Họ Nguyễn)',
    birthYear: 1900,
    deathYear: 1975,
    isAlive: false,
    gender: 'male',
    generation: 1,
    branch: 'Thủy Tổ Chi Phái',
    title: 'Thủy Tổ Dòng Họ',
    fatherId: null,
    motherId: null,
    spouseName: 'Cụ Bà Thủy Tổ',
    spouses: [
      {
        fullName: 'Cụ Bà Thủy Tổ',
        spouseRole: 'chinh_that',
        birthYear: 1905,
        deathYear: 1980,
        isAlive: false,
        notes: 'Cụ bà chính thất khởi thủy dòng họ.'
      }
    ],
    bio: 'Cụ khởi thủy dòng họ, đặt nền móng cho gia tộc. Nhấp vào để chỉnh sửa hoặc thêm con cháu đời sau.',
    status: 'active',
    childrenIds: []
  }
];

export const INITIAL_CONTRIBUTIONS: Contribution[] = [];

export const INITIAL_ARTICLES: NewsArticle[] = [
  {
    id: 'art_001',
    title: 'Chào mừng đến với Hệ thống Gia Phả Số Dòng Họ',
    slug: 'chao-mung-he-thong-gia-pha-so',
    category: 'news',
    summary: 'Chào mừng bà con cô bác họ tộc truy cập trang tin và gia phả trực tuyến.',
    content: `Kính thưa toàn thể bà con nội ngoại dòng họ!

Hệ thống Gia phả số của dòng họ chúng ta đã chính thức được thiết lập. Đây là nơi lưu trữ, tra cứu phả hệ, đóng góp quỹ dòng họ và chia sẻ bản tin sự kiện.

Ban quản trị đã khởi tạo một thành viên Thủy Tổ ban đầu. Kính mời Trưởng tộc, các liên lạc viên tiến hành đăng nhập bằng tài khoản quản trị để bắt đầu xây dựng phả đồ, cập nhật thông tin thành viên cũng như đăng tải các sự kiện của dòng họ.`,
    authorId: 'usr_admin_01',
    authorName: 'Quản trị viên',
    authorRole: 'admin',
    coverImageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
    publishedAt: new Date().toISOString(),
    status: 'published',
    views: 1,
    tags: ['Chào mừng', 'Gia phả số']
  }
];

export const INITIAL_CHANGE_REQUESTS: ChangeRequest[] = [];

export const INITIAL_BOARD_MEMBERS: BoardMember[] = [];

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr_admin_01',
    username: 'admin',
    email: 'admin@giapha.vn',
    password: 'admin@2026',
    fullName: 'Quản Trị Viên Dòng Họ',
    phone: '0912 345 678',
    role: 'admin',
    branch: 'Ban Quản Trị',
    title: 'Trưởng Ban Trị Sự',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    lastLoginAt: '2026-03-09T08:30:00Z'
  },
  {
    id: 'usr_liaison_01',
    username: 'lienlac1',
    email: 'lienlac1@giapha.vn',
    password: 'liaison123',
    fullName: 'Nguyễn Văn Liên Lạc',
    phone: '0977 123 456',
    role: 'liaison',
    branch: 'Chi Phái 1',
    title: 'Liên Lạc Viên Chi 1',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-15T09:00:00Z',
    lastLoginAt: '2026-03-08T15:20:00Z'
  },
  {
    id: 'usr_reporter_01',
    username: 'phongvien',
    email: 'phongvien@giapha.vn',
    password: 'reporter123',
    fullName: 'Biên Tập Viên Bản Tin',
    phone: '0936 112 233',
    role: 'reporter',
    branch: 'Ban Truyền Thông',
    title: 'Cộng Tác Viên Bản Tin',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-03-01T14:00:00Z',
    lastLoginAt: '2026-03-06T17:10:00Z'
  },
  {
    id: 'usr_member_01',
    username: 'conchau',
    email: 'conchau@giapha.vn',
    password: 'member123',
    fullName: 'Nguyễn Thành Viên',
    phone: '0908 776 655',
    role: 'member',
    branch: 'Hậu Duệ',
    title: 'Thành Viên Dòng Họ',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-05-10T16:00:00Z',
    lastLoginAt: '2026-03-09T02:15:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_CLAN_SETTINGS: ClanSettings = {
  clanName: 'Dòng Họ Nguyễn',
  branchName: 'Chi Phái Đệ Nhất',
  establishedYear: 1900,
  headOfClan: 'Chưa cập nhật',
  ancestralHallAddress: 'Chưa cập nhật',
  worshipDateLunar: 'Chưa cập nhật',
  headerLogoText: '阮',
  headerTitle: 'Gia Phả Dòng Họ Online',
  headerSubtitle: 'Cội nguồn tiên tổ - Vạn đời hưng thịnh',
  headerEstText: 'Khởi lập 1900',
  headerBadgeText: 'Dòng Họ Nguyễn',
  headerAnnouncement: 'Chào mừng bà con đến với hệ thống quản lý phả hệ số trực tuyến dòng họ!',
  showHeaderAnnouncement: true,
  footerTitle: 'Gia Phả Họ Nguyễn Online',
  footerSubtitle: 'Hệ Thống Dòng Họ Nguyễn Chi Phái Đệ Nhất',
  footerDescription: 'Nền tảng quản lý gia phả thông minh, lưu truyền truyền thống uống nước nhớ nguồn cho muôn đời sau.',
  footerCopyright: '© 2026 Ban Trị Sự Dòng Họ Nguyễn. Bảo lưu mọi quyền.',
  footerLinksNote: 'Bảo tồn văn hóa truyền thống • Kết nối muôn đời con cháu',
  bankAccount: {
    bankName: 'Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)',
    accountNumber: '0011004567890',
    accountHolder: 'BAN TRI SU DONG HO',
    branchName: 'Chi nhánh Sở Giao Dịch Hà Nội',
    qrCodeUrl: 'https://api.vietqr.io/image/970436-0011004567890-print.jpg'
  },
  allowPublicView: true,
  requireApprovalForEdits: true,
  contactEmail: 'bantrisu@giaphahotoc.vn',
  contactPhone: '0912 345 678'
};
