import React, { useState } from 'react';
import { Contribution, ContributionPurpose, UserRole, ClanSettings } from '../types';
import { 
  QrCode, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Coins, 
  TrendingUp, 
  FileText, 
  Search, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  Sparkles,
  CreditCard,
  X
} from 'lucide-react';
import { generateVietQRUrl } from '../utils/vietqr';

interface ContributionViewProps {
  contributions: Contribution[];
  currentRole: UserRole;
  clanSettings?: ClanSettings;
  onUpdateClanSettings?: (settings: ClanSettings) => void;
  onSubmitContribution: (data: Omit<Contribution, 'id' | 'createdAt' | 'status'>) => void;
  onConfirmContribution: (id: string) => void;
}

export const ContributionView: React.FC<ContributionViewProps> = ({
  contributions,
  currentRole,
  clanSettings,
  onUpdateClanSettings,
  onSubmitContribution,
  onConfirmContribution
}) => {
  // Form State
  const [donorName, setDonorName] = useState('');
  const [generationOrBranch, setGenerationOrBranch] = useState('');
  const [amount, setAmount] = useState<number>(1000000);
  const [purpose, setPurpose] = useState<ContributionPurpose>('duty');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [copiedSTK, setCopiedSTK] = useState(false);
  const [selectedReceiptPreview, setSelectedReceiptPreview] = useState<string | null>(null);
  const [isEditBankModalOpen, setIsEditBankModalOpen] = useState(false);
  const [editBankName, setEditBankName] = useState('');
  const [editAccountNo, setEditAccountNo] = useState('');
  const [editAccountHolder, setEditAccountHolder] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editQrType, setEditQrType] = useState<'auto' | 'custom'>('auto');
  const [editCustomQrUrl, setEditCustomQrUrl] = useState('');

  const openEditBankModal = () => {
    setEditBankName(clanSettings?.bankAccount?.bankName || 'MBBank');
    setEditAccountNo(clanSettings?.bankAccount?.accountNumber || '1903688889999');
    setEditAccountHolder(clanSettings?.bankAccount?.accountHolder || 'QUY DONG HO NGUYEN VAN');
    setEditBranch(clanSettings?.bankAccount?.branchName || '');
    setEditQrType(clanSettings?.bankAccount?.qrType || 'auto');
    setEditCustomQrUrl(clanSettings?.bankAccount?.customQrUrl || '');
    setIsEditBankModalOpen(true);
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (clanSettings && onUpdateClanSettings) {
      onUpdateClanSettings({
        ...clanSettings,
        bankAccount: {
          bankName: editBankName,
          accountNumber: editAccountNo,
          accountHolder: editAccountHolder,
          branchName: editBranch,
          qrType: editQrType,
          customQrUrl: editCustomQrUrl,
          qrCodeUrl: editQrType === 'custom' && editCustomQrUrl
            ? editCustomQrUrl
            : generateVietQRUrl({
                bankNameOrBin: editBankName,
                accountNumber: editAccountNo,
                accountHolder: editAccountHolder,
              })
        }
      });
    }
    setIsEditBankModalOpen(false);
  };

  // Filter state for public ledger
  const [ledgerFilterPurpose, setLedgerFilterPurpose] = useState<string>('all');
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState<string>('');

  const bankAccount = {
    bankName: clanSettings?.bankAccount?.bankName || 'MBBank (Ngân Hàng Quân Đội)',
    accountNo: clanSettings?.bankAccount?.accountNumber || '1903688889999',
    accountHolder: clanSettings?.bankAccount?.accountHolder || 'QUY DONG HO NGUYEN VAN'
  };

  const purposeLabels: Record<ContributionPurpose, { label: string; desc: string; color: string }> = {
    duty: { label: 'Nghĩa Vụ Thường Niên', desc: 'Đóng góp niên liễm hàng năm duy trì hoạt động tộc', color: 'bg-blue-100 text-blue-800' },
    worship: { label: 'Cúng Dường Lễ Giỗ', desc: 'Hương hỏa, hoa quả, đồ lễ tế Tiên Tổ dịp Đại lễ Giỗ Tổ', color: 'bg-amber-100 text-amber-800' },
    study_fund: { label: 'Khuyến Tài Khuyến Học', desc: 'Khen thưởng học sinh giỏi, hỗ trợ con em nghèo vượt khó', color: 'bg-emerald-100 text-emerald-800' },
    construction: { label: 'Xây Dựng Họ Tộc', desc: 'Đại tu, trùng tu, bảo dưỡng Từ đường và khu lăng mộ', color: 'bg-purple-100 text-purple-800' },
    other: { label: 'Mục Đích Khác', desc: 'Công đức tâm nguyện, hỗ trợ hiếu hỷ khó khăn', color: 'bg-slate-100 text-slate-800' }
  };

  // Generate dynamic QR code URL using VietQR API standard format or custom QR Code
  const sanitizedDonor = (donorName || 'CON CHAU').replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
  const transferContent = `DONG GOP ${sanitizedDonor.slice(0, 15)} ${amount}`;
  const isCustomQr = clanSettings?.bankAccount?.qrType === 'custom';
  const customQrUrl = clanSettings?.bankAccount?.customQrUrl;

  const qrUrl = isCustomQr && customQrUrl
    ? customQrUrl
    : generateVietQRUrl({
        bankNameOrBin: bankAccount.bankName,
        accountNumber: bankAccount.accountNo,
        accountHolder: bankAccount.accountHolder,
        amount: amount > 0 ? amount : undefined,
        transferContent: transferContent
      });

  const handleCopySTK = () => {
    navigator.clipboard.writeText(bankAccount.accountNo);
    setCopiedSTK(true);
    setTimeout(() => setCopiedSTK(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleReceipt = () => {
    setReceiptImage('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || amount <= 0) {
      alert('Vui lòng nhập họ tên và số tiền hợp lệ.');
      return;
    }

    const transactionRef = `MBB_${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}_${Math.floor(10000 + Math.random() * 90000)}`;

    onSubmitContribution({
      donorName,
      generationOrBranch: generationOrBranch || 'Con cháu họ tộc',
      amount,
      purpose,
      notes,
      receiptImageUrl: receiptImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      transactionRef,
      bankAccountReceiver: `${bankAccount.bankName} - ${bankAccount.accountNo}`
    });

    // Reset Form
    setDonorName('');
    setGenerationOrBranch('');
    setAmount(1000000);
    setNotes('');
    setReceiptImage('');
    alert('Đã gửi thông tin đóng góp thành công! Trạng thái: Chờ Thủ quỹ xác nhận.');
  };

  // Financial Stats
  const totalConfirmed = contributions
    .filter(c => c.status === 'confirmed')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalPending = contributions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  const filteredContributions = contributions.filter(c => {
    if (ledgerFilterPurpose !== 'all' && c.purpose !== ledgerFilterPurpose) return false;
    if (ledgerSearchTerm.trim()) {
      const q = ledgerSearchTerm.toLowerCase().trim();
      return c.donorName.toLowerCase().includes(q) || c.generationOrBranch.toLowerCase().includes(q) || c.transactionRef.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-800 to-amber-950 text-white rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-200 text-xs font-semibold uppercase tracking-wider">
            <span>Tổng Quỹ Họ Đã Xác Nhận</span>
            <Coins className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif-display pt-1">
            {totalConfirmed.toLocaleString('vi-VN')} <span className="text-base font-sans font-normal text-amber-200">VNĐ</span>
          </div>
          <p className="text-[11px] text-amber-200/80">
            Minh bạch tài chính 100% công khai cho toàn thể con cháu
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Đang Chờ Thủ Quỹ Xác Nhận</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display pt-1">
            {totalPending.toLocaleString('vi-VN')} <span className="text-base font-sans font-normal text-slate-500">VNĐ</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {contributions.filter(c => c.status === 'pending').length} giao dịch vừa gửi qua quét mã QR
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Số Lượt Đóng Góp</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display pt-1">
            {contributions.length} <span className="text-base font-sans font-normal text-slate-500">lượt</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Từ các chi phái Bắc - Trung - Nam & kiều bào hải ngoại
          </p>
        </div>
      </div>

      {/* Main Form & Interactive VietQR Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Phân Hệ Đóng Góp & Cúng Dường
            </span>
            <h3 className="text-xl font-bold text-slate-900 font-serif-display mt-2">
              Phiếu Ghi Nhận Công Đức Quỹ Họ Tộc
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Điền thông tin đóng góp, quét mã QR động để chuyển khoản và đính kèm ảnh biên lai để hệ thống ghi nhận vào sổ vàng dòng họ.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Donor Name & Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Họ và tên người đóng góp: *
                </label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Tuấn, Gia đình cháu Hải..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Thế hệ / Chi nhánh:
                </label>
                <input
                  type="text"
                  value={generationOrBranch}
                  onChange={(e) => setGenerationOrBranch(e.target.value)}
                  placeholder="Ví dụ: Chi 1 - Đời 4, Chi 2 Hải Dương..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Amount & Quick Buttons */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Số tiền đóng góp (VNĐ): *
              </label>
              <input
                type="number"
                required
                min={50000}
                step={50000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {[500000, 1000000, 2000000, 5000000, 10000000, 20000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors border ${
                      amount === val
                        ? 'bg-amber-800 text-white border-amber-800'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {val >= 1000000 ? `${val / 1000000} Triệu` : `${val / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Purpose (Dropdown/Radio as requested) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mục đích đóng góp: *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(purposeLabels) as ContributionPurpose[]).map((pKey) => (
                  <label
                    key={pKey}
                    className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      purpose === pKey
                        ? 'bg-amber-50/70 border-amber-500 text-amber-900 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="purpose"
                      checked={purpose === pKey}
                      onChange={() => setPurpose(pKey)}
                      className="mt-0.5 text-amber-700 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-xs font-bold block">{purposeLabels[pKey].label}</span>
                      <span className="text-[11px] text-slate-500 block leading-tight">{purposeLabels[pKey].desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Ghi chú khác / Lời nhắn gửi:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Ủng hộ các cháu đỗ đại học, dâng hương ngày giỗ..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Receipt Upload / Screenshot bill */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Hình ảnh minh chứng chuyển khoản (Bill/Receipt): *
              </label>
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-center space-y-2">
                {receiptImage ? (
                  <div className="space-y-2">
                    <img
                      src={receiptImage}
                      alt="Receipt preview"
                      className="w-36 h-36 object-cover mx-auto rounded-xl border border-slate-200 shadow-xs"
                    />
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã chọn ảnh minh chứng
                      </span>
                      <button
                        type="button"
                        onClick={() => setReceiptImage('')}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Chọn ảnh khác
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600">
                      Tải lên ảnh chụp màn hình chuyển khoản ngân hàng thành công
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <label className="px-3.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl cursor-pointer transition-colors border border-amber-300">
                        Chọn tệp ảnh từ máy
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleUseSampleReceipt}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors border border-slate-300"
                      >
                        Sử dụng ảnh mẫu demo
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              id="submit-contribution-btn"
              type="submit"
              className="w-full py-3 text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Gửi Xác Nhận Đóng Góp Quỹ (Chờ Xác Nhận)
            </button>
          </form>
        </div>

        {/* Right Column: Dynamic VietQR Display (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  VietQR Chuẩn NAPAS 247
                </span>
                {currentRole === 'admin' && (
                  <button
                    type="button"
                    onClick={openEditBankModal}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-0.5 rounded-full shadow-xs transition-colors cursor-pointer"
                    title="Cập nhật thông tin tài khoản quỹ họ"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-300" />
                    <span>Cập nhật tài khoản quỹ</span>
                  </button>
                )}
              </div>
              <h4 className="font-bold text-base text-slate-900 font-serif-display">
                Mã QR Chuyển Khoản Tự Động
              </h4>
              <p className="text-xs text-slate-500">
                Mở ứng dụng Mobile Banking của mọi ngân hàng quét mã bên dưới
              </p>
            </div>

            {/* QR Card Frame */}
            <div className="p-4 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center">
              <div className="w-56 h-56 bg-white p-2 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center relative overflow-hidden">
                <img
                  src={qrUrl}
                  alt="VietQR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center mt-3 space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">
                  {amount.toLocaleString('vi-VN')} VNĐ
                </span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  Nội dung: {transferContent}
                </span>
              </div>
            </div>

            {/* Bank details with copy button */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ngân hàng:</span>
                <span className="font-bold text-slate-800">{bankAccount.bankName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Số tài khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-amber-900 text-sm">{bankAccount.accountNo}</span>
                  <button
                    onClick={handleCopySTK}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                    title="Sao chép số tài khoản"
                  >
                    {copiedSTK ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <span className="font-semibold text-slate-800">{bankAccount.accountHolder}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Sau khi chuyển tiền thành công, xin vui lòng chụp lại biên lai và đính kèm vào biểu mẫu để Thủ quỹ dòng họ đối soát và đưa vào Bảng vàng công đức.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Public Ledger (Sổ Vàng Công Đức Công Khai) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif-display">
              Bảng Vàng Công Đức & Sao Kê Thu Quỹ Họ Tộc
            </h3>
            <p className="text-xs text-slate-500">
              Công khai, minh bạch các khoản đóng góp của con cháu và phân loại mục đích sử dụng
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ledgerSearchTerm}
                onChange={(e) => setLedgerSearchTerm(e.target.value)}
                placeholder="Tìm tên người đóng góp..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <select
              value={ledgerFilterPurpose}
              onChange={(e) => setLedgerFilterPurpose(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
            >
              <option value="all">Tất cả mục đích</option>
              <option value="duty">Nghĩa vụ</option>
              <option value="worship">Cúng dường</option>
              <option value="study_fund">Khuyến tài khuyến học</option>
              <option value="construction">Xây dựng họ tộc</option>
              <option value="other">Mục đích khác</option>
            </select>
          </div>
        </div>

        {/* Contributions Mobile Cards & Desktop Table */}
        {/* Mobile View: Cards (< 640px) */}
        <div className="sm:hidden space-y-3">
          {filteredContributions.map((c) => (
            <div 
              key={c.id} 
              className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{c.donorName}</h4>
                  <span className="text-xs text-slate-500">{c.generationOrBranch}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-amber-900 text-sm block">
                    {c.amount.toLocaleString('vi-VN')} đ
                  </span>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${purposeLabels[c.purpose].color}`}>
                    {purposeLabels[c.purpose].label}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <span>{c.transactionRef}</span>
                  {c.receiptImageUrl && (
                    <button
                      onClick={() => setSelectedReceiptPreview(c.receiptImageUrl || null)}
                      className="text-amber-800 hover:text-amber-950 p-1 hover:bg-amber-100/50 rounded flex items-center gap-0.5"
                      title="Xem biên lai"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-sans">Ảnh bill</span>
                    </button>
                  )}
                </div>

                <div>
                  {c.status === 'confirmed' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Đã xác nhận
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-2.5 h-2.5" /> Chờ xác nhận
                    </span>
                  )}
                </div>
              </div>

              {currentRole === 'admin' && c.status === 'pending' && (
                <div className="pt-2 border-t border-slate-200/80 flex justify-end">
                  <button
                    onClick={() => onConfirmContribution(c.id)}
                    className="w-full py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Duyệt Vào Quỹ (Admin)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View: Table (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <th className="py-3 px-3">Người Đóng Góp</th>
                <th className="py-3 px-3">Thế Hệ / Chi Nhánh</th>
                <th className="py-3 px-3">Mục Đích</th>
                <th className="py-3 px-3 text-right">Số Tiền (VNĐ)</th>
                <th className="py-3 px-3">Biên Lai / Mã GD</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                {currentRole === 'admin' && <th className="py-3 px-3 text-right">Thao Tác Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContributions.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {c.donorName}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {c.generationOrBranch}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${purposeLabels[c.purpose].color}`}>
                      {purposeLabels[c.purpose].label}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {c.amount.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <span>{c.transactionRef}</span>
                      {c.receiptImageUrl && (
                        <button
                          onClick={() => setSelectedReceiptPreview(c.receiptImageUrl || null)}
                          className="text-amber-800 hover:text-amber-950 p-1 hover:bg-amber-50 rounded"
                          title="Xem biên lai"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {c.status === 'confirmed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Đã xác nhận quỹ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3" /> Chờ xác nhận
                      </span>
                    )}
                  </td>
                  {currentRole === 'admin' && (
                    <td className="py-3 px-3 text-right">
                      {c.status === 'pending' && (
                        <button
                          onClick={() => onConfirmContribution(c.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
                        >
                          Duyệt Vào Quỹ
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Receipt Bill Image */}
      {selectedReceiptPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-800">Minh Chứng Biên Lai Chuyển Khoản</h4>
              <button onClick={() => setSelectedReceiptPreview(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <img
              src={selectedReceiptPreview}
              alt="Receipt"
              className="w-full h-80 object-contain rounded-xl border border-slate-200 bg-slate-50"
            />
            <div className="text-right">
              <button
                onClick={() => setSelectedReceiptPreview(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Manual Bank/QR Edit Modal */}
      {isEditBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white px-5 sm:px-6 py-4 flex items-center justify-between gap-3 border-b border-amber-800/40">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base sm:text-lg font-serif-display leading-tight">
                  Tài Khoản Quỹ Dòng Họ
                </h3>
              </div>
              <button
                onClick={() => setIsEditBankModalOpen(false)}
                className="text-amber-300/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBank} className="p-5 sm:p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Thông tin này sẽ được hệ thống dùng để hiển thị thông tin tài khoản chuyển khoản và mã QR đóng góp tương ứng cho bà con dòng họ.
              </p>

              <div className="space-y-4">
                {/* QR Config Selector */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Loại Mã QR Sử Dụng
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setEditQrType('auto')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        editQrType === 'auto'
                          ? 'bg-white text-amber-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Sinh tự động (VietQR)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditQrType('custom')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        editQrType === 'custom'
                          ? 'bg-white text-amber-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Mã QR Tự Tải Lên
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {editQrType === 'auto'
                      ? 'Hệ thống tự động tạo mã QR động theo chuẩn NAPAS, có kèm số tiền và nội dung chuyển khoản mỗi khi thành viên đóng góp.'
                      : 'Sử dụng một ảnh mã QR cố định (Mã MoMo, QR tài khoản in sẵn của ngân hàng, QR tĩnh...) do bạn tự tải lên.'}
                  </p>
                </div>

                {/* Custom QR Upload Area */}
                {editQrType === 'custom' && (
                  <div className="space-y-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200">
                    <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider">
                      Ảnh Mã QR Tùy Chỉnh
                    </label>

                    <div className="border-2 border-dashed border-slate-300 hover:border-amber-600 rounded-xl p-3 text-center cursor-pointer relative bg-white transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setEditCustomQrUrl(event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="space-y-1">
                        <UploadCloud className="w-5 h-5 mx-auto text-slate-400" />
                        <p className="text-[11px] font-semibold text-slate-700">
                          Nhấp để tải lên ảnh QR dòng họ
                        </p>
                        <p className="text-[9px] text-slate-400">
                          Hỗ trợ ảnh QR ngân hàng, MoMo, ZaloPay (PNG, JPG)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Hoặc dán URL ảnh:</span>
                      <input
                        type="text"
                        value={editCustomQrUrl}
                        onChange={(e) => setEditCustomQrUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 text-[10px] px-2 py-1 rounded-lg border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all"
                      />
                    </div>

                    {editCustomQrUrl && (
                      <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-amber-200">
                        <div className="w-14 h-14 bg-slate-50 p-1 rounded-md border border-slate-200 shrink-0 flex items-center justify-center">
                          <img
                            src={editCustomQrUrl}
                            alt="Custom QR Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-amber-900">Xem trước mã QR của bạn</p>
                          <p className="text-[9px] text-slate-400 truncate max-w-[200px]">{editCustomQrUrl}</p>
                          <button
                            type="button"
                            onClick={() => setEditCustomQrUrl('')}
                            className="text-[10px] text-rose-600 font-bold hover:underline"
                          >
                            Xóa mã này
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bank Fields (Always keep for copy details) */}
                <div className="space-y-3.5 pt-2">
                  <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Thông Tin Chuyển Khoản Bằng Chữ
                  </span>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ngân hàng thụ hưởng <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      placeholder="VD: MBBank, Vietcombank, Techcombank..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số tài khoản <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editAccountNo}
                      onChange={(e) => setEditAccountNo(e.target.value)}
                      placeholder="Nhập số tài khoản ngân hàng"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all placeholder:text-slate-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên chủ tài khoản <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editAccountHolder}
                      onChange={(e) => setEditAccountHolder(e.target.value)}
                      placeholder="VD: NGUYEN VAN A"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all placeholder:text-slate-400 font-semibold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chi nhánh ngân hàng (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={editBranch}
                      onChange={(e) => setEditBranch(e.target.value)}
                      placeholder="VD: Hà Nội"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setIsEditBankModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-200" />
                  <span>Lưu Cấu Hình</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
