import React, { useState, useEffect } from 'react';
import { FamilyMember, UserRole, AIScannedMemberResult, SpouseRelationship } from '../types';
import { 
  X, 
  UserPlus, 
  FileEdit, 
  AlertCircle, 
  Info, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Phone, 
  Award,
  Sparkles,
  CheckCircle2,
  Heart,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AIScannerModal } from './AIScannerModal';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  allMembers: FamilyMember[];
  currentRole: UserRole;
  editTargetMember?: FamilyMember | null;
  initialParentId?: string | null;
  initialScannedData?: Partial<FamilyMember> | null;
  onSubmit: (memberData: Partial<FamilyMember>, isDirectAdminAdd: boolean) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  allMembers,
  currentRole,
  editTargetMember,
  initialParentId,
  initialScannedData,
  onSubmit
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [generation, setGeneration] = useState<number>(4);
  const [branch, setBranch] = useState<string>('Chi 1');
  const [title, setTitle] = useState<string>('');
  const [birthYear, setBirthYear] = useState<number>(1995);
  const [isAlive, setIsAlive] = useState<boolean>(true);
  const [deathYear, setDeathYear] = useState<number | undefined>(undefined);
  const [lunarDeathDate, setLunarDeathDate] = useState<string>('');
  const [burialPlace, setBurialPlace] = useState<string>('');
  const [fatherId, setFatherId] = useState<string>('');
  const [motherId, setMotherId] = useState<string>('');
  
  // Spouse detailed relationship state
  const [spouseName, setSpouseName] = useState<string>('');
  const [spouseRole, setSpouseRole] = useState<string>('chinh_that');
  const [spouseBirthYear, setSpouseBirthYear] = useState<number | undefined>(undefined);
  const [spouseDeathYear, setSpouseDeathYear] = useState<number | undefined>(undefined);
  const [spouseIsAlive, setSpouseIsAlive] = useState<boolean>(true);
  const [spouseLunarDeathDate, setSpouseLunarDeathDate] = useState<string>('');
  const [spouseBurialPlace, setSpouseBurialPlace] = useState<string>('');
  const [spouseOriginAddress, setSpouseOriginAddress] = useState<string>('');
  const [spouseMarriageYear, setSpouseMarriageYear] = useState<number | undefined>(undefined);
  const [spouseOccupation, setSpouseOccupation] = useState<string>('');
  const [spouseNotes, setSpouseNotes] = useState<string>('');
  const [showSpouseMoreDetails, setShowSpouseMoreDetails] = useState<boolean>(false);

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [workplace, setWorkplace] = useState<string>('');
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [bio, setBio] = useState<string>('');

  // Bank Info & VietQR state
  const [bankName, setBankName] = useState<string>('MBBank');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('');
  const [branchBank, setBranchBank] = useState<string>('');

  // AI Scanner state
  const [isAIScannerOpen, setIsAIScannerOpen] = useState<boolean>(false);
  const [aiAutoFilledNotice, setAiAutoFilledNotice] = useState<string | null>(null);

  // Reset or populate fields whenever modal opens or editTargetMember/initialParentId changes
  useEffect(() => {
    if (!isOpen) return;

    setAiAutoFilledNotice(null);

    if (editTargetMember) {
      // Edit mode
      setFullName(editTargetMember.fullName || '');
      setGender(editTargetMember.gender || 'male');
      setGeneration(editTargetMember.generation || 4);
      setBranch(editTargetMember.branch || 'Chi 1');
      setTitle(editTargetMember.title || '');
      setBirthYear(editTargetMember.birthYear || 1990);
      setIsAlive(editTargetMember.isAlive ?? true);
      setDeathYear(editTargetMember.deathYear || undefined);
      setLunarDeathDate(editTargetMember.lunarDeathDate || '');
      setBurialPlace(editTargetMember.burialPlace || '');
      setFatherId(editTargetMember.fatherId || '');
      setMotherId(editTargetMember.motherId || '');

      // Populate spouse info
      const sp = editTargetMember.spouses?.[0];
      setSpouseName(sp?.fullName || editTargetMember.spouseName || '');
      setSpouseRole(sp?.spouseRole || (editTargetMember.gender === 'female' ? 'chong' : 'chinh_that'));
      setSpouseBirthYear(sp?.birthYear);
      setSpouseDeathYear(sp?.deathYear);
      setSpouseIsAlive(sp?.isAlive ?? true);
      setSpouseLunarDeathDate(sp?.lunarDeathDate || '');
      setSpouseBurialPlace(sp?.burialPlace || '');
      setSpouseOriginAddress(sp?.originAddress || '');
      setSpouseMarriageYear(sp?.marriageYear);
      setSpouseOccupation(sp?.occupation || '');
      setSpouseNotes(sp?.notes || '');
      if (sp?.originAddress || sp?.marriageYear || sp?.burialPlace || sp?.lunarDeathDate || sp?.notes || sp?.occupation) {
        setShowSpouseMoreDetails(true);
      } else {
        setShowSpouseMoreDetails(false);
      }

      setPhoneNumber(editTargetMember.phoneNumber || '');
      setWorkplace(editTargetMember.workplace || '');
      setCurrentAddress(editTargetMember.currentAddress || '');
      setBio(editTargetMember.bio || '');

      if (editTargetMember.bankAccount) {
        setBankName(editTargetMember.bankAccount.bankName || 'MBBank');
        setAccountNumber(editTargetMember.bankAccount.accountNumber || '');
        setAccountHolder(editTargetMember.bankAccount.accountHolder || '');
        setBranchBank(editTargetMember.bankAccount.branchName || '');
      } else {
        setBankName('MBBank');
        setAccountNumber('');
        setAccountHolder('');
        setBranchBank('');
      }
    } else {
      // Create new mode
      let parentMember: FamilyMember | undefined;
      if (initialParentId) {
        parentMember = allMembers.find(m => m.id === initialParentId);
      }

      let initFatherId = '';
      let initMotherId = '';
      if (parentMember) {
        if (parentMember.gender === 'female') {
          initMotherId = parentMember.id;
          if (parentMember.spouseName) {
            const sp = allMembers.find(m => m.fullName === parentMember!.spouseName);
            if (sp) initFatherId = sp.id;
          }
        } else {
          initFatherId = parentMember.id;
          const primarySpouseName = parentMember.spouses?.[0]?.fullName || parentMember.spouseName;
          if (primarySpouseName) {
            const sp = allMembers.find(m => m.fullName === primarySpouseName);
            if (sp) {
              initMotherId = sp.id;
            }
          }
        }
      }

      setFullName(initialScannedData?.fullName || '');
      setGender(initialScannedData?.gender || 'male');
      setGeneration(initialScannedData?.generation || (parentMember ? Math.min(parentMember.generation + 1, 5) : 4));
      setBranch(initialScannedData?.branch || (parentMember ? parentMember.branch : 'Chi 1'));
      setTitle(initialScannedData?.title || '');
      setBirthYear(initialScannedData?.birthYear || (new Date().getFullYear() - 25));
      setIsAlive(initialScannedData?.isAlive ?? true);
      setDeathYear(initialScannedData?.deathYear || undefined);
      setLunarDeathDate(initialScannedData?.lunarDeathDate || '');
      setBurialPlace(initialScannedData?.burialPlace || '');
      setFatherId(initialScannedData?.fatherId || initFatherId);
      setMotherId(initialScannedData?.motherId || initMotherId);
      
      const sp = initialScannedData?.spouses?.[0];
      setSpouseName(sp?.fullName || initialScannedData?.spouseName || '');
      setSpouseRole(sp?.spouseRole || (initialScannedData?.gender === 'female' ? 'chong' : 'chinh_that'));
      setSpouseBirthYear(sp?.birthYear);
      setSpouseDeathYear(sp?.deathYear);
      setSpouseIsAlive(sp?.isAlive ?? true);
      setSpouseLunarDeathDate(sp?.lunarDeathDate || '');
      setSpouseBurialPlace(sp?.burialPlace || '');
      setSpouseOriginAddress(sp?.originAddress || '');
      setSpouseMarriageYear(sp?.marriageYear);
      setSpouseOccupation(sp?.occupation || '');
      setSpouseNotes(sp?.notes || '');
      setShowSpouseMoreDetails(false);

      setPhoneNumber(initialScannedData?.phoneNumber || '');
      setWorkplace(initialScannedData?.workplace || '');
      setCurrentAddress(initialScannedData?.currentAddress || parentMember?.currentAddress || '');
      setBio(initialScannedData?.bio || '');

      if (initialScannedData?.bankAccount) {
        setBankName(initialScannedData.bankAccount.bankName || 'MBBank');
        setAccountNumber(initialScannedData.bankAccount.accountNumber || '');
        setAccountHolder(initialScannedData.bankAccount.accountHolder || (initialScannedData.fullName?.toUpperCase() || ''));
        setBranchBank(initialScannedData.bankAccount.branchName || '');
      } else {
        setBankName('MBBank');
        setAccountNumber('');
        setAccountHolder(initialScannedData?.fullName ? initialScannedData.fullName.toUpperCase() : '');
        setBranchBank('');
      }
    }
  }, [isOpen, editTargetMember, initialParentId, initialScannedData, allMembers]);

  // Handle data auto-filled from AI
  const handleApplyAIScannedData = (data: AIScannedMemberResult) => {
    if (data.fullName) {
      setFullName(data.fullName);
      if (!accountHolder) setAccountHolder(data.fullName.toUpperCase());
    }
    if (data.gender) setGender(data.gender);
    if (data.generation) setGeneration(data.generation);
    if (data.branch) setBranch(data.branch);
    if (data.title) setTitle(data.title);
    if (data.birthYear) setBirthYear(data.birthYear);
    if (data.isAlive !== undefined) {
      setIsAlive(data.isAlive);
      if (!data.isAlive && data.deathYear) setDeathYear(data.deathYear);
    }
    if (data.lunarDeathDate) setLunarDeathDate(data.lunarDeathDate);
    if (data.burialPlace) setBurialPlace(data.burialPlace);
    if (data.spouseName) setSpouseName(data.spouseName);
    if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
    if (data.workplace) setWorkplace(data.workplace);
    if (data.currentAddress) setCurrentAddress(data.currentAddress);
    if (data.bio) setBio(data.bio);

    // Auto-fill spouse if detected by AI
    if (data.spouseDetails) {
      if (data.spouseDetails.fullName) setSpouseName(data.spouseDetails.fullName);
      if (data.spouseDetails.spouseRole) setSpouseRole(data.spouseDetails.spouseRole);
      if (data.spouseDetails.birthYear) setSpouseBirthYear(data.spouseDetails.birthYear);
      if (data.spouseDetails.deathYear) setSpouseDeathYear(data.spouseDetails.deathYear);
      if (data.spouseDetails.isAlive !== undefined) setSpouseIsAlive(data.spouseDetails.isAlive);
      if (data.spouseDetails.lunarDeathDate) setSpouseLunarDeathDate(data.spouseDetails.lunarDeathDate);
      if (data.spouseDetails.burialPlace) setSpouseBurialPlace(data.spouseDetails.burialPlace);
      if (data.spouseDetails.originAddress) setSpouseOriginAddress(data.spouseDetails.originAddress);
      if (data.spouseDetails.marriageYear) setSpouseMarriageYear(data.spouseDetails.marriageYear);
      if (data.spouseDetails.occupation) setSpouseOccupation(data.spouseDetails.occupation);
      if (data.spouseDetails.notes) setSpouseNotes(data.spouseDetails.notes);
      setShowSpouseMoreDetails(true);
    } else if (data.spouseName) {
      setSpouseName(data.spouseName);
    }

    // Match father by name if provided
    if (data.fatherName) {
      const match = allMembers.find(m => 
        m.gender === 'male' && 
        m.fullName.toLowerCase().includes(data.fatherName!.toLowerCase())
      );
      if (match) setFatherId(match.id);
    }

    // Match mother by name if provided
    if (data.motherName) {
      const match = allMembers.find(m => 
        m.gender === 'female' && 
        m.fullName.toLowerCase().includes(data.motherName!.toLowerCase())
      );
      if (match) setMotherId(match.id);
    }

    setAiAutoFilledNotice(`Đã tự động điền các thông tin gia phả từ AI (Họ tên: ${data.fullName || '---'}).`);
    setTimeout(() => setAiAutoFilledNotice(null), 6000);
  };

  if (!isOpen) return null;

  // Potential fathers are members of generation - 1 (or any earlier generation)
  const potentialFathers = allMembers.filter(m => m.gender === 'male' && m.generation === generation - 1 && m.id !== editTargetMember?.id);
  // Potential mothers are female members of generation - 1
  const potentialMothers = allMembers.filter(m => m.gender === 'female' && m.generation === generation - 1 && m.id !== editTargetMember?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Vui lòng nhập họ và tên thành viên.');
      return;
    }

    // Construct structured spouses list
    const structuredSpouses: SpouseRelationship[] = [];
    if (spouseName.trim()) {
      structuredSpouses.push({
        fullName: spouseName.trim(),
        spouseRole: (spouseRole || (gender === 'female' ? 'chong' : 'chinh_that')) as any,
        birthYear: spouseBirthYear ? Number(spouseBirthYear) : undefined,
        deathYear: !spouseIsAlive && spouseDeathYear ? Number(spouseDeathYear) : undefined,
        isAlive: spouseIsAlive,
        lunarDeathDate: !spouseIsAlive && spouseLunarDeathDate.trim() ? spouseLunarDeathDate.trim() : undefined,
        burialPlace: !spouseIsAlive && spouseBurialPlace.trim() ? spouseBurialPlace.trim() : undefined,
        originAddress: spouseOriginAddress.trim() || undefined,
        marriageYear: spouseMarriageYear ? Number(spouseMarriageYear) : undefined,
        occupation: spouseOccupation.trim() || undefined,
        notes: spouseNotes.trim() || undefined
      });
    }

    const memberData: Partial<FamilyMember> = {
      fullName: fullName.trim(),
      gender,
      generation,
      branch,
      title: title.trim() || undefined,
      birthYear: Number(birthYear),
      deathYear: isAlive ? null : (deathYear ? Number(deathYear) : null),
      isAlive,
      lunarDeathDate: isAlive ? undefined : lunarDeathDate.trim() || undefined,
      burialPlace: isAlive ? undefined : burialPlace.trim() || undefined,
      fatherId: fatherId || null,
      motherId: motherId || null,
      spouseName: spouseName.trim() || null,
      spouses: structuredSpouses.length > 0 ? structuredSpouses : undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      workplace: workplace.trim() || undefined,
      currentAddress: currentAddress.trim() || undefined,
      bio: bio.trim() || undefined,
      bankAccount: undefined
    };

    const isDirectAdminAdd = currentRole === 'admin';
    onSubmit(memberData, isDirectAdminAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              currentRole === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {editTargetMember ? <FileEdit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 font-serif-display">
                {editTargetMember 
                  ? (currentRole === 'admin' ? 'Chỉnh Sửa Trực Tiếp Thành Viên' : 'Đề Xuất Sửa Đổi Thành Viên')
                  : (currentRole === 'admin' ? 'Thêm Trực Tiếp Thành Viên Lên Phả Đồ' : 'Đề Xuất Thêm Thành Viên Mới')
                }
              </h3>
              <p className="text-xs text-slate-500">
                {editTargetMember 
                  ? `Cập nhật thông tin cho: ${editTargetMember.fullName}`
                  : (initialParentId ? `Thêm hậu duệ / con của ${allMembers.find(m => m.id === initialParentId)?.fullName || 'thành viên'}` : 'Nhập thông tin nhân thân để đưa vào gia phả')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role notice */}
        <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
          currentRole === 'admin' ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-blue-50 text-blue-900 border border-blue-200'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {currentRole === 'admin' 
              ? 'Quyền Quản Trị Viên (Admin): Mọi thay đổi sẽ được lưu ngay tức thì vào Cây gia phả chính thức.' 
              : 'Quyền Liên Lạc Viên (Liaison): Thông tin sẽ được gửi dưới dạng Đề xuất chờ Admin xét duyệt tại Bảng Quản Trị.'}
          </span>
        </div>

        {/* AI Auto Scan & Fill Banner - Admin Only */}
        {currentRole === 'admin' && (
          <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-amber-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-800/80 flex items-center justify-center text-amber-200 shrink-0 border border-amber-700/60">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-xs text-amber-100 flex items-center gap-1.5">
                  <span>Trợ Lý AI Tự Quét & Điền Thông Tin</span>
                  <span className="text-[10px] bg-amber-800 text-amber-200 font-semibold px-1.5 py-0.5 rounded border border-amber-700/40">
                    Gemini Vision
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  Phân tích ảnh chụp trang sách gia phả, tờ khai hoặc ghi chép dòng họ để điền nhanh hồ sơ
                </p>
              </div>
            </div>
            <button
              type="button"
              id="btn-open-ai-scanner-modal"
              onClick={() => {
                setIsAIScannerOpen(true);
              }}
              className="self-start sm:self-auto px-3.5 py-1.5 bg-amber-300 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              <span>Quét Bằng AI</span>
            </button>
          </div>
        )}

        {/* AI auto fill success banner */}
        {aiAutoFilledNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{aiAutoFilledNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Section 1: Basic Info */}
          <div className="space-y-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              1. Thông Tin Nhân Thân & Danh Phận
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Họ và tên thành viên: <span className="text-rose-500">*</span>
                </label>
                <input
                  id="member-fullname-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Hoàng"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Giới tính: <span className="text-rose-500">*</span>
                </label>
                <select
                  id="member-gender-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                >
                  <option value="male">Nam giới (Con trai, Cháu trai)</option>
                  <option value="female">Nữ giới (Con gái, Cháu gái)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Thế hệ (Đời thứ): <span className="text-rose-500">*</span>
                </label>
                <select
                  id="member-generation-select"
                  value={generation}
                  onChange={(e) => setGeneration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                >
                  <option value={1}>Đời I (Thủy Tổ)</option>
                  <option value={2}>Đời II</option>
                  <option value={3}>Đời III</option>
                  <option value={4}>Đời IV</option>
                  <option value={5}>Đời V (Hậu duệ trẻ)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Chi phái: <span className="text-rose-500">*</span>
                </label>
                <select
                  id="member-branch-select"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                >
                  <option value="Chi 1">Chi 1 (Chi Trưởng)</option>
                  <option value="Chi 2">Chi 2 (Chi Thứ)</option>
                  <option value="Chi 3">Chi 3</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Chức sắc / Danh hiệu họ tộc:
                </label>
                <input
                  id="member-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Trưởng Tộc, Chi Trưởng..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sinh - Tử & Ngày Giỗ */}
          <div className="space-y-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              2. Tình Trạng Sinh Tử & Ngày Kỵ Giỗ
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Năm sinh: <span className="text-rose-500">*</span>
                </label>
                <input
                  id="member-birthyear-input"
                  type="number"
                  required
                  min={1800}
                  max={2030}
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tình trạng hiện tại:
                </label>
                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-emerald-800">
                    <input
                      type="radio"
                      name="isAlive"
                      checked={isAlive}
                      onChange={() => setIsAlive(true)}
                      className="text-amber-800 focus:ring-amber-500"
                    />
                    ● Còn sống
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="radio"
                      name="isAlive"
                      checked={!isAlive}
                      onChange={() => setIsAlive(false)}
                      className="text-amber-800 focus:ring-amber-500"
                    />
                    † Đã quy tiên (Đã mất)
                  </label>
                </div>
              </div>
            </div>

            {/* Deceased details if !isAlive */}
            {!isAlive && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Năm mất (Dương lịch):</label>
                  <input
                    type="number"
                    min={1800}
                    max={2030}
                    value={deathYear || ''}
                    onChange={(e) => setDeathYear(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Ví dụ: 2018"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Ngày giỗ kỵ (Âm lịch):</label>
                  <input
                    type="text"
                    value={lunarDeathDate}
                    onChange={(e) => setLunarDeathDate(e.target.value)}
                    placeholder="Ví dụ: 15 tháng 3 Âm lịch"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nơi an táng / Mộ phần:</label>
                  <input
                    type="text"
                    value={burialPlace}
                    onChange={(e) => setBurialPlace(e.target.value)}
                    placeholder="Ví dụ: Nghĩa trang quê nhà Cẩm Giàng"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Quan Hệ Phụ Mẫu & Huyết Thống */}
          <div className="space-y-4 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              3. Quan Hệ Phụ Mẫu & Huyết Thống
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Người Cha trực hệ (Đời {generation > 1 ? generation - 1 : '—'}):
                </label>
                <select
                  id="member-father-select"
                  value={fatherId}
                  onChange={(e) => setFatherId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 text-xs"
                >
                  <option value="">-- Không rõ / Cụ Khởi Tổ --</option>
                  {potentialFathers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fullName} ({f.birthYear} - {f.branch})
                    </option>
                  ))}
                </select>
                {potentialFathers.length === 0 && generation > 1 && (
                  <p className="text-[10px] text-amber-700 mt-1">
                    Lưu ý: Chưa có thành viên nam nào thuộc Đời {generation - 1} để chọn làm cha.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Người Mẹ (Đời {generation > 1 ? generation - 1 : '—'}):
                </label>
                <select
                  id="member-mother-select"
                  value={motherId}
                  onChange={(e) => setMotherId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 text-xs"
                >
                  <option value="">-- Không rõ / Chưa xác định --</option>
                  {potentialMothers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.birthYear} - {m.branch})
                    </option>
                  ))}
                </select>
                {potentialMothers.length === 0 && generation > 1 && (
                  <p className="text-[10px] text-amber-700 mt-1">
                    Lưu ý: Chưa có thành viên nữ nào thuộc Đời {generation - 1} để chọn làm mẹ.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Quan Hệ Vợ Chồng (Hôn Phối Dòng Họ) */}
          <div className="space-y-3 bg-rose-50/40 p-3.5 rounded-xl border border-rose-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-100" />
                4. Quan Hệ Vợ Chồng (Hôn Phối Dòng Họ)
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded-full border border-rose-200">
                Dâu / Rể gia tộc
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Họ & tên Vợ/Chồng:
                </label>
                <input
                  id="member-spouse-input"
                  type="text"
                  value={spouseName}
                  onChange={(e) => setSpouseName(e.target.value)}
                  placeholder={gender === 'male' ? 'Ví dụ: Trần Thị Mai' : 'Ví dụ: Nguyễn Văn Hải'}
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Quan hệ hôn phối / Vị trí:
                </label>
                <select
                  value={spouseRole}
                  onChange={(e) => setSpouseRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-slate-900 text-xs sm:text-sm"
                >
                  {gender === 'male' ? (
                    <>
                      <option value="chinh_that">Chính thất (Vợ cả / Dâu trưởng)</option>
                      <option value="ke_that">Kế thất (Vợ hai / Kế mẫu)</option>
                      <option value="thu_that">Thứ thất (Vợ lẽ)</option>
                      <option value="phoi_ngau">Vợ/Chồng</option>
                    </>
                  ) : (
                    <>
                      <option value="chong">Chồng (Chàng rể)</option>
                      <option value="phoi_ngau">Vợ/Chồng</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Toggle advanced spouse details */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowSpouseMoreDetails(!showSpouseMoreDetails)}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1 transition-colors"
              >
                {showSpouseMoreDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>
                  {showSpouseMoreDetails 
                    ? 'Thu gọn chi tiết hôn phối' 
                    : 'Mở rộng chi tiết hôn phối (Nguyên quán thông gia, năm cưới, ngày giỗ, mộ phần, công đức...)'}
                </span>
              </button>

              {showSpouseMoreDetails && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-rose-100 space-y-3 text-xs">
                  {/* Status & Years */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Tình trạng Vợ/Chồng:
                      </label>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="spouse_is_alive"
                            checked={spouseIsAlive}
                            onChange={() => setSpouseIsAlive(true)}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <span className="text-slate-700">Còn sống</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="spouse_is_alive"
                            checked={!spouseIsAlive}
                            onChange={() => setSpouseIsAlive(false)}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <span className="text-slate-700">Đã quy tiên</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Năm sinh Vợ/Chồng:
                      </label>
                      <input
                        type="number"
                        min={1800}
                        max={2030}
                        value={spouseBirthYear || ''}
                        onChange={(e) => setSpouseBirthYear(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Ví dụ: 1955"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Năm thành hôn (kết hôn):
                      </label>
                      <input
                        type="number"
                        min={1800}
                        max={2030}
                        value={spouseMarriageYear || ''}
                        onChange={(e) => setSpouseMarriageYear(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Ví dụ: 1978"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Deceased details if not alive */}
                  {!spouseIsAlive && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-2.5 bg-rose-50/50 rounded-lg border border-rose-200/60">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Năm tạ thế:
                        </label>
                        <input
                          type="number"
                          min={1800}
                          max={2030}
                          value={spouseDeathYear || ''}
                          onChange={(e) => setSpouseDeathYear(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Ví dụ: 2015"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Ngày giỗ kỵ (Âm lịch):
                        </label>
                        <input
                          type="text"
                          value={spouseLunarDeathDate}
                          onChange={(e) => setSpouseLunarDeathDate(e.target.value)}
                          placeholder="Ví dụ: Ngày 14 tháng 11"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Mộ phần / Nơi an nghỉ:
                        </label>
                        <input
                          type="text"
                          value={spouseBurialPlace}
                          onChange={(e) => setSpouseBurialPlace(e.target.value)}
                          placeholder="Ví dụ: Nghĩa trang quê nhà"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                        />
                      </div>
                    </div>
                  )}

                  {/* Origin Address & Occupation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Nguyên quán / Quê quán bên ngoại (Dòng dõi thông gia):
                      </label>
                      <input
                        type="text"
                        value={spouseOriginAddress}
                        onChange={(e) => setSpouseOriginAddress(e.target.value)}
                        placeholder="Ví dụ: Làng Đồng Kỵ, Từ Sơn, Bắc Ninh"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Nghề nghiệp / Chức vụ:
                      </label>
                      <input
                        type="text"
                        value={spouseOccupation}
                        onChange={(e) => setSpouseOccupation(e.target.value)}
                        placeholder="Ví dụ: Giáo viên, Y sĩ..."
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Notes & Virtues */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Ghi chú công đức & đức hạnh với họ tộc:
                    </label>
                    <textarea
                      rows={2}
                      value={spouseNotes}
                      onChange={(e) => setSpouseNotes(e.target.value)}
                      placeholder="Ghi nhận công lao dâu hiền rể thảo chăm lo phụng dưỡng tiên tổ, xây dựng nhà thờ họ..."
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Nơi Cư Trú & Công Tác */}
          <div className="space-y-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              5. Nơi Cư Trú, Công Tác & Liên Lạc
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Số điện thoại liên lạc:
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ví dụ: 0912 345 678"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nơi công tác / Chức vụ / Nghề nghiệp:
                </label>
                <input
                  type="text"
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  placeholder="Ví dụ: Kỹ sư CNTT, Giảng viên..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Địa chỉ thường trú hiện tại:
              </label>
              <input
                type="text"
                value={currentAddress}
                onChange={(e) => setCurrentAddress(e.target.value)}
                placeholder="Ví dụ: Ba Đình, Hà Nội"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tiểu sử, công trạng & ghi chú họ tộc:
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Thông tin thêm về công lao đóng góp cho dòng họ, học vấn, sự nghiệp..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Đóng lại
            </button>
            <button
              id="submit-member-btn"
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                currentRole === 'admin' ? 'bg-amber-800 hover:bg-amber-900' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {currentRole === 'admin' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  {editTargetMember ? 'Lưu Cập Nhật Vào Phả Đồ' : 'Thêm Trực Tiếp Lên Phả Đồ'}
                </>
              ) : (
                <>
                  <FileEdit className="w-4 h-4" />
                  {editTargetMember ? 'Gửi Đề Xuất Sửa Đổi' : 'Gửi Đề Xuất Thêm Mới'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Embedded AIScannerModal */}
      <AIScannerModal
        isOpen={isAIScannerOpen}
        onClose={() => setIsAIScannerOpen(false)}
        onApplyMember={handleApplyAIScannedData}
      />
    </div>
  );
};
