import React, { useState } from 'react';
import { FamilyMember, UserRole } from '../types';
import { Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface DeleteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember | null;
  currentRole: UserRole;
  allMembers: FamilyMember[];
  onConfirmDelete: (memberId: string, isDirectAdmin: boolean, reason?: string) => void;
}

export const DeleteMemberModal: React.FC<DeleteMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  currentRole,
  allMembers,
  onConfirmDelete
}) => {
  const [reason, setReason] = useState<string>('');

  if (!isOpen || !member) return null;

  // Find linked relatives to warn user
  const children = allMembers.filter(m => m.fatherId === member.id || m.motherId === member.id);
  const isAdmin = currentRole === 'admin';
  const isLiaison = currentRole === 'liaison';

  const handleConfirm = () => {
    if (!isAdmin && !reason.trim()) {
      alert('Vui lòng nhập lý do đề xuất xoá thành viên.');
      return;
    }

    onConfirmDelete(member.id, isAdmin, reason);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-lg p-5 sm:p-6 space-y-4 animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 font-serif-display">
                {isAdmin ? 'Xác Nhận Xoá Thành Viên Khỏi Gia Phả' : 'Đề Xuất Xoá Thành Viên'}
              </h3>
              <p className="text-xs text-rose-700 font-medium">
                {isAdmin ? 'Thao tác xoá dữ liệu vĩnh viễn (Admin)' : 'Đề xuất sẽ được gửi đến Admin phê duyệt'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Preview Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base font-serif-display shrink-0 ${
            member.gender === 'male' ? 'bg-blue-100 text-blue-900' : 'bg-rose-100 text-rose-900'
          }`}>
            {member.fullName.charAt(member.fullName.lastIndexOf(' ') + 1) || 'N'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 text-sm font-serif-display truncate">{member.fullName}</h4>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
              <span>Đời {member.generation} ({member.branch})</span>
              <span>•</span>
              <span>{member.birthYear} - {member.isAlive ? 'Nay' : (member.deathYear || '?')}</span>
            </div>
          </div>
        </div>

        {/* Warning about children if any */}
        {children.length > 0 ? (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Lưu ý về con cái ({children.length} người):</strong>{' '}
              Thành viên này đang có các con trên cây phả đồ: {children.map(c => c.fullName).join(', ')}.
              Hệ thống sẽ an toàn tự động gỡ liên kết phụ tử của các con để cây gia phả không bị gián đoạn.
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-xs text-slate-600">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>Thành viên này hiện chưa liên kết con cái nào trên hệ thống.</span>
          </div>
        )}

        {/* Liaison reason input */}
        {!isAdmin && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Lý do đề xuất xoá thành viên này: *
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Thông tin nhập trùng lặp, sai chi phái hoặc theo yêu cầu xác minh lại..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Hủy thao tác
          </button>

          {isAdmin ? (
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Xác Nhận Xoá Khỏi Gia Phả
            </button>
          ) : isLiaison ? (
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Gửi Đề Xuất Xoá Cho Admin
            </button>
          ) : (
            <div className="text-xs text-slate-500 italic">
              Chỉ Admin hoặc Liên lạc viên mới có quyền xoá.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
