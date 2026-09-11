import React, { useState, useMemo } from 'react';
import { FamilyMember, UserRole } from '../types';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  User, 
  MapPin, 
  Briefcase, 
  Phone, 
  Calendar, 
  Eye, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  UserPlus,
  Edit3,
  Trash2
} from 'lucide-react';

interface MemberSearchProps {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
  onNavigateToTreeWithMember: (member: FamilyMember) => void;
  currentRole: UserRole;
  onAddNewMember: () => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (member: FamilyMember) => void;
}

export const MemberSearch: React.FC<MemberSearchProps> = ({
  members,
  onSelectMember,
  onNavigateToTreeWithMember,
  currentRole,
  onAddNewMember,
  onEditMember,
  onDeleteMember
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGeneration, setSelectedGeneration] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedLifeStatus, setSelectedLifeStatus] = useState<string>('all'); // 'all', 'alive', 'deceased'
  const [selectedGender, setSelectedGender] = useState<string>('all'); // 'all', 'male', 'female', 'inlaw'
  const [addressQuery, setAddressQuery] = useState<string>('');
  const [workplaceQuery, setWorkplaceQuery] = useState<string>('');
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGeneration('all');
    setSelectedBranch('all');
    setSelectedLifeStatus('all');
    setSelectedGender('all');
    setAddressQuery('');
    setWorkplaceQuery('');
  };

  // Count active non-default filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGeneration !== 'all') count++;
    if (selectedBranch !== 'all') count++;
    if (selectedLifeStatus !== 'all') count++;
    if (selectedGender !== 'all') count++;
    if (addressQuery.trim()) count++;
    if (workplaceQuery.trim()) count++;
    return count;
  }, [selectedGeneration, selectedBranch, selectedLifeStatus, selectedGender, addressQuery, workplaceQuery]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Name & bio query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchName = m.fullName.toLowerCase().includes(query);
        const matchSpouse = m.spouseName?.toLowerCase().includes(query);
        const matchPhone = m.phoneNumber?.includes(query);
        const matchBio = m.bio?.toLowerCase().includes(query);
        if (!matchName && !matchSpouse && !matchPhone && !matchBio) return false;
      }

      // Generation filter
      if (selectedGeneration !== 'all' && m.generation !== Number(selectedGeneration)) {
        return false;
      }

      // Branch filter
      if (selectedBranch !== 'all' && !m.branch.includes(selectedBranch)) {
        return false;
      }

      // Life status filter
      if (selectedLifeStatus === 'alive' && !m.isAlive) return false;
      if (selectedLifeStatus === 'deceased' && m.isAlive) return false;

      // Gender / Relationship filter
      if (selectedGender === 'male' && m.gender !== 'male') return false;
      if (selectedGender === 'female' && m.gender !== 'female') return false;
      if (selectedGender === 'inlaw' && !m.isSpouse && !m.spouseName) return false;

      // Address filter
      if (addressQuery.trim()) {
        const q = addressQuery.toLowerCase().trim();
        if (!m.currentAddress?.toLowerCase().includes(q) && !m.burialPlace?.toLowerCase().includes(q)) {
          return false;
        }
      }

      // Workplace filter
      if (workplaceQuery.trim()) {
        const q = workplaceQuery.toLowerCase().trim();
        if (!m.workplace?.toLowerCase().includes(q)) return false;
      }

      return true;
    });
  }, [members, searchTerm, selectedGeneration, selectedBranch, selectedLifeStatus, selectedGender, addressQuery, workplaceQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 font-serif-display">
            Tra Cứu Thông Tin Thành Viên Đa Thế Hệ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tìm kiếm theo tên, thế hệ, mối quan hệ gia tộc, quê quán, nơi công tác và ngày giỗ
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
            <span>Tìm thấy: <strong>{filteredMembers.length}</strong> / {members.length} thành viên</span>
          </div>

          {(currentRole === 'admin' || currentRole === 'liaison') && (
            <button
              id="search-add-member-top-btn"
              onClick={onAddNewMember}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs shrink-0 ${
                currentRole === 'admin' ? 'bg-amber-800 hover:bg-amber-900' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{currentRole === 'admin' ? '+ Thêm Thành Viên' : '+ Đề Xuất Thêm'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
        {/* Main Search Input & Mobile Filter Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-input-name"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên thành viên, tên dâu/rể, số điện thoại..."
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`flex-1 sm:flex-none px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                isFilterExpanded || activeFiltersCount > 0
                  ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Bộ lọc chi tiết</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Reset button */}
            {(searchTerm || activeFiltersCount > 0) && (
              <button
                id="reset-search-filters-btn"
                onClick={resetFilters}
                className="px-3 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-amber-800 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition-colors"
                title="Đặt lại toàn bộ tiêu chí"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đặt lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filter Fields (Always visible on desktop md+, collapsible on mobile) */}
        <div className={`${isFilterExpanded ? 'block' : 'hidden md:block'} pt-3 border-t border-slate-100`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {/* Generation Select */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Thế hệ (Đời thứ):
              </label>
              <select
                id="search-filter-generation"
                value={selectedGeneration}
                onChange={(e) => setSelectedGeneration(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800"
              >
                <option value="all">Tất cả các đời (1 - 5)</option>
                <option value="1">Đời I (Cụ Thủy Tổ)</option>
                <option value="2">Đời II</option>
                <option value="3">Đời III</option>
                <option value="4">Đời IV</option>
                <option value="5">Đời V (Hậu duệ trẻ)</option>
              </select>
            </div>

            {/* Branch Select */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Chi phái:
              </label>
              <select
                id="search-filter-branch"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800"
              >
                <option value="all">Toàn bộ chi phái</option>
                <option value="Chi 1">Chi 1 (Chi Trưởng)</option>
                <option value="Chi 2">Chi 2 (Chi Thứ)</option>
                <option value="Chi 3">Chi 3</option>
              </select>
            </div>

            {/* Life Status */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tình trạng:
              </label>
              <select
                id="search-filter-lifestatus"
                value={selectedLifeStatus}
                onChange={(e) => setSelectedLifeStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800"
              >
                <option value="all">Tất cả</option>
                <option value="alive">● Còn sống</option>
                <option value="deceased">† Đã quy tiên</option>
              </select>
            </div>

            {/* Gender / Relationship */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Giới tính / Quan hệ:
              </label>
              <select
                id="search-filter-gender"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800"
              >
                <option value="all">Tất cả nam, nữ, dâu rể</option>
                <option value="male">Nam (Trai, Cháu trai)</option>
                <option value="female">Nữ (Gái, Cháu gái)</option>
                <option value="inlaw">Có thông tin Dâu/Rể</option>
              </select>
            </div>

            {/* Address Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Địa chỉ / Quê quán:
              </label>
              <input
                id="search-input-address"
                type="text"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)}
                placeholder="Hà Nội, Cẩm Giàng..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800"
              />
            </div>

            {/* Workplace Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nơi công tác / Chức vụ:
              </label>
              <input
                id="search-input-workplace"
                type="text"
                value={workplaceQuery}
                onChange={(e) => setWorkplaceQuery(e.target.value)}
                placeholder="Bộ, Viện, Bác sĩ, FPT..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const isMale = member.gender === 'male';

            return (
              <div
                key={member.id}
                id={`search-card-${member.id}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-amber-300 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      Đời {member.generation} • {member.branch}
                    </span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      member.isAlive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {member.isAlive ? '● Còn sống' : '† Đã mất'}
                    </span>
                  </div>

                  {/* Member Name and Identity */}
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base font-serif-display shrink-0 ${
                      isMale ? 'bg-blue-100 text-blue-900' : 'bg-rose-100 text-rose-900'
                    }`}>
                      {member.fullName.charAt(member.fullName.lastIndexOf(' ') + 1) || 'N'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-base font-serif-display truncate">
                        {member.fullName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {member.birthYear} - {member.isAlive ? 'Nay' : (member.deathYear || '?')}
                        {member.lunarDeathDate && ` (Giỗ: ${member.lunarDeathDate})`}
                      </p>
                      {member.title && (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1 inline-block">
                          ★ {member.title}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    {member.spouseName && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Vợ/Chồng:</span>
                        <span className="font-medium text-slate-800">{member.spouseName}</span>
                      </div>
                    )}
                    {member.workplace && (
                      <div className="flex items-start gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{member.workplace}</span>
                      </div>
                    )}
                    {member.currentAddress && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{member.currentAddress}</span>
                      </div>
                    )}
                    {member.phoneNumber && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{member.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => onSelectMember(member)}
                    className="flex-1 px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors flex items-center justify-center gap-1 border border-amber-200"
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Chi tiết & 3 thế hệ</span>
                  </button>

                  {(currentRole === 'admin' || currentRole === 'liaison') && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditMember(member)}
                        className="p-1.5 text-xs text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                        title={currentRole === 'admin' ? 'Chỉnh sửa thông tin thành viên' : 'Đề xuất sửa thông tin'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMember(member)}
                        className="p-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                        title={currentRole === 'admin' ? 'Xoá thành viên khỏi gia phả' : 'Đề xuất xoá thành viên'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => onNavigateToTreeWithMember(member)}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 border border-slate-200 shrink-0"
                    title="Định vị trên cây phả hệ"
                  >
                    <span className="hidden sm:inline">Cây</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Không tìm thấy thành viên phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hãy thử thay đổi từ khóa hoặc đặt lại bộ lọc nâng cao để tìm kiếm trên toàn bộ cây gia phả dòng họ.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};
