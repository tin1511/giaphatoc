export type UserRole = 'admin' | 'liaison' | 'reporter' | 'member';

export type Gender = 'male' | 'female';

export type SpouseRole = 
  | 'chinh_that'   // Chính thất (Vợ cả)
  | 'ke_that'      // Kế thất (Vợ hai / Vợ kế)
  | 'thu_that'     // Thứ thất (Vợ lẽ)
  | 'chong'        // Chồng
  | 'phoi_ngau';   // Vợ/Chồng

export interface SpouseRelationship {
  id?: string;
  fullName: string;
  spouseRole?: SpouseRole | string;
  birthYear?: number;
  deathYear?: number | null;
  isAlive?: boolean;
  lunarDeathDate?: string; // Ngày giỗ kỵ âm lịch
  burialPlace?: string; // Nơi an táng / Mộ phần
  originAddress?: string; // Quê quán / Dòng tộc bên ngoại/nội (Nguyên quán)
  marriageYear?: number; // Năm thành hôn
  occupation?: string; // Nghề nghiệp / Chức vụ
  notes?: string; // Ghi chú thêm / Công đức
  memberId?: string | null; // Liên kết thành viên nếu có
}

export interface FamilyMember {
  id: string;
  fullName: string;
  birthYear: number;
  deathYear?: number | null;
  isAlive: boolean;
  gender: Gender;
  generation: number; // 1, 2, 3, 4, 5...
  branch: string; // Chi 1, Chi 2, Chi 3...
  title?: string; // e.g. "Thủy Tổ", "Trưởng Họ", "Chi Trưởng"
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
  spouseName?: string | null;
  spouses?: SpouseRelationship[]; // Danh sách quan hệ hôn phối / vợ chồng chi tiết
  isSpouse?: boolean; // Dâu hoặc Rể
  phoneNumber?: string;
  email?: string;
  currentAddress?: string;
  workplace?: string;
  lunarDeathDate?: string; // e.g. "15 tháng 3 Âm lịch"
  burialPlace?: string; // Nơi an táng / Mộ phần
  bio?: string;
  achievements?: string[];
  avatarUrl?: string;
  status: 'active' | 'pending_approval' | 'draft';
  childrenIds?: string[];
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branchName?: string;
    qrCodeUrl?: string;
  };
}

export interface AIScannedMemberResult {
  fullName?: string;
  gender?: Gender;
  birthYear?: number;
  deathYear?: number | null;
  isAlive?: boolean;
  generation?: number;
  branch?: string;
  title?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  spouseDetails?: SpouseRelationship;
  phoneNumber?: string;
  email?: string;
  currentAddress?: string;
  workplace?: string;
  lunarDeathDate?: string;
  burialPlace?: string;
  bio?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branchName?: string;
    qrCodeUrl?: string;
  };
  confidenceNotes?: string;
  sourceType?: 'cccd' | 'birth_certificate' | 'family_book' | 'text' | 'bank_card' | 'qr_code' | 'other';
}

export interface AIScannedBankQRResult {
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountHolder: string;
  branchName?: string;
  amount?: number;
  transferContent?: string;
  qrCodeUrl: string;
  detectedType: 'vietqr' | 'bank_card' | 'transfer_receipt' | 'text';
  notes?: string;
}

export type ContributionPurpose = 
  | 'duty'             // Nghĩa vụ thường niên
  | 'worship'          // Cúng dường ngày lễ giỗ
  | 'study_fund'       // Quỹ khuyến tài khuyến học
  | 'construction'     // Xây dựng, tu bổ từ đường
  | 'other';           // Mục đích khác

export interface Contribution {
  id: string;
  donorName: string;
  donorMemberId?: string;
  generationOrBranch: string;
  amount: number;
  purpose: ContributionPurpose;
  notes?: string;
  receiptImageUrl?: string;
  transactionRef: string;
  bankAccountReceiver: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: 'news' | 'activity' | 'history' | 'communion';
  summary: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  coverImageUrl?: string;
  publishedAt: string;
  status: 'draft' | 'pending_review' | 'published';
  views: number;
  tags?: string[];
}

export interface ChangeRequest {
  id: string;
  type: 'create_member' | 'update_member' | 'delete_member';
  targetMemberId?: string;
  proposedBy: string;
  proposedByName: string;
  proposedByRole: UserRole;
  proposedData: Partial<FamilyMember>;
  currentData?: Partial<FamilyMember>;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
}

export interface BoardMember {
  id: string;
  name: string;
  roleTitle: string;
  generation: number;
  branch: string;
  phone: string;
  email: string;
  address: string;
  avatarUrl: string;
}

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  phone: string;
  role: UserRole;
  branch: string;
  title?: string;
  avatarUrl?: string;
  status: 'active' | 'locked';
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'auth' | 'tree' | 'fund' | 'news' | 'user' | 'system';
  timestamp: string;
  details?: string;
}

export interface ClanSettings {
  clanName: string;
  branchName: string;
  establishedYear: number;
  headOfClan: string;
  ancestralHallAddress: string;
  worshipDateLunar: string;
  // Header Customizations
  headerLogoText?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  headerEstText?: string;
  headerBadgeText?: string;
  headerAnnouncement?: string;
  showHeaderAnnouncement?: boolean;
  // Footer Customizations
  footerTitle?: string;
  footerSubtitle?: string;
  footerDescription?: string;
  footerCopyright?: string;
  footerLinksNote?: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branchName: string;
    qrCodeUrl?: string;
    qrType?: 'auto' | 'custom';
    customQrUrl?: string;
  };
  allowPublicView: boolean;
  requireApprovalForEdits: boolean;
  contactEmail: string;
  contactPhone: string;
}

