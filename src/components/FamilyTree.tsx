import React, { useState, useRef, useEffect } from 'react';
import { FamilyMember, UserRole } from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  PlusCircle, 
  Info, 
  Users,
  ChevronDown,
  ChevronUp,
  Compass,
  Edit3,
  Trash2,
  UserPlus,
  Heart
} from 'lucide-react';

interface FamilyTreeProps {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
  currentRole: UserRole;
  onAddNewMember: () => void;
  onEditMember?: (member: FamilyMember) => void;
  onDeleteMember?: (member: FamilyMember) => void;
  onAddChild?: (parentMember: FamilyMember) => void;
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({
  members,
  onSelectMember,
  currentRole,
  onAddNewMember,
  onEditMember,
  onDeleteMember,
  onAddChild
}) => {
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [touchStartDist, setTouchStartDist] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Group members by generation (1 to 5)
  const generations = [1, 2, 3, 4, 5];
  
  const filteredMembers = selectedBranch === 'all' 
    ? members 
    : members.filter(m => m.branch.includes(selectedBranch) || m.generation === 1);

  // Handle Mouse Pan / Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers for Mobile & Tablet (Pan + Pinch Zoom)
  const getTouchDistance = (t1: React.Touch, t2: React.Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
      setTouchStartDist(null);
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      setTouchStartDist(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    } else if (e.touches.length === 2 && touchStartDist) {
      const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
      const diff = currentDist - touchStartDist;
      if (Math.abs(diff) > 5) {
        const factor = diff > 0 ? 0.02 : -0.02;
        setZoom(prev => Math.min(Math.max(0.35, prev + factor), 1.6));
        setTouchStartDist(currentDist);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchStartDist(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(0.35, prev + delta), 1.6));
  };

  const resetView = () => {
    setZoom(0.85);
    setPan({ x: 20, y: 30 });
  };

  const scrollToAncestor = () => {
    setZoom(0.9);
    setPan({ x: 40, y: 30 });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[480px] sm:min-h-[580px] bg-slate-900/5 rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner touch-none">
      {/* Top Floating Control Bar - Responsive Layout */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Branch Filter & Summary */}
        <div className="bg-white/95 backdrop-blur-md p-1.5 sm:p-2 px-2.5 sm:px-3.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-2 pointer-events-auto text-xs">
          <div className="flex items-center gap-1 font-semibold text-slate-700 shrink-0">
            <Filter className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Chi Phái:</span>
          </div>
          <select
            id="filter-tree-branch"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500 max-w-[130px] sm:max-w-none"
          >
            <option value="all">Toàn bộ Các Chi</option>
            <option value="Chi 1">Chi 1 (Chi Trưởng)</option>
            <option value="Chi 2">Chi 2 (Chi Thứ)</option>
            <option value="Chi 3">Chi 3</option>
          </select>

          <span className="text-[11px] text-slate-600 hidden sm:inline pl-1.5 border-l border-slate-200 flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-700" /> {filteredMembers.length}
          </span>
        </div>

        {/* Viewport Zoom & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {(currentRole === 'admin' || currentRole === 'liaison') && (
            <button
              id="add-member-to-tree-btn"
              onClick={onAddNewMember}
              className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl shadow-md transition-colors flex items-center gap-1 sm:gap-1.5 shrink-0"
              title={currentRole === 'admin' ? 'Thêm thành viên mới' : 'Đề xuất thành viên mới'}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">
                {currentRole === 'admin' ? 'Thêm Thành Viên' : 'Đề Xuất Thành Viên'}
              </span>
              <span className="sm:hidden">
                {currentRole === 'admin' ? 'Thêm' : 'Đề xuất'}
              </span>
            </button>
          )}

          {/* Zoom Control Group */}
          <div className="bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-0.5 sm:gap-1">
            <button
              id="tree-zoom-in"
              onClick={() => handleZoom(0.15)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
              title="Phóng to"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] sm:text-xs font-mono font-medium text-slate-600 px-0.5 sm:px-1 min-w-[34px] sm:min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              id="tree-zoom-out"
              onClick={() => handleZoom(-0.15)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
              title="Thu nhỏ"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              id="tree-reset-view"
              onClick={resetView}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors border-l border-slate-200 pl-1.5 sm:pl-2"
              title="Khôi phục góc nhìn"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              id="tree-scroll-ancestor"
              onClick={scrollToAncestor}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-amber-800 transition-colors"
              title="Về cụ Thủy Tổ (Đời 1)"
              aria-label="Go to ancestor"
            >
              <Compass className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Instructions Legend (Collapsible on Mobile) */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-auto">
        {/* Mobile Toggle Button */}
        <div className="sm:hidden mb-1">
          <button
            onClick={() => setIsLegendExpanded(!isLegendExpanded)}
            className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm text-[11px] font-medium text-slate-700 flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5 text-amber-700" />
            <span>Chú thích</span>
            {isLegendExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {/* Legend Box */}
        <div className={`${isLegendExpanded ? 'flex' : 'hidden'} sm:flex bg-white/95 backdrop-blur-md p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-sm text-[11px] sm:text-xs text-slate-600 flex-wrap items-center gap-2 sm:gap-3.5`}>
          <span className="hidden sm:flex items-center gap-1 font-semibold text-slate-700">
            <Info className="w-3.5 h-3.5 text-amber-700" /> Chú thích:
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Nam
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span> Nữ
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Còn sống
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span> Quy tiên
          </span>
          <span className="text-slate-500 italic hidden md:inline">
            (Chạm/kéo để di chuyển • Nhấp vào để xem chi tiết 3 thế hệ)
          </span>
        </div>
      </div>

      {/* Canvas Area with Infinite Pan & Zoom (Mouse + Touch) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden relative bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className="p-8 sm:p-12 min-w-max flex flex-col gap-12 sm:gap-16 relative"
        >
          {generations.map((gen) => {
            const genMembers = filteredMembers.filter(m => m.generation === gen);
            if (genMembers.length === 0) return null;

            const genTitles: Record<number, string> = {
              1: 'Đời I: Cụ Thủy Tổ Khởi Nghiệp',
              2: 'Đời II: Tiền Nhân Khai Sáng Các Chi',
              3: 'Đời III: Thế Hệ Trưởng Tộc & Trưởng Chi',
              4: 'Đời IV: Thế Hệ Đương Thời Phát Triển',
              5: 'Đời V: Thế Hệ Hậu Duệ Trẻ Tương Lai'
            };

            return (
              <div key={gen} className="relative flex flex-col items-center">
                {/* Generation Level Banner Ribbon */}
                <div className="mb-4 sm:mb-6 flex items-center justify-center">
                  <div className="px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-amber-100 text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-md border border-amber-600/40 flex items-center gap-2">
                    <span>{genTitles[gen] || `Đời thứ ${gen}`}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 text-[10px] sm:text-[11px]">
                      {genMembers.length} người
                    </span>
                  </div>
                </div>

                {/* Member Nodes in Generation */}
                <div className="flex flex-wrap items-start justify-center gap-5 sm:gap-8 px-2 sm:px-4">
                  {genMembers.map((member) => {
                    const isMale = member.gender === 'male';
                    const primarySpouse = member.spouses?.[0];
                    const spouseDisplayName = primarySpouse?.fullName || member.spouseName;
                    const hasSpouse = !!spouseDisplayName;
                    const spouseCount = member.spouses?.length || (member.spouseName ? 1 : 0);

                    return (
                      <div
                        key={member.id}
                        id={`member-node-${member.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMember(member);
                        }}
                        className={`group cursor-pointer rounded-2xl transition-all duration-200 p-3.5 sm:p-4 w-64 sm:w-72 bg-white border-2 shadow-xs hover:shadow-xl hover:-translate-y-1 relative ${
                          isMale ? 'border-blue-200 hover:border-blue-500' : 'border-rose-200 hover:border-rose-500'
                        }`}
                      >
                        {/* Status Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            member.isAlive 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {member.isAlive ? '● Còn sống' : '† Đã mất'}
                          </span>

                          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
                            {member.branch}
                          </span>
                        </div>

                        {/* Title if any */}
                        {member.title && (
                          <div className="text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mb-2 inline-block">
                            ★ {member.title}
                          </div>
                        )}

                        {/* Avatar & Name */}
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg font-serif-display shrink-0 shadow-inner ${
                            isMale ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}>
                            {member.fullName.charAt(member.fullName.lastIndexOf(' ') + 1) || 'N'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-slate-900 group-hover:text-amber-900 transition-colors font-serif-display text-sm sm:text-base truncate">
                              {member.fullName}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-500">
                              {member.birthYear} - {member.isAlive ? 'Nay' : (member.deathYear || '?')}
                            </p>
                          </div>
                        </div>

                        {/* Spouse info */}
                        {hasSpouse && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] sm:text-xs text-slate-600 flex items-center justify-between">
                            <span className="text-slate-500 text-[10px] sm:text-[11px] flex items-center gap-1">
                              <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-100" />
                              Vợ/Chồng:
                            </span>
                            <span className="font-medium text-rose-800 truncate max-w-[135px]">
                              {spouseDisplayName}
                              {spouseCount > 1 && ` (+${spouseCount - 1})`}
                            </span>
                          </div>
                        )}

                        {/* Workplace or Address preview */}
                        {(member.workplace || member.currentAddress) && (
                          <div className="mt-1 text-[10px] sm:text-[11px] text-slate-500 truncate">
                            {member.workplace || member.currentAddress}
                          </div>
                        )}

                        {/* Node Card Actions */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px] sm:text-[11px]">
                          <span className="text-amber-800 font-medium group-hover:underline flex items-center gap-0.5">
                            <span>Xem 3 thế hệ</span>
                            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                          </span>

                          {(currentRole === 'admin' || currentRole === 'liaison') && (
                            <div className="flex items-center gap-1">
                              {onAddChild && member.generation < 5 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddChild(member);
                                  }}
                                  className="px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md font-semibold transition-colors flex items-center gap-0.5"
                                  title={`Thêm con cho ${member.fullName}`}
                                >
                                  <UserPlus className="w-3 h-3 text-amber-800" />
                                  <span className="text-[10px]">+ Con</span>
                                </button>
                              )}

                              {onEditMember && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditMember(member);
                                  }}
                                  className="p-1 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-md transition-colors"
                                  title={currentRole === 'admin' ? 'Chỉnh sửa thông tin' : 'Đề xuất sửa'}
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}

                              {onDeleteMember && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteMember(member);
                                  }}
                                  className="p-1 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
                                  title={currentRole === 'admin' ? 'Xoá khỏi gia phả' : 'Đề xuất xoá'}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sub-divider line between generations */}
                {gen < 5 && (
                  <div className="w-full max-w-4xl h-6 sm:h-8 flex flex-col items-center justify-center my-3 sm:my-4">
                    <div className="w-0.5 h-full bg-slate-300"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
