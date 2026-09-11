import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  UserCheck, 
  Building2, 
  Image as ImageIcon
} from 'lucide-react';
import { AIScannedMemberResult } from '../types';
import { scanMemberWithAI } from '../services/aiScanner';
import { generateVietQRUrl } from '../utils/vietqr';

interface AIScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'member';
  onApplyMember?: (scannedData: AIScannedMemberResult) => void;
}

export const AIScannerModal: React.FC<AIScannerModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'member',
  onApplyMember,
}) => {
  const [activeTab] = useState<'member'>('member');
  const [inputMethod, setInputMethod] = useState<'image' | 'text'>('image');
  const [rawText, setRawText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [imageFileName, setImageFileName] = useState<string>('');
  
  const [isScanning, setIsScanning] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [memberResult, setMemberResult] = useState<AIScannedMemberResult | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorNotice('Vui lòng chọn file hình ảnh (JPG, PNG, WebP).');
      return;
    }

    setErrorNotice(null);
    setImageFileName(file.name);
    setSelectedMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setErrorNotice(null);
      setImageFileName(file.name);
      setSelectedMimeType(file.type);

      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImageFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Sample data presets for instant 1-click testing
  const applyPreset = (type: 'to_khai' | 'giapha') => {
    setErrorNotice(null);
    if (type === 'to_khai') {
      setInputMethod('text');
      setRawText(
        `TỜ KHAI THÔNG TIN THÀNH VIÊN GIA ĐÌNH - DÒNG HỌ NGUYỄN VĂN
Họ và tên thành viên: Nguyễn Văn Hải Nam
Ngày sinh: 15/08/1992 (ngày Âm lịch là 17 tháng 7 năm Nhâm Thân)
Giới tính: Nam
Nơi sinh / Quê quán: Nam Trực, Nam Định
Nơi cư trú hiện nay: Số 45 Phố Huế, Q. Hoàn Kiếm, Hà Nội
Học vấn / Nghề nghiệp: Thạc sĩ Quản trị, Kỹ sư Công nghệ Thông tin
Tiêu sử tóm tắt: Đóng góp tích cực hoạt động dòng họ, ủng hộ 20 triệu đồng xây dựng Lăng mộ tổ chi đệ nhị năm 2024. Đạt giải thưởng Sáng tạo trẻ cấp quốc gia năm 2021.
Thông tin thân nhân:
- Thân phụ (Cha): Cụ Nguyễn Văn Tuấn (Chi Đệ Nhị, đời thứ 5)
- Thê tử (Vợ): Trần Thị Mai Anh (sinh năm 1994, kết hôn năm 2018)
- Con trai trưởng: Nguyễn Văn Tuấn Tú (sinh năm 2020)
Số điện thoại liên lạc: 0988776655
Email: hainam.nguyen@gmail.com`
      );
    } else if (type === 'giapha') {
      setInputMethod('text');
      setRawText(
        `SÁCH GIA PHẢ CHI ĐỆ TAM - ĐỜI THỨ TƯ
Trích lục Lý lịch Thành viên:
Nguyễn Văn Bính (tên tự là Phúc An).
Sinh năm Nhâm Tuất (1922) tại làng Hành Thiện, Nam Định.
Mất ngày 18 tháng 7 năm Ất Dậu (2005), thọ 84 tuổi. An táng tại Nghĩa trang Đồng Mơ.
Thuộc Đời thứ 4, Trưởng chi Đệ Tam dòng họ Nguyễn Văn.
Thân phụ: Cụ Nguyễn Văn Khải (Đời 3, thuộc Chi Đệ Tam).
Phu nhân chính thất: Cụ bà Vũ Thị Lành (1925 - 2012, quê quán ở phủ Xuân Trường).
Hậu duệ gồm có:
- Con trai cả: Nguyễn Văn Bình (sinh 1950)
- Con trai thứ: Nguyễn Văn Sơn (sinh 1953)
- Con gái út: Nguyễn Thị Mai (sinh 1957)
Sinh thời cụ làm thầy đồ dạy chữ Nho, sau này giữ chức Chánh hương hội, có công đức lớn trong việc vận động trùng tu Nhà thờ Chi họ năm 1993.`
      );
    }
  };

  const handleStartScan = async () => {
    setErrorNotice(null);
    setIsScanning(true);
    setMemberResult(null);

    try {
      const res = await scanMemberWithAI({
        text: inputMethod === 'text' ? rawText : undefined,
        imageBase64: inputMethod === 'image' && selectedImage ? selectedImage : undefined,
        mimeType: selectedMimeType,
      });

      if (res.success && res.data) {
        setMemberResult(res.data);
      } else {
        setErrorNotice(res.error || 'Không trích xuất được thông tin từ nguồn đã cung cấp.');
      }
    } catch (err: any) {
      setErrorNotice(err?.message || 'Có lỗi xảy ra trong quá trình xử lý AI.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyMemberData = () => {
    if (!memberResult) return;
    if (onApplyMember) {
      onApplyMember(memberResult);
    }
    onClose();
  };

  const copyResultJSON = () => {
    if (memberResult) {
      navigator.clipboard.writeText(JSON.stringify(memberResult, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white px-5 sm:px-6 py-4 flex items-center justify-between gap-3 border-b border-amber-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-inner text-amber-100">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg font-serif-display leading-tight">
                  Trợ Lý AI Quét Thông Tin Thành Viên
                </h3>
                <span className="text-[10px] font-semibold bg-amber-800/80 text-amber-200 px-2 py-0.5 rounded-full border border-amber-700/60">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-amber-200/80">
                Tự động phân tích ảnh chụp/quét trang sách gia phả, tờ khai lý lịch để tự động điền hồ sơ thành viên
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-300/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets row */}
        <div className="px-5 sm:px-6 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <FileText className="w-4 h-4 text-amber-800" />
            <span className="font-bold text-slate-800">Quét thông tin thành viên</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 font-medium hidden sm:inline">Mẫu thử nhanh:</span>
            <button
              type="button"
              onClick={() => applyPreset('to_khai')}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg font-semibold border border-amber-200 transition-colors cursor-pointer"
              title="Điền mẫu tờ khai thông tin thành viên"
            >
              Mẫu Tờ Khai Thành Viên
            </button>
            <button
              type="button"
              onClick={() => applyPreset('giapha')}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg font-semibold border border-amber-200 transition-colors cursor-pointer"
              title="Điền mẫu trang sách gia phả"
            >
              Mẫu Trang Gia Phả
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Input Method Toggles */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Nguồn dữ liệu:</span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="radio"
                name="inputMethod"
                checked={inputMethod === 'image'}
                onChange={() => setInputMethod('image')}
                className="text-amber-800 focus:ring-amber-500"
              />
              <span>Tải ảnh lên (Trang sách gia phả, tờ khai, ghi chép gia tộc)</span>
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="radio"
                name="inputMethod"
                checked={inputMethod === 'text'}
                onChange={() => setInputMethod('text')}
                className="text-amber-800 focus:ring-amber-500"
              />
              <span>Dán văn bản / Tin nhắn lý lịch</span>
            </label>
          </div>

          {/* Image Input View */}
          {inputMethod === 'image' && (
            <div className="space-y-3">
              {!selectedImage ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/70 transition-all rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 group-hover:bg-amber-200 text-amber-800 flex items-center justify-center transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Kéo thả hình ảnh vào đây hoặc bấm để chọn file
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Hỗ trợ: Ảnh chụp trang sách gia phả, tờ khai thông tin thành viên, bản ghi chép lý lịch gia tộc...
                    </p>
                  </div>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-white px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
                    <ImageIcon className="w-3 h-3 text-amber-700" />
                    Định dạng: JPG, PNG, WebP
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative rounded-2xl border border-amber-200 bg-amber-50/30 p-3 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={selectedImage}
                      alt="Selected upload"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{imageFileName || 'Hình ảnh đã tải lên'}</p>
                    <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sẵn sàng quét qua Gemini Vision AI
                    </p>
                    <button
                      onClick={handleClearImage}
                      className="mt-2 text-[11px] text-rose-600 hover:text-rose-800 font-semibold underline underline-offset-2"
                    >
                      Đổi hình ảnh khác
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text Input View */}
          {inputMethod === 'text' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dán văn bản tiểu sử, tin nhắn hoặc thông tin nhân thân:
              </label>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={
                  activeTab === 'member'
                    ? 'Ví dụ: Ông Nguyễn Văn Hưng, sinh năm 1978, Chi 1, con trai cụ Nguyễn Văn Nam. Số điện thoại: 0912345678, quê quán Nam Định. Số tài khoản MBBank 1903688889999...'
                    : 'Ví dụ: Số tài khoản MBBank 1903688889999 chủ tài khoản NGUYEN VAN HUNG chi nhánh Ba Đình...'
                }
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-sans"
              />
            </div>
          )}

          {/* Action Button */}
          <div>
            <button
              onClick={handleStartScan}
              disabled={isScanning || (inputMethod === 'image' && !selectedImage) || (inputMethod === 'text' && !rawText.trim())}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950 hover:from-amber-900 hover:to-amber-900 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Gemini AI đang nhận diện và trích xuất dữ liệu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {activeTab === 'member'
                      ? 'Bắt Đầu Quét Hồ Sơ Thành Viên Bằng AI'
                      : 'Bắt Đầu Quét & Nhận Diện Mã QR / Ngân Hàng'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Error Notice */}
          {errorNotice && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* RESULTS: Member Scan Output */}
          {activeTab === 'member' && memberResult && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Kết Quả Phân Tích Thông Tin Thành Viên
                  </h4>
                </div>
                <button
                  onClick={copyResultJSON}
                  className="text-[11px] text-emerald-800 hover:text-emerald-950 font-medium flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép JSON'}</span>
                </button>
              </div>

              {/* Parsed Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block">Họ và tên</span>
                  <span className="font-bold text-slate-900 text-sm">{memberResult.fullName || '(Chưa rõ)'}</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block">Năm sinh / Tuổi</span>
                  <span className="font-bold text-slate-900">
                    {memberResult.birthYear || '---'} {memberResult.birthYear ? `(${new Date().getFullYear() - memberResult.birthYear} tuổi)` : ''}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block">Giới tính</span>
                  <span className="font-semibold text-slate-800">
                    {memberResult.gender === 'female' ? 'Nữ' : 'Nam'}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block">Đời / Chi Phái</span>
                  <span className="font-semibold text-slate-800">
                    Đời {memberResult.generation || 4} • {memberResult.branch || 'Chi 1'}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block">Thân phụ (Cha)</span>
                  <span className="font-medium text-slate-800">{memberResult.fatherName || '(Chưa xác định)'}</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block">Vợ / Chồng</span>
                  <span className="font-medium text-slate-800">{memberResult.spouseName || '(Chưa xác định)'}</span>
                </div>

                <div className="col-span-2 sm:col-span-3 bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-semibold block">Nơi ở / Quê quán</span>
                  <span className="text-slate-800">{memberResult.currentAddress || '(Chưa xác định)'}</span>
                </div>
              </div>

              {/* Member Bank Account & VietQR if extracted */}
              {memberResult.bankAccount && memberResult.bankAccount.accountNumber && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-950 uppercase flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                      Phát hiện tài khoản ngân hàng & Mã VietQR
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                      Đã tạo VietQR
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Live VietQR Preview */}
                    <div className="w-24 h-24 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs shrink-0 flex items-center justify-center">
                      <img
                        src={memberResult.bankAccount.qrCodeUrl || generateVietQRUrl({
                          bankNameOrBin: memberResult.bankAccount.bankName,
                          accountNumber: memberResult.bankAccount.accountNumber,
                          accountHolder: memberResult.bankAccount.accountHolder,
                        })}
                        alt="VietQR"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-xs space-y-0.5 min-w-0 flex-1">
                      <p className="font-bold text-slate-900">
                        {memberResult.bankAccount.bankName} • STK: <span className="text-amber-900 font-mono">{memberResult.bankAccount.accountNumber}</span>
                      </p>
                      <p className="text-slate-700">Chủ TK: <span className="font-semibold uppercase">{memberResult.bankAccount.accountHolder}</span></p>
                      {memberResult.bankAccount.branchName && (
                        <p className="text-[11px] text-slate-500">Chi nhánh: {memberResult.bankAccount.branchName}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Apply Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
                <button
                  onClick={handleApplyMemberData}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4 text-emerald-200" />
                  <span>Áp Dụng & Tự Động Điền Biểu Mẫu</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Trợ lý số phân tích và trích xuất dữ liệu dựa trên Gemini API</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
