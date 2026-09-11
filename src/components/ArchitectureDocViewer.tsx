import React, { useState } from 'react';
import { 
  TECH_STACK_RECOMMENDATIONS, 
  ERD_SCHEMAS, 
  RBAC_MATRIX_DATA, 
  WORKFLOW_LIAISON_TO_ADMIN, 
  WORKFLOW_QR_CONTRIBUTION, 
  REST_API_ENDPOINTS 
} from '../data/architectureDocs';
import { 
  Layers, 
  Database, 
  ShieldCheck, 
  GitBranch, 
  Send, 
  Copy, 
  Check, 
  FileCode, 
  BookOpen, 
  ChevronDown, 
  ChevronRight,
  Server,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const ArchitectureDocViewer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'tech' | 'erd' | 'rbac' | 'workflows' | 'api'>('tech');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedTable, setExpandedTable] = useState<string>('family_members');
  const [selectedApiMethod, setSelectedApiMethod] = useState<string>('ALL');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredApis = selectedApiMethod === 'ALL'
    ? REST_API_ENDPOINTS
    : REST_API_ENDPOINTS.filter(api => api.method === selectedApiMethod);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Title & Document Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-3 py-1 rounded-full">
              Software Architecture & Product Specifications
            </span>
            <span className="text-xs text-indigo-300 font-mono">Phiên bản 2.4.0 • Enterprise Ready</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-display leading-tight text-white">
            Tài Liệu Thiết Kế Hệ Thống Toàn Diện: "Gia Phả Họ Tộc Online"
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed pt-1">
            Được lập bởi <strong>Chuyên gia Kiến trúc Phần mềm (Software Architect)</strong> & <strong>Trưởng phòng Sản phẩm (Product Owner)</strong>. Đáp ứng đầy đủ 5 yêu cầu kỹ thuật: Tech Stack, ERD/Database Schema, RBAC Matrix, Workflows và RESTful APIs.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mt-6 pt-4 border-t border-indigo-800/60 relative z-10">
          <button
            onClick={() => setActiveSection('tech')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === 'tech' ? 'bg-white text-indigo-950 shadow-xs' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            1. Đề Xuất Tech Stack
          </button>

          <button
            onClick={() => setActiveSection('erd')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === 'erd' ? 'bg-white text-indigo-950 shadow-xs' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            2. ERD & Schema Phân Cấp
          </button>

          <button
            onClick={() => setActiveSection('rbac')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === 'rbac' ? 'bg-white text-indigo-950 shadow-xs' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            3. Ma Trận Phân Quyền (RBAC)
          </button>

          <button
            onClick={() => setActiveSection('workflows')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === 'workflows' ? 'bg-white text-indigo-950 shadow-xs' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            4. Thiết Kế Luồng Nghiệp Vụ
          </button>

          <button
            onClick={() => setActiveSection('api')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === 'api' ? 'bg-white text-indigo-950 shadow-xs' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            5. RESTful API Endpoints
          </button>
        </div>
      </div>

      {/* SECTION 1: TECH STACK */}
      {activeSection === 'tech' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-serif-display flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              1. Bảng Đề Xuất Công Nghệ Tối Ưu & Biện Luận Kỹ Thuật
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dưới góc độ Kiến trúc sư Phần mềm, việc xây dựng hệ thống Gia phả đa thế hệ đòi hỏi: Khả năng dựng đồ thị cây lớn mượt mà (60fps), bảo mật RBAC nhiều cấp, tính toán phả hệ phân nhánh không gây tràn stack đệ quy và khả năng lưu trữ ảnh chụp sắc phong, văn tự cổ vĩnh viễn.
            </p>

            <div className="space-y-4 pt-2">
              {TECH_STACK_RECOMMENDATIONS.map((item, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 bg-indigo-100/80 px-2.5 py-1 rounded-md">
                      {item.layer}
                    </span>
                    <span className="text-xs text-slate-500">
                      Giải pháp thay thế cân nhắc: <em>{item.alternatives.join(', ')}</em>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900">
                      Khuyến nghị hàng đầu: <span className="text-emerald-700 font-mono">{item.recommended}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                      {item.rationale}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Tính năng kỹ thuật nổi bật:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                      {item.keyFeatures.map((kf, kfIdx) => (
                        <li key={kfIdx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{kf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ERD & DATABASE SCHEMA */}
      {activeSection === 'erd' && (
        <div className="space-y-6">
          {/* Architectural Discussion: Adjacency List + Closure Table vs Nested Set */}
          <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-5 space-y-2 text-xs sm:text-sm text-amber-950">
            <h4 className="font-bold text-base font-serif-display text-amber-950 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              Biện luận Cấu Trúc Cây Gia Phả: Tại Sao Chọn Closure Table Thay Vì Nested Set Model?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200 space-y-1">
                <strong className="text-rose-900 block font-semibold">Nhược điểm chí tử của Nested Set Model trong Gia phả:</strong>
                <p className="text-xs text-slate-700">
                  Nested Set sử dụng chỉ mục <code>lft</code> và <code>rgt</code>. Mỗi khi Liên lạc viên thêm một người con vào Đời thứ 3, hệ thống phải cập nhật (UPDATE) lại toàn bộ chỉ mục <code>lft, rgt</code> của hàng ngàn node phía sau trong cây! Điều này gây <strong>Table Lock</strong> và làm chết hệ thống khi dữ liệu lớn.
                </p>
              </div>

              <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200 space-y-1">
                <strong className="text-emerald-900 block font-semibold">Ưu thế vượt trội của Closure Table + Adjacency List:</strong>
                <p className="text-xs text-slate-700">
                  Lưu trực tiếp <code>father_id, mother_id</code> ở bảng chính. Bảng phụ <code>member_closure(ancestor_id, descendant_id, depth)</code> lưu toàn bộ cặp quan hệ. Khi thêm thành viên mới, chỉ cần INSERT thêm các quan hệ với tổ tiên trực tiếp, <strong>không bao giờ cần sửa các node cũ</strong>. Truy vấn 3 thế hệ hay 10 thế hệ chỉ tốn 1 truy vấn SQL có chi phí O(1).
                </p>
              </div>
            </div>
          </div>

          {/* Table Schemas Inspector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-serif-display">
                Chi Tiết Cấu Trúc Bảng Dữ Liệu (PostgreSQL Schemas & Data DDL)
              </h3>
              <span className="text-xs text-slate-500">
                Gồm {ERD_SCHEMAS.length} thực thể cốt lõi
              </span>
            </div>

            <div className="space-y-4">
              {ERD_SCHEMAS.map((table) => {
                const isExpanded = expandedTable === table.tableName;

                return (
                  <div key={table.tableName} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                      onClick={() => setExpandedTable(isExpanded ? '' : table.tableName)}
                      className="w-full p-4 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Database className="w-4 h-4 text-indigo-700" />
                        <div>
                          <span className="font-mono font-bold text-sm text-slate-900">{table.tableName}</span>
                          <span className="text-xs text-slate-500 block">{table.description}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">({table.columns.length} columns)</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-600" /> : <ChevronRight className="w-4 h-4 text-slate-600" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                <th className="py-2 px-2.5 font-bold">Tên Cột (Column)</th>
                                <th className="py-2 px-2.5 font-bold">Kiểu Dữ Liệu (Type)</th>
                                <th className="py-2 px-2.5 font-bold">Ràng Buộc (Constraints)</th>
                                <th className="py-2 px-2.5 font-bold">Mô Tả Nghiệp Vụ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono">
                              {table.columns.map((col) => (
                                <tr key={col.name} className="hover:bg-slate-50/50">
                                  <td className="py-2 px-2.5 font-bold text-slate-900">{col.name}</td>
                                  <td className="py-2 px-2.5 text-indigo-700">{col.type}</td>
                                  <td className="py-2 px-2.5 text-amber-800 text-[11px]">{col.constraints}</td>
                                  <td className="py-2 px-2.5 font-sans text-slate-600">{col.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Indices */}
                        <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] space-y-1">
                          <span className="text-slate-400 font-bold block">// Indexes & Performance Optimization:</span>
                          {table.indices.map((idx, i) => (
                            <div key={i} className="text-emerald-400">{idx}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: RBAC MATRIX */}
      {activeSection === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900 font-serif-display">
              3. Ma Trận Phân Quyền Chi Tiết (Role-Based Access Control - RBAC Matrix)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Phân định thẩm quyền nghiêm ngặt giữa 3 vai trò quản trị: Quản trị viên (Admin), Liên lạc viên (Liaison) và Phóng viên (Reporter) cùng thành viên họ tộc.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="py-3 px-3">Phân Hệ (Module)</th>
                  <th className="py-3 px-3">Hành Động / Chức Năng (Action)</th>
                  <th className="py-3 px-3 text-center bg-amber-50/50">Quản Trị Viên (Admin)</th>
                  <th className="py-3 px-3 text-center bg-blue-50/50">Liên Lạc Viên (Liaison)</th>
                  <th className="py-3 px-3 text-center bg-emerald-50/50">Phóng Viên (Reporter)</th>
                  <th className="py-3 px-3 text-center">Con Cháu / Khách</th>
                  <th className="py-3 px-3">Ghi Chú Nghiệp Vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RBAC_MATRIX_DATA.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {item.module}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">
                      {item.action}
                    </td>
                    <td className="py-2.5 px-3 text-center bg-amber-50/30">
                      {item.admin ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center bg-blue-50/30">
                      {item.liaison ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center bg-emerald-50/30">
                      {item.reporter ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.member ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: WORKFLOWS */}
      {activeSection === 'workflows' && (
        <div className="space-y-6">
          {/* Workflow 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Quy Trình Nghiệp Vụ 01
              </span>
              <h3 className="text-lg font-bold text-slate-900 font-serif-display mt-1">
                "Liên Lạc Viên Nhập Liệu ➔ Admin Duyệt ➔ Đẩy Lên Cây Gia Phả"
              </h3>
              <p className="text-xs text-slate-500">
                Cơ chế bảo toàn tính toàn vẹn dữ liệu gốc, ngăn ngừa nguy cơ sai lệch thế hệ và tranh chấp họ tộc
              </p>
            </div>

            <div className="space-y-3">
              {WORKFLOW_LIAISON_TO_ADMIN.map((step) => (
                <div key={step.stepNumber} className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {step.stepNumber}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">{step.actor}</span>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {step.stateTransition}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700">{step.action}</p>
                    <p className="text-xs text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100 mt-1">
                      ➔ Hệ thống: {step.systemResponse}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Quy Trình Nghiệp Vụ 02
              </span>
              <h3 className="text-lg font-bold text-slate-900 font-serif-display mt-1">
                "Quét Mã QR ➔ Gửi Xác Nhận Đóng Góp Quỹ Họ Tộc"
              </h3>
              <p className="text-xs text-slate-500">
                Quy trình thanh toán không tiền mặt chuẩn VietQR Napas kết hợp đối soát chứng từ và vinh danh công đức
              </p>
            </div>

            <div className="space-y-3">
              {WORKFLOW_QR_CONTRIBUTION.map((step) => (
                <div key={step.stepNumber} className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {step.stepNumber}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">{step.actor}</span>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {step.stateTransition}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700">{step.action}</p>
                    <p className="text-xs text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100 mt-1">
                      ➔ Hệ thống: {step.systemResponse}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: RESTFUL API ENDPOINTS */}
      {activeSection === 'api' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif-display">
                5. Thiết Kế RESTful API Endpoints Chuẩn OpenAPI 3.0
              </h3>
              <p className="text-xs text-slate-500">
                Toàn bộ endpoints cho Frontend, Mobile Apps và các dịch vụ tích hợp ngân hàng / VietQR
              </p>
            </div>

            {/* Method filter */}
            <div className="flex items-center gap-1.5">
              {['ALL', 'GET', 'POST', 'PATCH'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedApiMethod(m)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                    selectedApiMethod === m
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredApis.map((api, idx) => {
              const methodColor = {
                GET: 'bg-blue-100 text-blue-800 border-blue-200',
                POST: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                PUT: 'bg-amber-100 text-amber-800 border-amber-200',
                PATCH: 'bg-purple-100 text-purple-800 border-purple-200',
                DELETE: 'bg-rose-100 text-rose-800 border-rose-200'
              }[api.method];

              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden p-4 space-y-3 bg-slate-50/40">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-md border ${methodColor}`}>
                        {api.method}
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                        {api.path}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        Quyền yêu cầu: <strong className="text-slate-800 font-mono">{api.rolesAllowed.join(', ')}</strong>
                      </span>
                      {api.authRequired && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Auth Bearer
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">
                    {api.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {api.requestBody && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span>Request Body (JSON):</span>
                          <button
                            onClick={() => copyToClipboard(api.requestBody || '', `req_${idx}`)}
                            className="hover:text-slate-800 flex items-center gap-1"
                          >
                            {copiedIndex === `req_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <pre className="bg-slate-900 text-emerald-300 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-40">
                          {api.requestBody}
                        </pre>
                      </div>
                    )}

                    <div className="space-y-1 md:col-span-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Response Sample (200 OK):</span>
                        <button
                          onClick={() => copyToClipboard(api.responseSample, `res_${idx}`)}
                          className="hover:text-slate-800 flex items-center gap-1"
                        >
                          {copiedIndex === `res_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <pre className="bg-slate-900 text-indigo-200 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-40">
                        {api.responseSample}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
