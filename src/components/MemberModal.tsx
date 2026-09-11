import React, { useState } from 'react';
import { FamilyMember, UserRole } from '../types';
import { 
  X, 
  User, 
  MapPin, 
  Briefcase, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Heart, 
  Edit3, 
  CheckCircle, 
  ChevronRight,
  Shield,
  Layers,
  Trash2,
  UserPlus,
  CreditCard,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { generateVietQRUrl } from '../utils/vietqr';

interface MemberModalProps {
  member: FamilyMember | null;
  allMembers: FamilyMember[];
  onClose: () => void;
  onSelectMember: (memberId: string) => void;
  currentRole: UserRole;
  onProposeEdit: (member: FamilyMember) => void;
  onDirectEdit: (member: FamilyMember) => void;
  onDeleteMember: (member: FamilyMember) => void;
  onAddChild?: (parentMember: FamilyMember) => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  member,
  allMembers,
  onClose,
  onSelectMember,
  currentRole,
  onProposeEdit,
  onDirectEdit,
  onDeleteMember,
  onAddChild
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'spouses' | 'miniTree'>('details');
  const [copiedSTK, setCopiedSTK] = useState(false);

  if (!member) return null;

  // Resolve direct ancestors (Cha / Mẹ, Ông / Bà)
  const father = member.fatherId ? allMembers.find(m => m.id === member.fatherId) : null;
  const mother = member.motherId ? allMembers.find(m => m.id === member.motherId) : null;
  const grandFather = father?.fatherId ? allMembers.find(m => m.id === father.fatherId) : null;
  const grandMother = father?.motherId ? allMembers.find(m => m.id === father.motherId) : null;

  // Resolve direct descendants (Con cái, Cháu)
  const children = allMembers.filter(m => m.fatherId === member.id || m.motherId === member.id);
  const grandChildren = allMembers.filter(m => 
    children.some(child => child.id === m.fatherId || child.id === m.motherId)
  );

  // Resolve spouse list (either from rich spouses array or fallback to spouseName string)
  const resolvedSpouses = member.spouses && member.spouses.length > 0
    ? member.spouses
    : member.spouseName
      ? [{
          fullName: member.spouseName,
          spouseRole: (member.gender === 'female' ? 'chong' : 'chinh_that') as any,
          isAlive: true
        }]
      : [];

  const getSpouseRoleInfo = (role?: string) => {
    switch (role) {
      case 'chinh_that':
        return { label: 'Chính thất (Vợ cả)', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'ke_that':
        return { label: 'Kế thất (Vợ hai)', color: 'bg-pink-100 text-pink-800 border-pink-200' };
      case 'thu_that':
        return { label: 'Thứ thất (Vợ lẽ)', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'chong':
        return { label: 'Chồng (Chàng rể)', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'phoi_ngau':
        return { label: 'Vợ/Chồng', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { 
          label: member.gender === 'female' ? 'Chồng' : 'Chính thất (Vợ cả)', 
          color: 'bg-rose-100 text-rose-800 border-rose-200' 
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="member-detail-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white p-5 relative">
          <button
            id="close-member-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-2xl border-2 border-amber-300 shadow-inner font-serif-display">
              {member.fullName.charAt(member.fullName.lastIndexOf(' ') + 1) || 'N'}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30">
                  Đời thứ {member.generation} • {member.branch}
                </span>
                {member.title && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-300 text-amber-950">
                    ★ {member.title}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  member.isAlive ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-500/40 text-slate-200'
                }`}>
                  {member.isAlive ? '● Còn sống' : '† Đã quy tiên'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-display mt-1 text-white">
                {member.fullName}
              </h2>
              <p className="text-xs text-amber-200/80 mt-0.5">
                {member.birthYear} - {member.isAlive ? 'Nay' : (member.deathYear || 'Không rõ')} 
                {member.lunarDeathDate && ` (Giỗ: ${member.lunarDeathDate})`}
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs inside Modal */}
          <div className="flex flex-wrap gap-2 mt-5 border-t border-amber-700/50 pt-3">
            <button
              id="modal-tab-details"
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'details'
                  ? 'bg-white text-amber-900 font-semibold shadow-xs'
                  : 'text-amber-200 hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Thông Tin Chi Tiết
            </button>
            <button
              id="modal-tab-spouses"
              onClick={() => setActiveTab('spouses')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'spouses'
                  ? 'bg-white text-rose-900 font-semibold shadow-xs'
                  : 'text-amber-200 hover:bg-white/10'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Quan Hệ Vợ Chồng</span>
              {resolvedSpouses.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {resolvedSpouses.length}
                </span>
              )}
            </button>
            <button
              id="modal-tab-minitree"
              onClick={() => setActiveTab('miniTree')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'miniTree'
                  ? 'bg-white text-amber-900 font-semibold shadow-xs'
                  : 'text-amber-200 hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Cây Phả Hệ Thu Nhỏ (3 Thế Hệ)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Bio / Introduction */}
              {member.bio && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-700" />
                    Tiểu Sử & Công Đức
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              )}

              {/* Grid of Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                    Thông Tin Cá Nhân & Gia Đình
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-xs">Giới tính:</span>
                      <span className="font-medium text-slate-800">{member.gender === 'male' ? 'Nam' : 'Nữ'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-xs">Vợ/Chồng:</span>
                      {resolvedSpouses.length > 0 ? (
                        <button
                          onClick={() => setActiveTab('spouses')}
                          className="font-medium text-rose-700 hover:underline flex items-center gap-1 text-xs"
                          title="Xem chi tiết quan hệ vợ chồng"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-100" />
                          <span className="max-w-[140px] truncate">{resolvedSpouses[0].fullName}</span>
                          <span className="text-[10px] text-rose-500 underline font-normal">→ Xem</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs italic">Chưa cập nhật</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-xs">Người Cha trực hệ:</span>
                      {father ? (
                        <button 
                          onClick={() => onSelectMember(father.id)}
                          className="font-medium text-amber-800 hover:underline text-right text-xs"
                        >
                          {father.fullName} (Đời {father.generation})
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs">Thủy Tổ / Không rõ</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-xs">Người Mẹ:</span>
                      {mother ? (
                        <button 
                          onClick={() => onSelectMember(mother.id)}
                          className="font-medium text-rose-800 hover:underline text-right text-xs"
                        >
                          {mother.fullName} (Đời {mother.generation})
                        </button>
                      ) : (
                        <span className="text-slate-500 italic text-xs">Chưa rõ / Chưa cập nhật</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-xs">Số lượng con cái:</span>
                      <span className="font-medium text-slate-800">{children.length} người</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                    Công Tác, Nơi Ở & Mộ Phần
                  </h4>
                  <div className="space-y-2.5 text-sm">
                    {member.workplace && (
                      <div className="flex items-start gap-2">
                        <Briefcase className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-slate-700 block">Nơi công tác / Chức vụ:</span>
                          <span className="font-medium text-slate-800">{member.workplace}</span>
                        </div>
                      </div>
                    )}
                    {member.currentAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-slate-700 block">Nơi cư trú / Quê quán:</span>
                          <span className="font-medium text-slate-800">{member.currentAddress}</span>
                        </div>
                      </div>
                    )}
                    {member.burialPlace && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-slate-700 block">Mộ phần / Nơi an nghỉ:</span>
                          <span className="font-medium text-slate-800">{member.burialPlace}</span>
                        </div>
                      </div>
                    )}
                    {(member.phoneNumber || member.email) && (
                      <div className="flex items-center gap-4 pt-1 border-t border-slate-100 text-xs text-slate-600">
                        {member.phoneNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-700" /> {member.phoneNumber}
                          </span>
                        )}
                        {member.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-700" /> {member.email}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Achievements */}
              {member.achievements && member.achievements.length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Thành Tích & Khen Thưởng Tiêu Biểu
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {member.achievements.map((ach, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        {ach}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Member Bank Account & VietQR */}
              {member.bankAccount && member.bankAccount.accountNumber && (
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                      Tài Khoản Ngân Hàng & Mã VietQR Cá Nhân
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      <QrCode className="w-3 h-3" />
                      VietQR
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
                    <div className="w-28 h-28 bg-slate-50 p-1.5 rounded-lg border border-slate-200 shrink-0 flex items-center justify-center">
                      <img
                        src={member.bankAccount.qrCodeUrl || generateVietQRUrl({
                          bankNameOrBin: member.bankAccount.bankName,
                          accountNumber: member.bankAccount.accountNumber,
                          accountHolder: member.bankAccount.accountHolder || member.fullName
                        })}
                        alt="VietQR Member"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1.5 text-xs w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Ngân hàng:</span>
                        <span className="font-bold text-slate-800">{member.bankAccount.bankName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Số tài khoản:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-amber-900 text-sm">{member.bankAccount.accountNumber}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(member.bankAccount!.accountNumber);
                              setCopiedSTK(true);
                              setTimeout(() => setCopiedSTK(false), 2000);
                            }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors cursor-pointer"
                            title="Sao chép số tài khoản"
                          >
                            {copiedSTK ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Chủ tài khoản:</span>
                        <span className="font-semibold text-slate-800 uppercase font-mono">{member.bankAccount.accountHolder || member.fullName}</span>
                      </div>
                      {member.bankAccount.branchName && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Chi nhánh:</span>
                          <span className="text-slate-700">{member.bankAccount.branchName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Spouses Relationship Tab */}
          {activeTab === 'spouses' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Introduction Banner */}
              <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-4 text-xs text-rose-950 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-900 text-sm mb-1 font-serif-display">
                    Quan Hệ Hôn Phối & Giao Hảo Dòng Họ
                  </h4>
                  <p className="text-rose-800/90 leading-relaxed">
                    Tôn vinh đạo nghĩa vợ chồng, ghi nhận công đức của Dâu hiền, Rể thảo đồng hành phụng sự tiên tổ, nuôi dạy các thế hệ con cháu và bồi đắp phúc trạch cho dòng họ.
                  </p>
                </div>
              </div>

              {/* List of Spouses */}
              {resolvedSpouses.length > 0 ? (
                <div className="space-y-4">
                  {resolvedSpouses.map((spouse, idx) => {
                    const roleInfo = getSpouseRoleInfo(spouse.spouseRole);
                    return (
                      <div 
                        key={idx}
                        className="bg-white rounded-2xl border border-rose-200/80 shadow-xs overflow-hidden"
                      >
                        {/* Spouse Header */}
                        <div className="p-4 bg-gradient-to-r from-rose-50/70 via-amber-50/40 to-white border-b border-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 font-bold font-serif-display flex items-center justify-center text-lg shadow-inner">
                              {spouse.fullName.charAt(spouse.fullName.lastIndexOf(' ') + 1) || 'V'}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleInfo.color}`}>
                                  {roleInfo.label}
                                </span>
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                  spouse.isAlive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                  {spouse.isAlive ? '● Còn sống' : '† Đã quy tiên'}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 font-serif-display mt-0.5">
                                {spouse.fullName}
                              </h3>
                            </div>
                          </div>

                          {(currentRole === 'admin' || currentRole === 'liaison') && (
                            <button
                              onClick={() => {
                                if (currentRole === 'admin') onDirectEdit(member);
                                else onProposeEdit(member);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 self-end sm:self-auto"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Sửa Hôn Phối
                            </button>
                          )}
                        </div>

                        {/* Spouse Details Body */}
                        <div className="p-4 space-y-4 text-xs sm:text-sm">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* Year of birth / death */}
                            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                              <span className="text-slate-500 text-[11px] block font-medium">Năm sinh / Năm mất:</span>
                              <span className="font-semibold text-slate-800">
                                {spouse.birthYear || 'Chưa rõ năm sinh'} 
                                {spouse.deathYear ? ` — ${spouse.deathYear}` : (spouse.isAlive ? ' (Hiện còn sống)' : '')}
                              </span>
                            </div>

                            {/* Marriage year */}
                            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                              <span className="text-slate-500 text-[11px] block font-medium">Năm thành hôn / kết hôn:</span>
                              <span className="font-semibold text-slate-800">
                                {spouse.marriageYear ? `Năm ${spouse.marriageYear}` : 'Chưa ghi nhận năm thành hôn'}
                              </span>
                            </div>

                            {/* Origin address / In-laws clan */}
                            {spouse.originAddress && (
                              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                                <span className="text-slate-500 text-[11px] block font-medium flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-rose-500" />
                                  Nguyên quán / Dòng dõi bên ngoại (thông gia):
                                </span>
                                <span className="font-semibold text-slate-800">{spouse.originAddress}</span>
                              </div>
                            )}

                            {/* Occupation */}
                            {spouse.occupation && (
                              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                                <span className="text-slate-500 text-[11px] block font-medium flex items-center gap-1">
                                  <Briefcase className="w-3 h-3 text-slate-600" />
                                  Nghề nghiệp / Chức vụ / Công tác:
                                </span>
                                <span className="font-semibold text-slate-800">{spouse.occupation}</span>
                              </div>
                            )}

                            {/* Lunar death date */}
                            {spouse.lunarDeathDate && (
                              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
                                <span className="text-amber-800 text-[11px] block font-medium flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-amber-700" />
                                  Ngày kỵ giỗ Âm lịch:
                                </span>
                                <span className="font-semibold text-amber-950">{spouse.lunarDeathDate}</span>
                              </div>
                            )}

                            {/* Burial place */}
                            {spouse.burialPlace && (
                              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                                <span className="text-slate-500 text-[11px] block font-medium flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-600" />
                                  Mộ phần / Nơi an nghỉ:
                                </span>
                                <span className="font-semibold text-slate-800">{spouse.burialPlace}</span>
                              </div>
                            )}
                          </div>

                          {/* Notes and virtues */}
                          {spouse.notes && (
                            <div className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-100 text-xs text-slate-700 leading-relaxed space-y-1">
                              <span className="font-bold text-rose-900 block flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-rose-600" />
                                Ghi chú & Công đức phụng sự gia tộc:
                              </span>
                              <p className="text-slate-800">{spouse.notes}</p>
                            </div>
                          )}

                          {/* Shared children section */}
                          <div className="pt-3 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-700 block mb-2">
                              Con chung trong gia phả ({children.length} người):
                            </span>
                            {children.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {children.map(child => (
                                  <button
                                    key={child.id}
                                    onClick={() => onSelectMember(child.id)}
                                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 hover:bg-rose-100 text-slate-800 hover:text-rose-900 border border-slate-200 transition-colors flex items-center gap-1.5"
                                  >
                                    <span className={`w-2 h-2 rounded-full ${child.gender === 'male' ? 'bg-blue-500' : 'bg-rose-500'}`} />
                                    <span className="font-medium">{child.fullName}</span>
                                    <span className="text-[10px] text-slate-500">(Đời {child.generation})</span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-500 text-xs italic">
                                Chưa liên kết danh sách con cái trong cơ sở dữ liệu.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty state when no spouse info */
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
                    <Heart className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base text-slate-800 font-serif-display">
                    Chưa có thông tin quan hệ vợ chồng (hôn phối)
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Hiện tại thành viên này chưa được ghi nhận thông tin vợ/chồng (Dâu / Rể). Việc ghi nhận hôn phối giúp gia phả đầy đủ và lưu truyền dòng dõi thông gia cho muôn đời sau.
                  </p>
                  {(currentRole === 'admin' || currentRole === 'liaison') && (
                    <button
                      onClick={() => {
                        if (currentRole === 'admin') onDirectEdit(member);
                        else onProposeEdit(member);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      + Thêm Thông Tin Quan Hệ Vợ Chồng
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mini Lineage Tree Tab */}
          {activeTab === 'miniTree' && (
            <div className="space-y-6">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                <strong>Sơ đồ trực hệ 3 thế hệ:</strong> Giúp con cháu nắm bắt ngay huyết thống trực tiếp phía trước (Cha Mẹ, Ông Bà) và thế hệ nối dõi phía sau (Con cái, Cháu). Nhấp vào tên để chuyển sang xem chi tiết.
              </div>

              {/* 1. Generation Before: Ông Bà / Cha Mẹ */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  1. Thế Hệ Phía Trước (Tiền Nhân: Cha/Mẹ & Ông/Bà)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Grandfather */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-[11px] text-slate-500 font-medium block">Ông Nội:</span>
                    {grandFather ? (
                      <button 
                        onClick={() => onSelectMember(grandFather.id)}
                        className="font-semibold text-xs text-amber-950 hover:underline flex items-center justify-between w-full mt-0.5"
                      >
                        <span>{grandFather.fullName} (Đời {grandFather.generation})</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Thủy tổ hoặc chưa ghi nhận</span>
                    )}
                  </div>

                  {/* Grandmother */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span className="text-[11px] text-slate-500 font-medium block">Bà Nội:</span>
                    {grandMother ? (
                      <button 
                        onClick={() => onSelectMember(grandMother.id)}
                        className="font-semibold text-xs text-amber-950 hover:underline flex items-center justify-between w-full mt-0.5"
                      >
                        <span>{grandMother.fullName} (Đời {grandMother.generation})</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Chưa ghi nhận</span>
                    )}
                  </div>

                  {/* Father */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-amber-50/50">
                    <span className="text-[11px] text-amber-800 font-medium block">Cha Trực Hệ:</span>
                    {father ? (
                      <button 
                        onClick={() => onSelectMember(father.id)}
                        className="font-semibold text-xs text-amber-900 hover:underline flex items-center justify-between w-full mt-0.5"
                      >
                        <span>{father.fullName} (Đời {father.generation})</span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Thủy tổ thế hệ đầu tiên</span>
                    )}
                  </div>

                  {/* Mother */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-rose-50/50">
                    <span className="text-[11px] text-rose-800 font-medium block">Mẹ:</span>
                    {mother ? (
                      <button 
                        onClick={() => onSelectMember(mother.id)}
                        className="font-semibold text-xs text-rose-950 hover:underline flex items-center justify-between w-full mt-0.5"
                      >
                        <span>{mother.fullName} (Đời {mother.generation})</span>
                        <ChevronRight className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Chưa ghi nhận</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Current Generation: Đương sự & Vợ/Chồng (Dual Card connection) */}
              <div className="p-4 rounded-xl border-2 border-amber-600 bg-amber-50/60 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                  2. Thế Hệ Hiện Tại (Đương Sự & Vợ/Chồng)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Current Member Card */}
                  <div className="bg-white p-3.5 rounded-xl border border-amber-300 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-amber-800 block">
                        Đương sự (Đời {member.generation})
                      </span>
                      <h3 className="font-bold text-base text-slate-900 font-serif-display">
                        {member.fullName}
                      </h3>
                      <p className="text-[11px] text-slate-600">
                        {member.birthYear} - {member.isAlive ? 'Nay' : (member.deathYear || 'Không rõ')}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-amber-800 text-white shrink-0">
                      Đang xem
                    </span>
                  </div>

                  {/* Spouse Card */}
                  <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-xs flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-100" />
                        <span className="text-[10px] font-bold uppercase tracking-wide text-rose-700">
                          {resolvedSpouses.length > 0 ? getSpouseRoleInfo(resolvedSpouses[0].spouseRole).label : 'Vợ/Chồng'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 font-serif-display truncate">
                        {resolvedSpouses.length > 0 ? resolvedSpouses[0].fullName : (member.spouseName || 'Chưa cập nhật')}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {resolvedSpouses.length > 0 && resolvedSpouses[0].originAddress 
                          ? `Quê: ${resolvedSpouses[0].originAddress}` 
                          : 'Hôn phối dòng họ'}
                      </p>
                    </div>
                    {resolvedSpouses.length > 0 ? (
                      <button
                        onClick={() => setActiveTab('spouses')}
                        className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors shrink-0"
                      >
                        Chi tiết
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic shrink-0">Chưa có</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Generation After: Con cái & Cháu */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    3. Thế Hệ Phía Sau (Hậu Duệ: Con Cái & Cháu Chắt)
                  </span>
                  {(currentRole === 'admin' || currentRole === 'liaison') && onAddChild && (
                    <button
                      onClick={() => onAddChild(member)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors flex items-center gap-1"
                      title="Thêm con / hậu duệ cho thành viên này"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-amber-800" />
                      <span>+ Thêm con</span>
                    </button>
                  )}
                </div>
                
                {children.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-slate-600 block">
                      Con cái ({children.length} người):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {children.map(child => (
                        <button
                          key={child.id}
                          onClick={() => onSelectMember(child.id)}
                          className="p-2.5 rounded-lg border border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50 text-left transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{child.fullName}</span>
                            <span className="text-[11px] text-slate-700">Đời {child.generation} • {child.gender === 'male' ? 'Con trai' : 'Con gái'}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-700" />
                        </button>
                      ))}
                    </div>

                    {grandChildren.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-xs font-medium text-slate-600 block mb-1.5">
                          Các cháu nội/ngoại ({grandChildren.length} người):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {grandChildren.map(gc => (
                            <button
                              key={gc.id}
                              onClick={() => onSelectMember(gc.id)}
                              className="px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 transition-colors"
                            >
                              {gc.fullName} (Đời {gc.generation})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-600 text-center italic">
                    Chưa có ghi nhận thông tin con cái trong cơ sở dữ liệu phả đồ.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Role Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-700 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-700" />
            Quyền hiện tại: <strong className="text-slate-700 uppercase">{currentRole}</strong>
          </div>

          <div className="flex items-center gap-2">
            {(currentRole === 'admin' || currentRole === 'liaison') && (
              <button
                id="delete-member-modal-btn"
                onClick={() => onDeleteMember(member)}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                title={currentRole === 'admin' ? 'Xoá thành viên khỏi gia phả' : 'Đề xuất xoá thành viên này'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {currentRole === 'admin' ? 'Xoá Thành Viên' : 'Đề Xuất Xoá'}
              </button>
            )}

            {currentRole === 'liaison' && (
              <button
                id="liaison-propose-edit-btn"
                onClick={() => onProposeEdit(member)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Đề Xuất Sửa Đổi (Chờ Admin duyệt)
              </button>
            )}

            {currentRole === 'admin' && (
              <button
                id="admin-direct-edit-btn"
                onClick={() => onDirectEdit(member)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Chỉnh Sửa Trực Tiếp (Admin CRUD)
              </button>
            )}

            <button
              id="close-modal-bottom-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
