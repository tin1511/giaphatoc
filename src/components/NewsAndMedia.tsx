import React, { useState } from 'react';
import { NewsArticle, BoardMember, UserRole } from '../types';
import { 
  Newspaper, 
  Calendar, 
  Image as ImageIcon, 
  Users, 
  Mail, 
  PlusCircle, 
  Eye, 
  Tag, 
  Send, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle,
  Video
} from 'lucide-react';

interface NewsAndMediaProps {
  articles: NewsArticle[];
  boardMembers: BoardMember[];
  currentRole: UserRole;
  onAddArticle: (article: Partial<NewsArticle>) => void;
  onViewArticle?: (article: NewsArticle) => void;
}

export const NewsAndMedia: React.FC<NewsAndMediaProps> = ({
  articles,
  boardMembers,
  currentRole,
  onAddArticle,
  onViewArticle
}) => {
  const [activeSection, setActiveSection] = useState<'news' | 'activity' | 'gallery' | 'board' | 'contact'>('news');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);

  const handleSelectArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    if (onViewArticle) {
      onViewArticle(article);
    }
  };

  // New post form state
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<'news' | 'activity' | 'history'>('news');
  const [postSummary, setPostSummary] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCoverUrl, setPostCoverUrl] = useState('');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    onAddArticle({
      title: postTitle,
      category: postCategory,
      summary: postSummary || postTitle,
      content: postContent,
      coverImageUrl: postCoverUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
      status: currentRole === 'reporter' ? 'pending_review' : 'published',
      views: 1,
      authorRole: currentRole,
      authorName: currentRole === 'reporter' ? 'Phóng viên họ tộc' : 'Ban Điều Hành',
      publishedAt: new Date().toISOString()
    });

    setIsWriteModalOpen(false);
    setPostTitle('');
    setPostSummary('');
    setPostContent('');
    setPostCoverUrl('');
  };

  // Sample media gallery items
  const galleryItems = [
    { title: 'Lễ dâng hương Giỗ Tổ mùa xuân 2025', type: 'image', url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80', date: 'Tháng 3, 2025' },
    { title: 'Lễ tuyên dương Khuyến học Khuyến tài con em họ tộc', type: 'image', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80', date: 'Tháng 8, 2025' },
    { title: 'Tư liệu cổ: Sắc phong và văn bia Nhà Thờ Tổ', type: 'image', url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=80', date: 'Thư viện cổ' },
    { title: 'Toàn cảnh khuôn viên Từ đường Cụ Khởi Tổ', type: 'image', url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&auto=format&fit=crop&q=80', date: 'Năm 2024' },
    { title: 'Gặp mặt đại diện Chi phái các miền Nam - Trung - Bắc', type: 'image', url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80', date: 'Đại hội Họ tộc' },
    { title: 'Phim tư liệu: 130 năm tiếp nối ngọn lửa hiếu học', type: 'video', url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80', date: 'Thời lượng 18 phút' }
  ];

  const filteredArticles = articles.filter(a => {
    if (activeSection === 'news') return a.category === 'news' || a.category === 'history';
    if (activeSection === 'activity') return a.category === 'activity';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Sub-Header & Menu Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            id="media-subtab-news"
            onClick={() => setActiveSection('news')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeSection === 'news' ? 'bg-amber-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            Tin Tức Dòng Họ
          </button>

          <button
            id="media-subtab-activity"
            onClick={() => setActiveSection('activity')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeSection === 'activity' ? 'bg-amber-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Hoạt Động & Sự Kiện
          </button>

          <button
            id="media-subtab-gallery"
            onClick={() => setActiveSection('gallery')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeSection === 'gallery' ? 'bg-amber-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Thư Viện Ảnh / Video
          </button>

          <button
            id="media-subtab-board"
            onClick={() => setActiveSection('board')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeSection === 'board' ? 'bg-amber-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Ban Điều Hành
          </button>

          <button
            id="media-subtab-contact"
            onClick={() => setActiveSection('contact')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeSection === 'contact' ? 'bg-amber-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mail className="w-4 h-4" />
            Liên Hệ & Hòm Thư
          </button>
        </div>

        {/* Action button if role allows posting */}
        {(currentRole === 'reporter' || currentRole === 'liaison' || currentRole === 'admin') && (
          <button
            id="create-article-btn"
            onClick={() => setIsWriteModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Viết Bài Mới {currentRole === 'reporter' ? '(Phóng Viên)' : ''}</span>
          </button>
        )}
      </div>

      {/* 1. News & Activities Grid */}
      {(activeSection === 'news' || activeSection === 'activity') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div onClick={() => handleSelectArticle(article)} className="cursor-pointer">
                {article.coverImageUrl && (
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img
                      src={article.coverImageUrl}
                      alt={article.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                      {article.category === 'activity' ? 'Sự Kiện' : (article.category === 'history' ? 'Lịch Sử' : 'Tin Tức')}
                    </span>
                  </div>
                )}

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-700" />
                      {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-700" />
                      {article.views} lượt xem
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif-display group-hover:text-amber-900 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 truncate max-w-[160px]">
                  Tác giả: <strong className="text-slate-700">{article.authorName}</strong>
                </span>
                <button
                  onClick={() => handleSelectArticle(article)}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                >
                  Đọc tiếp →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Media Gallery */}
      {activeSection === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
            <strong>Thư viện hình ảnh & video dòng họ:</strong> Lưu trữ ký ức, không gian Từ đường, lễ tế, các bản scan sắc phong tiền triều và hoạt động khuyến học qua các thời kỳ.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {galleryItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs group">
                <div className="aspect-4/3 w-full overflow-hidden relative bg-slate-900">
                  <img
                    src={item.url}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg">
                        <Video className="w-6 h-6" />
                      </div>
                    </div>
                  )}
                  <span className="absolute bottom-3 right-3 text-[11px] font-medium bg-black/70 text-white px-2 py-0.5 rounded-md">
                    {item.date}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm text-slate-900 font-serif-display">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Board Members (Ban Điều Hành) */}
      {activeSection === 'board' && (
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h3 className="text-xl font-bold text-slate-900 font-serif-display">
              Hội Đồng Dòng Họ & Ban Điều Hành Đương Nhiệm
            </h3>
            <p className="text-xs text-slate-500">
              Được tín nhiệm bầu tại Đại hội Dòng họ nhiệm kỳ 2023 - 2028, chịu trách nhiệm phụng sự Tiên Tổ và kết nối con cháu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {boardMembers.map((bm) => (
              <div key={bm.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl mx-auto bg-amber-100/80 border-2 border-amber-300/80 flex items-center justify-center text-amber-900 font-serif-display font-bold text-xl shadow-xs">
                  {bm.name.split(' ').pop()?.charAt(0) || 'N'}
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900 font-serif-display">{bm.name}</h4>
                  <span className="text-xs font-semibold text-amber-800 block mt-0.5">{bm.roleTitle}</span>
                  <span className="text-[11px] text-slate-500 block">Đời {bm.generation} • {bm.branch}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1 text-left">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span>{bm.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span>{bm.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span>{bm.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Contact & Suggestions */}
      {activeSection === 'contact' && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Liên Hệ Trực Tiếp
            </span>
            <h3 className="text-xl font-bold text-slate-900 font-serif-display">
              Ban Thư Ký & Hòm Thư Đóng Góp Ý Kiến Dòng Họ
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mọi ý kiến đóng góp về nội dung gia phả, kết nối chi phái phân tán, đính chính thông tin hoặc đăng ký thành viên mới xin gửi về Ban Quản Trị.
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span><strong>Địa chỉ Từ đường:</strong> Làng Cẩm Giàng, Xã Phú Minh, Huyện Cẩm Giàng, Tỉnh Hải Dương</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-800 shrink-0" />
                <span><strong>Đường dây nóng:</strong> 0912 345 678 (Ông Nguyễn Văn Minh - Trưởng tộc)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-800 shrink-0" />
                <span><strong>Email chính thức:</strong> banquantri@giaphanguyenvan.vn</span>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn! Thông điệp đã được gửi tới Ban Thư ký họ tộc.'); }} className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Gửi Tin Nhắn / Phản Hồi</h4>
            <input
              type="text"
              required
              placeholder="Họ và tên của bạn..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="text"
              placeholder="Thuộc chi nhánh / Con cháu đời thứ mấy..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="tel"
              required
              placeholder="Số điện thoại / Zalo để liên hệ lại..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <textarea
              required
              rows={3}
              placeholder="Nội dung ý kiến đóng góp, bổ sung gia phả..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            ></textarea>
            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Gửi Tới Ban Trị Sự
            </button>
          </form>
        </div>
      )}

      {/* Article Detail Reading Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full">
                {selectedArticle.category === 'activity' ? 'Hoạt Động' : (selectedArticle.category === 'history' ? 'Lịch Sử' : 'Tin Tức')}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Đóng ✕
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-display leading-tight">
              {selectedArticle.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Tác giả: <strong>{selectedArticle.authorName}</strong></span>
              <span>•</span>
              <span>Ngày: {new Date(selectedArticle.publishedAt).toLocaleDateString('vi-VN')}</span>
            </div>

            {selectedArticle.coverImageUrl && (
              <img
                src={selectedArticle.coverImageUrl}
                alt={selectedArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-64 object-cover rounded-xl"
              />
            )}

            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3 font-sans">
              {selectedArticle.content}
            </div>

            <div className="pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write New Article Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900 font-serif-display">
                Tạo Bài Viết Mới (Truyền Thông Họ Tộc)
              </h3>
              <button onClick={() => setIsWriteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tiêu đề bài viết:</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Ví dụ: Kế hoạch tổ chức Lễ dâng hương mùa thu..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Chuyên mục:</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="news">Tin tức dòng họ</option>
                    <option value="activity">Hoạt động & Sự kiện</option>
                    <option value="history">Lịch sử & Nguồn cội</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Quyền xuất bản:</label>
                  <div className="px-3 py-2 text-xs bg-slate-100 text-slate-700 rounded-xl font-medium">
                    {currentRole === 'reporter' ? 'Chờ Admin duyệt (Phóng viên)' : 'Xuất bản trực tiếp (Admin/Liaison)'}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Ảnh bìa (URL):</label>
                <input
                  type="url"
                  value={postCoverUrl}
                  onChange={(e) => setPostCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tóm tắt ngắn:</label>
                <textarea
                  rows={2}
                  value={postSummary}
                  onChange={(e) => setPostSummary(e.target.value)}
                  placeholder="Đoạn văn ngắn tóm lược thông điệp..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nội dung chi tiết (Markdown/Văn bản):</label>
                <textarea
                  required
                  rows={6}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Nhập toàn văn bài viết..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs"
                >
                  {currentRole === 'reporter' ? 'Gửi Duyệt Bài Viết' : 'Xuất Bản Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
