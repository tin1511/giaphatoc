import React, { useState, useEffect } from 'react';
import { ClanSettings } from '../types';
import { 
  Palette, 
  LayoutTemplate, 
  PanelTop, 
  PanelBottom, 
  Building2, 
  Sparkles, 
  Check, 
  X, 
  RotateCcw, 
  Save, 
  Megaphone,
  Phone,
  Mail,
  MapPin,
  Eye
} from 'lucide-react';

interface EditSiteContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clanSettings: ClanSettings;
  onSave: (updatedSettings: ClanSettings) => void;
  initialTab?: 'header' | 'footer' | 'general';
}

export const EditSiteContentModal: React.FC<EditSiteContentModalProps> = ({
  isOpen,
  onClose,
  clanSettings,
  onSave,
  initialTab = 'header'
}) => {
  const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'general'>(initialTab);
  const [formData, setFormData] = useState<ClanSettings>(clanSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData(clanSettings);
  }, [clanSettings, isOpen]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleChange = <K extends keyof ClanSettings>(field: K, value: ClanSettings[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetToDefault = () => {
    if (confirm('Bạn có chắc chắn muốn hoàn tác tất cả các thay đổi về giá trị hiện tại?')) {
      setFormData(clanSettings);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div 
      id="edit-site-content-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
    >
      <div 
        id="edit-site-content-modal"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-700/80 border border-amber-500/50 flex items-center justify-center text-amber-200">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-serif-display text-amber-50">
                Chỉnh Sửa Giao Diện & Nội Dung Trang
              </h3>
              <p className="text-xs text-amber-200/80">
                Quyền Quản Trị Viên: Tùy chỉnh thông tin Header, Footer và Biểu ngữ hiển thị
              </p>
            </div>
          </div>
          <button
            id="btn-close-edit-site-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-2 overflow-x-auto shrink-0">
          <button
            id="tab-edit-header"
            type="button"
            onClick={() => setActiveTab('header')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl border-t border-x transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'header'
                ? 'bg-white text-amber-900 border-slate-200 -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <PanelTop className="w-4 h-4 text-amber-700" />
            Nội Dung Header (Đầu trang)
          </button>

          <button
            id="tab-edit-footer"
            type="button"
            onClick={() => setActiveTab('footer')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl border-t border-x transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'footer'
                ? 'bg-white text-amber-900 border-slate-200 -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <PanelBottom className="w-4 h-4 text-amber-700" />
            Nội Dung Footer (Chân trang)
          </button>

          <button
            id="tab-edit-general"
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl border-t border-x transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-white text-amber-900 border-slate-200 -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-700" />
            Thông Tin Từ Đường & Dòng Họ
          </button>
        </div>

        {/* Tab Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ===================== TAB HEADER ===================== */}
          {activeTab === 'header' && (
            <div className="space-y-5">
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold">Mẹo:</span> Thay đổi ở đây sẽ cập nhật trực tiếp thanh biểu ngữ đầu trang (Header), logo chữ Hán/ký hiệu dòng họ, và thanh thông báo quan trọng.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ký tự Logo biểu trưng (1-3 chữ)
                  </label>
                  <input
                    id="input-header-logo-char"
                    type="text"
                    maxLength={4}
                    value={formData.headerLogoText || ''}
                    onChange={e => handleChange('headerLogoText', e.target.value)}
                    placeholder="Ví dụ: 阮 hoặc HỌ"
                    className="w-full px-3 py-2 text-center text-base font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-serif-display"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Chữ Hán họ tộc hoặc chữ cái viết tắt</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tiêu Đề Chính Trên Header *
                  </label>
                  <input
                    id="input-header-title"
                    type="text"
                    required
                    value={formData.headerTitle || ''}
                    onChange={e => handleChange('headerTitle', e.target.value)}
                    placeholder="Ví dụ: Gia Phả Họ Tộc Online"
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Tiêu đề lớn hiển thị ở góc trái đầu trang</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nhãn Chi Phái / Phân Nhánh (Huy hiệu)
                  </label>
                  <input
                    id="input-header-badge"
                    type="text"
                    value={formData.headerBadgeText || ''}
                    onChange={e => handleChange('headerBadgeText', e.target.value)}
                    placeholder="Ví dụ: Họ Nguyễn Văn • Chi Đệ Tam"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Năm Khởi Lập / Niên Đại Hiển Thị
                  </label>
                  <input
                    id="input-header-est"
                    type="text"
                    value={formData.headerEstText || ''}
                    onChange={e => handleChange('headerEstText', e.target.value)}
                    placeholder="Ví dụ: Khởi lập 1895"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slogan / Tiêu Đề Phụ Dòng Tộc
                </label>
                <input
                  id="input-header-subtitle"
                  type="text"
                  value={formData.headerSubtitle || ''}
                  onChange={e => handleChange('headerSubtitle', e.target.value)}
                  placeholder="Ví dụ: Cội nguồn tiên tổ - Vạn đời hưng thịnh"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Announcement Banner in Header */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-slate-800">
                      Thanh Thông Báo / Biểu Ngữ Đầu Trang
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="toggle-header-announcement"
                      type="checkbox"
                      checked={formData.showHeaderAnnouncement ?? true}
                      onChange={e => handleChange('showHeaderAnnouncement', e.target.checked)}
                      className="rounded border-slate-300 text-amber-800 focus:ring-amber-500 w-4 h-4"
                    />
                    <span className="text-xs text-slate-700 font-medium">Bật thông báo</span>
                  </label>
                </div>

                {formData.showHeaderAnnouncement && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nội dung thông báo dòng họ (Giỗ tổ, họp họ, thông báo khẩn...)
                    </label>
                    <textarea
                      id="input-header-announcement"
                      rows={2}
                      value={formData.headerAnnouncement || ''}
                      onChange={e => handleChange('headerAnnouncement', e.target.value)}
                      placeholder="Nhập thông báo gửi tới con cháu trong toàn tộc..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Live Preview Header */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> Xem Trước Header (Live Preview):
                </label>
                <div className="border border-slate-200 rounded-xl p-3 bg-white shadow-xs">
                  {formData.showHeaderAnnouncement && formData.headerAnnouncement && (
                    <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-amber-100 text-[11px] px-3 py-1.5 rounded-lg mb-2 flex items-center gap-2">
                      <Megaphone className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                      <span className="truncate">{formData.headerAnnouncement}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-amber-100 shadow-xs font-serif-display font-bold text-base shrink-0">
                      {formData.headerLogoText || '阮'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full truncate">
                          {formData.headerBadgeText || `${formData.clanName} • ${formData.branchName}`}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {formData.headerEstText || `Khởi lập ${formData.establishedYear}`}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 font-serif-display truncate">
                        {formData.headerTitle || 'Gia Phả Họ Tộc Online'}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB FOOTER ===================== */}
          {activeTab === 'footer' && (
            <div className="space-y-5">
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <span className="font-bold">Mẹo:</span> Tùy chỉnh các thông tin xuất hiện ở chân trang (Footer), bao gồm tên chi phái, dòng bản quyền, địa chỉ từ đường và các kênh liên hệ trực tiếp.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tiêu Đề Lớn Chân Trang (Footer Title)
                  </label>
                  <input
                    id="input-footer-title"
                    type="text"
                    value={formData.footerTitle || ''}
                    onChange={e => handleChange('footerTitle', e.target.value)}
                    placeholder="Ví dụ: Gia Phả Họ Tộc Online"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên Dòng Họ & Chi Phái Ở Footer
                  </label>
                  <input
                    id="input-footer-subtitle"
                    type="text"
                    value={formData.footerSubtitle || ''}
                    onChange={e => handleChange('footerSubtitle', e.target.value)}
                    placeholder="Ví dụ: Hệ Thống Dòng Họ Nguyễn Văn Chi Phái Đệ Tam"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô Tả / Giới Thiệu Ngắn Chân Trang
                </label>
                <textarea
                  id="input-footer-desc"
                  rows={2}
                  value={formData.footerDescription || ''}
                  onChange={e => handleChange('footerDescription', e.target.value)}
                  placeholder="Mô tả ý nghĩa nền tảng gia phả điện tử..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dòng Bản Quyền (Copyright)
                  </label>
                  <input
                    id="input-footer-copyright"
                    type="text"
                    value={formData.footerCopyright || ''}
                    onChange={e => handleChange('footerCopyright', e.target.value)}
                    placeholder="Ví dụ: © 2026 Ban Trị Sự Dòng Họ Nguyễn Văn. Bảo lưu mọi quyền."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khẩu Hiệu / Ghi Chú Đạo Lý
                  </label>
                  <input
                    id="input-footer-links-note"
                    type="text"
                    value={formData.footerLinksNote || ''}
                    onChange={e => handleChange('footerLinksNote', e.target.value)}
                    placeholder="Ví dụ: Bảo tồn văn hóa truyền thống • Kết nối muôn đời con cháu"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Contact Information in Footer */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  Thông Tin Liên Lạc & Từ Đường Hiển Thị Ở Chân Trang
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Địa chỉ Nhà thờ Từ đường
                  </label>
                  <input
                    id="input-footer-hall-address"
                    type="text"
                    value={formData.ancestralHallAddress || ''}
                    onChange={e => handleChange('ancestralHallAddress', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" /> Số điện thoại / Hotline
                    </label>
                    <input
                      id="input-footer-contact-phone"
                      type="text"
                      value={formData.contactPhone || ''}
                      onChange={e => handleChange('contactPhone', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" /> Email Ban Trị Sự
                    </label>
                    <input
                      id="input-footer-contact-email"
                      type="email"
                      value={formData.contactEmail || ''}
                      onChange={e => handleChange('contactEmail', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Footer */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> Xem Trước Footer (Live Preview):
                </label>
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-900 text-slate-300 text-xs shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="font-bold text-amber-200 font-serif-display text-sm">
                        {formData.footerTitle || 'Gia Phả Họ Tộc Online'}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {formData.footerSubtitle || `${formData.clanName} • ${formData.branchName}`}
                      </div>
                    </div>
                    <div className="text-[11px] text-amber-400/90 font-medium">
                      {formData.footerLinksNote || 'Bảo tồn văn hóa truyền thống'}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    {formData.footerDescription}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                    <div>📍 Từ đường: {formData.ancestralHallAddress}</div>
                    <div>📞 Hotline: {formData.contactPhone} • ✉️ {formData.contactEmail}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
                    <span>{formData.footerCopyright || '© 2026 Ban Trị Sự Dòng Họ'}</span>
                    <span>Hệ thống Gia Phả Trực Tuyến</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB GENERAL ===================== */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
                <span className="font-bold">Thông tin căn bản dòng họ:</span> Dữ liệu này được liên kết đồng bộ xuyên suốt từ cây gia phả, trang đóng góp công đức cho tới các hồ sơ thành viên.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên Dòng Họ *
                  </label>
                  <input
                    id="input-general-clan-name"
                    type="text"
                    required
                    value={formData.clanName}
                    onChange={e => handleChange('clanName', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chi Phái / Phân Nhánh *
                  </label>
                  <input
                    id="input-general-branch-name"
                    type="text"
                    required
                    value={formData.branchName}
                    onChange={e => handleChange('branchName', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Năm Khởi Lập *
                  </label>
                  <input
                    id="input-general-established-year"
                    type="number"
                    required
                    value={formData.establishedYear}
                    onChange={e => handleChange('establishedYear', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trưởng Tộc Đương Nhiệm *
                  </label>
                  <input
                    id="input-general-head-of-clan"
                    type="text"
                    required
                    value={formData.headOfClan}
                    onChange={e => handleChange('headOfClan', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày Đại Lễ Giỗ Tổ (Âm Lịch) *
                </label>
                <input
                  id="input-general-worship-date"
                  type="text"
                  required
                  value={formData.worshipDateLunar}
                  onChange={e => handleChange('worshipDateLunar', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa Chỉ Nhà Thờ Từ Đường *
                </label>
                <input
                  id="input-general-hall-address"
                  type="text"
                  required
                  value={formData.ancestralHallAddress}
                  onChange={e => handleChange('ancestralHallAddress', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <button
              id="btn-reset-site-content"
              type="button"
              onClick={handleResetToDefault}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Khôi Phục Ban Đầu
            </button>

            <div className="flex items-center gap-2">
              <button
                id="btn-cancel-site-content"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                id="btn-save-site-content"
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-amber-950 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Đã Lưu Thành Công!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-amber-200" />
                    Lưu Nội Dung Trang
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
