export interface TechStackItem {
  layer: string;
  recommended: string;
  alternatives: string[];
  rationale: string;
  keyFeatures: string[];
}

export interface ERDTable {
  tableName: string;
  description: string;
  columns: {
    name: string;
    type: string;
    constraints: string;
    description: string;
  }[];
  indices: string[];
}

export interface RBACPermission {
  module: string;
  action: string;
  admin: boolean;
  liaison: boolean;
  reporter: boolean;
  member: boolean;
  notes: string;
}

export interface WorkflowStep {
  stepNumber: number;
  actor: string;
  action: string;
  systemResponse: string;
  stateTransition: string;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  authRequired: boolean;
  rolesAllowed: string[];
  requestBody?: string;
  responseSample: string;
}

export const TECH_STACK_RECOMMENDATIONS: TechStackItem[] = [
  {
    layer: 'Frontend Family Tree Visualizer',
    recommended: 'React Flow (@xyflow/react) kết hợp D3-Hierarchy / D3-Flextree',
    alternatives: ['GoJS', 'D3.js thuần SVG/Canvas', 'Cytoscape.js', 'ECharts Tree'],
    rationale: 'GoJS yêu cầu phí bản quyền thương mại đắt đỏ (hàng ngàn USD/năm). D3.js thuần tùy biến cao nhưng tốn nhiều công sức dựng node tương tác React phức tạp. React Flow cung cấp bộ điều khiển pan/zoom 60fps mượt mà trên mobile/desktop, hỗ trợ Custom React Nodes (cho phép nhúng avatar, badge, nút bấm trực tiếp vào node), kết hợp thuật toán tính tọa độ phân cấp của D3-Flextree (Reingold-Tilford cải tiến) mang lại bố cục hoàn hảo cho gia phả truyền thống Á Đông.',
    keyFeatures: [
      'Viewport Zoom & Pan vô hạn với MiniMap thu nhỏ',
      'Custom HTML/React Nodes (hiển thị ảnh, chức sắc, ngày sinh/mất)',
      'Hỗ trợ xuất ảnh PNG/SVG/PDF chất lượng cao để in ấn phả đồ',
      'Virtualization tự động tối ưu hóa khi cây gia phả vượt quá 2.000 thành viên'
    ]
  },
  {
    layer: 'Backend Framework',
    recommended: 'NestJS (Node.js / TypeScript) hoặc Go (Golang - Gin/Fiber)',
    alternatives: ['Express.js', 'Spring Boot', 'Django / FastAPI'],
    rationale: 'NestJS kế thừa kiến trúc Module, Dependency Injection (DI) chuẩn mực của Angular/Spring, tích hợp sẵn Swagger/OpenAPI, TypeORM/Prisma, class-validator và Guards RBAC mạnh mẽ. TypeScript đồng bộ types từ Front-end tới Back-end giúp giảm 80% lỗi sai lệch dữ liệu.',
    keyFeatures: [
      'Guard RBAC phân quyền bảo mật chặt chẽ ở cấp độ endpoint & method',
      'Event-Driven Architecture (Emit event khi có đề xuất mới để gửi email/Zalo ZNS)',
      'Tích hợp Swagger tự động sinh tài liệu API chuẩn xác'
    ]
  },
  {
    layer: 'Cơ sở dữ liệu (Database)',
    recommended: 'PostgreSQL 16+ kết hợp Extension ltree & pg_trgm',
    alternatives: ['MySQL 8.0', 'MongoDB', 'Neo4j (Graph DB)'],
    rationale: 'PostgreSQL là RDBMS mạnh nhất cho dữ liệu quan hệ gia phả. Mô hình kết hợp "Adjacency List + Closure Table" hoặc Extension "ltree" giúp truy vấn toàn bộ tổ tiên (Ancestors) hoặc hậu duệ (Descendants) n-thế hệ chỉ với 1 câu lệnh SQL duy nhất O(1) hoặc O(log N), thay vì đệ quy nhiều lần làm nghẽn server. Đồng thời pg_trgm xử lý tìm kiếm không dấu tiếng Việt cực nhanh.',
    keyFeatures: [
      'Closure Table tăng tốc độ truy vấn cây phả hệ 300% so với Recursive CTE thông thường',
      'Extension pg_trgm hỗ trợ tìm kiếm mờ (fuzzy search) tên người Việt không dấu',
      'Giao dịch ACID bảo đảm an toàn tuyệt đối cho số liệu thu chi Quỹ họ tộc'
    ]
  },
  {
    layer: 'Lưu trữ tệp & Ảnh (Object Storage)',
    recommended: 'Cloudflare R2 / AWS S3 / MinIO (Self-hosted)',
    alternatives: ['Google Cloud Storage', 'Lưu trữ cục bộ Local Disk'],
    rationale: 'Cloudflare R2 miễn phí cước băng thông tải ra (Zero Egress Fees), tương thích S3 API. Cơ chế Presigned URL cho phép ứng dụng upload ảnh trực tiếp từ trình duyệt người dùng lên Storage, không gây nghẽn băng thông của máy chủ Backend.',
    keyFeatures: [
      'Presigned Upload URL bảo mật tệp hình ảnh minh chứng chuyển khoản',
      'Tự động sinh thumbnail ảnh đại diện thành viên đa kích thước qua CDN Image Resizing',
      'Lưu trữ an toàn các bản scan gia phả cổ, sắc phong, văn tự chữ Hán - Nôm'
    ]
  },
  {
    layer: 'Caching & Background Jobs',
    recommended: 'Redis 7 + BullMQ',
    alternatives: ['Memcached', 'RabbitMQ'],
    rationale: 'Cache cây phả hệ dạng JSON đã được tính toán sẵn tọa độ. Xử lý hàng đợi hàng loạt (xử lý duyệt nhiều thành viên, gửi thông báo đẩy đến con cháu họ tộc).',
    keyFeatures: [
      'Cache invalidate thông minh khi có cập nhật thành viên được duyệt',
      'Hàng đợi BullMQ gửi thông báo qua Email/Zalo khi có đóng góp quỹ mới'
    ]
  }
];

export const ERD_SCHEMAS: ERDTable[] = [
  {
    tableName: 'users',
    description: 'Bảng quản lý tài khoản người dùng và xác thực hệ thống',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Định danh duy nhất của tài khoản' },
      { name: 'email', type: 'VARCHAR(255)', constraints: 'UNIQUE, NULLABLE', description: 'Địa chỉ thư điện tử' },
      { name: 'phone', type: 'VARCHAR(20)', constraints: 'UNIQUE, NOT NULL', description: 'Số điện thoại đăng nhập & nhận OTP' },
      { name: 'password_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Mật khẩu băm Argon2id / Bcrypt' },
      { name: 'role', type: 'VARCHAR(50)', constraints: 'NOT NULL, DEFAULT "member"', description: 'Vai trò: admin | liaison | reporter | member' },
      { name: 'member_id', type: 'UUID', constraints: 'FK -> family_members.id, NULLABLE', description: 'Liên kết tới hồ sơ cá nhân trong cây gia phả' },
      { name: 'is_active', type: 'BOOLEAN', constraints: 'DEFAULT true', description: 'Trạng thái hoạt động của tài khoản' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Thời điểm tạo tài khoản' }
    ],
    indices: ['CREATE INDEX idx_users_phone ON users(phone);', 'CREATE INDEX idx_users_role ON users(role);']
  },
  {
    tableName: 'family_members',
    description: 'Bảng lưu trữ thông tin thực thể từng thành viên trong gia tộc (Adjacency List cốt lõi)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Định danh thành viên' },
      { name: 'full_name', type: 'VARCHAR(150)', constraints: 'NOT NULL', description: 'Họ và tên đầy đủ' },
      { name: 'gender', type: 'VARCHAR(10)', constraints: 'NOT NULL ("male"|"female")', description: 'Giới tính' },
      { name: 'generation', type: 'INTEGER', constraints: 'NOT NULL', description: 'Đời thứ mấy trong họ tộc (1, 2, 3...)' },
      { name: 'branch_id', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Thuộc chi họ nào (Chi 1, Chi 2...)' },
      { name: 'birth_date', type: 'DATE', constraints: 'NULLABLE', description: 'Ngày tháng năm sinh dương lịch' },
      { name: 'birth_year', type: 'INTEGER', constraints: 'NOT NULL', description: 'Năm sinh (bắt buộc khi chưa rõ ngày tháng)' },
      { name: 'is_alive', type: 'BOOLEAN', constraints: 'DEFAULT true', description: 'Còn sống hay đã quy tiên' },
      { name: 'death_date', type: 'DATE', constraints: 'NULLABLE', description: 'Ngày mất dương lịch (nếu có)' },
      { name: 'lunar_death_date', type: 'VARCHAR(100)', constraints: 'NULLABLE', description: 'Ngày giỗ theo âm lịch (ví dụ: 12 tháng 8 AL)' },
      { name: 'burial_place', type: 'TEXT', constraints: 'NULLABLE', description: 'Mộ phần / Nơi an táng' },
      { name: 'father_id', type: 'UUID', constraints: 'FK -> family_members.id, NULLABLE', description: 'ID người Cha trực hệ' },
      { name: 'mother_id', type: 'UUID', constraints: 'FK -> family_members.id, NULLABLE', description: 'ID người Mẹ trực hệ' },
      { name: 'spouse_id', type: 'UUID', constraints: 'FK -> family_members.id, NULLABLE', description: 'ID Vợ/Chồng (nếu có)' },
      { name: 'spouse_name', type: 'VARCHAR(150)', constraints: 'NULLABLE', description: 'Tên dâu/rể nếu không tạo node độc lập' },
      { name: 'phone_number', type: 'VARCHAR(25)', constraints: 'NULLABLE', description: 'Số điện thoại liên lạc' },
      { name: 'email', type: 'VARCHAR(100)', constraints: 'NULLABLE', description: 'Email' },
      { name: 'current_address', type: 'TEXT', constraints: 'NULLABLE', description: 'Địa chỉ cư trú hiện nay' },
      { name: 'workplace', type: 'TEXT', constraints: 'NULLABLE', description: 'Nơi công tác, đơn vị, nghề nghiệp' },
      { name: 'bio', type: 'TEXT', constraints: 'NULLABLE', description: 'Tiểu sử, công trạng, chức tước' },
      { name: 'avatar_url', type: 'VARCHAR(500)', constraints: 'NULLABLE', description: 'Đường dẫn ảnh chân dung' },
      { name: 'status', type: 'VARCHAR(30)', constraints: 'DEFAULT "active"', description: 'Trạng thái: active | pending_approval | draft' }
    ],
    indices: [
      'CREATE INDEX idx_members_father_id ON family_members(father_id);',
      'CREATE INDEX idx_members_generation ON family_members(generation);',
      'CREATE INDEX idx_members_branch ON family_members(branch_id);',
      'CREATE INDEX idx_members_name_trgm ON family_members USING gin (full_name gin_trgm_ops);'
    ]
  },
  {
    tableName: 'member_closure',
    description: 'Bảng phụ trợ Closure Table giúp truy vấn toàn bộ tổ tiên và con cháu O(1)',
    columns: [
      { name: 'ancestor_id', type: 'UUID', constraints: 'PK, FK -> family_members.id', description: 'ID tiền nhân (Tổ tiên)' },
      { name: 'descendant_id', type: 'UUID', constraints: 'PK, FK -> family_members.id', description: 'ID hậu duệ (Con/Cháu)' },
      { name: 'depth', type: 'INTEGER', constraints: 'NOT NULL', description: 'Khoảng cách thế hệ (0 = chính mình, 1 = cha/con, 2 = ông/cháu...)' }
    ],
    indices: [
      'CREATE INDEX idx_closure_ancestor ON member_closure(ancestor_id);',
      'CREATE INDEX idx_closure_descendant ON member_closure(descendant_id);'
    ]
  },
  {
    tableName: 'change_requests',
    description: 'Hàng đợi phê duyệt thay đổi dữ liệu gia phả của Liên lạc viên (Liaison)',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Mã đề xuất' },
      { name: 'type', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'create_member | update_member | delete_member' },
      { name: 'target_member_id', type: 'UUID', constraints: 'FK -> family_members.id, NULLABLE', description: 'Thành viên bị tác động (nếu là update/delete)' },
      { name: 'proposed_data', type: 'JSONB', constraints: 'NOT NULL', description: 'Toàn bộ dữ liệu đề xuất dạng JSON' },
      { name: 'current_snapshot', type: 'JSONB', constraints: 'NULLABLE', description: 'Dữ liệu trước khi sửa để so sánh (Diff view)' },
      { name: 'proposed_by_user_id', type: 'UUID', constraints: 'FK -> users.id, NOT NULL', description: 'Người đề xuất (Liên lạc viên)' },
      { name: 'status', type: 'VARCHAR(30)', constraints: 'DEFAULT "pending"', description: 'pending | approved | rejected' },
      { name: 'review_comment', type: 'TEXT', constraints: 'NULLABLE', description: 'Ý kiến phê duyệt hoặc lý do từ chối của Admin' },
      { name: 'reviewed_by_user_id', type: 'UUID', constraints: 'FK -> users.id, NULLABLE', description: 'Admin duyệt' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Ngày gửi đề xuất' },
      { name: 'reviewed_at', type: 'TIMESTAMPTZ', constraints: 'NULLABLE', description: 'Ngày xét duyệt' }
    ],
    indices: ['CREATE INDEX idx_requests_status ON change_requests(status);']
  },
  {
    tableName: 'contributions',
    description: 'Sổ ghi nhận đóng góp công đức và tài chính Quỹ họ tộc',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Mã phiếu đóng góp' },
      { name: 'donor_name', type: 'VARCHAR(150)', constraints: 'NOT NULL', description: 'Tên cá nhân / hộ gia đình công đức' },
      { name: 'donor_member_id', type: 'UUID', constraints: 'FK -> family_members.id, NULLABLE', description: 'ID thành viên trong gia phả (nếu có)' },
      { name: 'generation_or_branch', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'Thế hệ / Chi nhánh' },
      { name: 'amount', type: 'NUMERIC(15, 2)', constraints: 'NOT NULL CHECK (amount > 0)', description: 'Số tiền đóng góp (VNĐ)' },
      { name: 'purpose', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Mục đích: duty (nghĩa vụ) | worship (cúng dường) | study_fund (khuyến học) | construction (xây dựng) | other' },
      { name: 'receipt_image_url', type: 'VARCHAR(500)', constraints: 'NULLABLE', description: 'Ảnh chụp màn hình biên lai chuyển tiền' },
      { name: 'transaction_ref', type: 'VARCHAR(100)', constraints: 'UNIQUE, NOT NULL', description: 'Mã tham chiếu giao dịch ngân hàng' },
      { name: 'bank_account_receiver', type: 'VARCHAR(150)', constraints: 'NOT NULL', description: 'Tài khoản thụ hưởng của Quỹ' },
      { name: 'notes', type: 'TEXT', constraints: 'NULLABLE', description: 'Lời nhắn gửi, ghi chú' },
      { name: 'status', type: 'VARCHAR(30)', constraints: 'DEFAULT "pending"', description: 'pending | confirmed | rejected' },
      { name: 'confirmed_by_user_id', type: 'UUID', constraints: 'FK -> users.id, NULLABLE', description: 'Thủ quỹ hoặc Admin phê duyệt' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Thời điểm con cháu gửi phiếu' },
      { name: 'confirmed_at', type: 'TIMESTAMPTZ', constraints: 'NULLABLE', description: 'Thời điểm xác nhận vào sổ quỹ' }
    ],
    indices: [
      'CREATE INDEX idx_contrib_status ON contributions(status);',
      'CREATE INDEX idx_contrib_purpose ON contributions(purpose);',
      'CREATE INDEX idx_contrib_created ON contributions(created_at DESC);'
    ]
  },
  {
    tableName: 'articles',
    description: 'Bảng tin tức, sự kiện và bài viết lịch sử dòng họ',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Mã bài viết' },
      { name: 'title', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Tiêu đề bài viết' },
      { name: 'slug', type: 'VARCHAR(255)', constraints: 'UNIQUE, NOT NULL', description: 'Đường dẫn thân thiện SEO' },
      { name: 'category', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'news | activity | history | communion' },
      { name: 'summary', type: 'TEXT', constraints: 'NOT NULL', description: 'Tóm tắt bài viết' },
      { name: 'content', type: 'TEXT', constraints: 'NOT NULL', description: 'Nội dung chi tiết (Markdown/HTML)' },
      { name: 'cover_image_url', type: 'VARCHAR(500)', constraints: 'NULLABLE', description: 'Ảnh bìa đại diện' },
      { name: 'author_id', type: 'UUID', constraints: 'FK -> users.id, NOT NULL', description: 'Tác giả' },
      { name: 'status', type: 'VARCHAR(30)', constraints: 'DEFAULT "published"', description: 'draft | pending_review | published' },
      { name: 'views', type: 'INTEGER', constraints: 'DEFAULT 0', description: 'Lượt xem' },
      { name: 'published_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Ngày đăng tải' }
    ],
    indices: ['CREATE INDEX idx_articles_category ON articles(category);', 'CREATE INDEX idx_articles_status ON articles(status);']
  },
  {
    tableName: 'audit_logs',
    description: 'Nhật ký kiểm toán hệ thống ghi lại mọi hành động thay đổi dữ liệu nhạy cảm',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PK, DEFAULT gen_random_uuid()', description: 'Mã log' },
      { name: 'user_id', type: 'UUID', constraints: 'FK -> users.id, NOT NULL', description: 'Người thực hiện thao tác' },
      { name: 'action', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'APPROVE_CHANGE, MERGE_TREE, CONFIRM_CONTRIBUTION, ASSIGN_ROLE...' },
      { name: 'entity_table', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Bảng bị thay đổi' },
      { name: 'entity_id', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'ID bản ghi' },
      { name: 'old_value', type: 'JSONB', constraints: 'NULLABLE', description: 'Giá trị trước thay đổi' },
      { name: 'new_value', type: 'JSONB', constraints: 'NULLABLE', description: 'Giá trị sau thay đổi' },
      { name: 'ip_address', type: 'VARCHAR(45)', constraints: 'NULLABLE', description: 'Địa chỉ IP' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: 'DEFAULT NOW()', description: 'Thời gian ghi nhận' }
    ],
    indices: ['CREATE INDEX idx_audit_user ON audit_logs(user_id);', 'CREATE INDEX idx_audit_time ON audit_logs(created_at DESC);']
  }
];

export const RBAC_MATRIX_DATA: RBACPermission[] = [
  // Cây gia phả & Thành viên
  { module: 'Cây Gia Phả', action: 'Xem sơ đồ cây gia phả công khai & Tra cứu', admin: true, liaison: true, reporter: true, member: true, notes: 'Tất cả con cháu và khách đều có quyền tra cứu' },
  { module: 'Cây Gia Phả', action: 'Thêm/Sửa/Xóa trực tiếp thành viên lên cây phả đồ chính (Direct CRUD)', admin: true, liaison: false, reporter: false, member: false, notes: 'Chỉ Admin mới có quyền sửa trực tiếp không qua kiểm duyệt' },
  { module: 'Cây Gia Phả', action: 'Tạo phiếu đề xuất Thêm/Sửa thông tin thành viên (Gửi duyệt)', admin: true, liaison: true, reporter: false, member: false, notes: 'Liên lạc viên chi họ nhập liệu, rơi vào trạng thái chờ duyệt' },
  { module: 'Cây Gia Phả', action: 'Phê duyệt / Từ chối phiếu thay đổi gia phả từ Liên lạc viên', admin: true, liaison: false, reporter: false, member: false, notes: 'Admin đối chiếu và áp dụng vào cây chính thức' },
  { module: 'Cây Gia Phả', action: 'Xuất cây gia phả ra tệp in ấn (PDF, Vector SVG, Excel)', admin: true, liaison: true, reporter: false, member: true, notes: 'Cho phép con cháu tải về in phả đồ treo tường' },

  // Quản lý Tin tức & Hoạt động
  { module: 'Truyền Thông', action: 'Xem bài viết, thông báo, thư viện ảnh/video', admin: true, liaison: true, reporter: true, member: true, notes: 'Công khai cho toàn bộ họ tộc' },
  { module: 'Truyền Thông', action: 'Soạn thảo và gửi bài viết Tin tức / Hoạt động', admin: true, liaison: true, reporter: true, member: false, notes: 'Phóng viên và Liên lạc viên đều được viết bài' },
  { module: 'Truyền Thông', action: 'Xuất bản bài viết trực tiếp (Publish không qua kiểm duyệt)', admin: true, liaison: true, reporter: false, member: false, notes: 'Phóng viên gửi bài ở chế độ chờ duyệt; Admin/Liên lạc viên có quyền xuất bản' },
  { module: 'Truyền Thông', action: 'Xóa bài viết của tác giả khác', admin: true, liaison: false, reporter: false, member: false, notes: 'Chỉ Admin mới có quyền xóa bài viết vi phạm' },
  { module: 'Truyền Thông', action: 'Quản lý thư viện Album Ảnh / Video dòng họ', admin: true, liaison: true, reporter: true, member: false, notes: 'Upload kho tư liệu hình ảnh sự kiện giỗ tổ' },

  // Quản lý Đóng góp & Quỹ họ tộc
  { module: 'Quỹ Đóng Góp', action: 'Tạo mã VietQR và gửi phiếu xác nhận đóng góp', admin: true, liaison: true, reporter: true, member: true, notes: 'Bất kỳ ai cũng có thể công đức và tải bill' },
  { module: 'Quỹ Đóng Góp', action: 'Xem danh sách công đức công khai & Bảng vàng vinh danh', admin: true, liaison: true, reporter: true, member: true, notes: 'Minh bạch tài chính họ tộc 100%' },
  { module: 'Quỹ Đóng Góp', action: 'Duyệt xác nhận giao dịch đóng góp (Chờ -> Đã nhận quỹ)', admin: true, liaison: false, reporter: false, member: false, notes: 'Admin / Thủ quỹ kiểm tra đối soát với ngân hàng' },
  { module: 'Quỹ Đóng Góp', action: 'Xem chi tiết hình ảnh chứng từ/bill chuyển khoản nhạy cảm', admin: true, liaison: true, reporter: false, member: false, notes: 'Phòng ngừa rò rỉ thông tin cá nhân trên sao kê' },
  { module: 'Quỹ Đóng Góp', action: 'Xuất báo cáo thu chi quỹ định kỳ (Excel/PDF)', admin: true, liaison: true, reporter: false, member: false, notes: 'Phục vụ báo cáo tại đại lễ giỗ tổ' },

  // Quản trị Hệ thống & Người dùng
  { module: 'Hệ Thống', action: 'Quản lý danh sách tài khoản & Cấp phát vai trò (RBAC)', admin: true, liaison: false, reporter: false, member: false, notes: 'Tuyệt đối cấm Liên lạc viên và Phóng viên can thiệp' },
  { module: 'Hệ Thống', action: 'Khóa / Mở khóa tài khoản người dùng', admin: true, liaison: false, reporter: false, member: false, notes: 'Xử lý các hành vi spam hoặc tài khoản bị xâm nhập' },
  { module: 'Hệ Thống', action: 'Xem nhật ký kiểm toán hệ thống (Audit Logs)', admin: true, liaison: false, reporter: false, member: false, notes: 'Theo dõi dấu vết thao tác nhạy cảm' },
  { module: 'Hệ Thống', action: 'Cấu hình thông tin tài khoản ngân hàng nhận Quỹ & QR', admin: true, liaison: false, reporter: false, member: false, notes: 'Tránh trường hợp kẻ gian thay đổi số tài khoản nhận tiền' }
];

export const WORKFLOW_LIAISON_TO_ADMIN: WorkflowStep[] = [
  {
    stepNumber: 1,
    actor: 'Liên lạc viên (Liaison Officer)',
    action: 'Đăng nhập vào Hệ thống, chọn Chi họ phụ trách, bấm "Đề xuất thêm thành viên mới" hoặc "Đề xuất sửa thông tin".',
    systemResponse: 'Mở form nhập liệu với các trường: Họ tên, Năm sinh, Giới tính, Cha/Mẹ trực hệ, Địa chỉ, Nghề nghiệp, Trạng thái sinh tử.',
    stateTransition: 'Form State: Initial Draft'
  },
  {
    stepNumber: 2,
    actor: 'Liên lạc viên (Liaison Officer)',
    action: 'Điền thông tin thành viên, đính kèm giấy khai sinh hoặc căn cước (nếu có), nhập lý do thay đổi và bấm "Gửi duyệt lên Admin".',
    systemResponse: 'Hệ thống validate tính toàn vẹn (Cha/Mẹ phải tồn tại trong cây gia phả, thế hệ phải lớn hơn thế hệ của cha). Ghi vào bảng `change_requests` với status="pending".',
    stateTransition: 'Status: PENDING_APPROVAL'
  },
  {
    stepNumber: 3,
    actor: 'Hệ thống (Notification Service)',
    action: 'Tự động kích hoạt thông báo (In-app Notification, Email hoặc Zalo ZNS) gửi tới Quản trị viên (Admin).',
    systemResponse: 'Đưa yêu cầu vào danh sách "Hàng đợi kiểm duyệt (Approval Queue)" trên Admin Dashboard.',
    stateTransition: 'Queue: In Review'
  },
  {
    stepNumber: 4,
    actor: 'Quản trị viên (Admin)',
    action: 'Mở Admin Panel -> Mục "Phê duyệt gia phả". Xem giao diện So sánh trực quan (Side-by-Side Diff View): Cũ vs Mới.',
    systemResponse: 'Hiển thị màu xanh lá cho trường mới thêm, màu vàng cho trường sửa đổi. Cho phép Admin chỉnh sửa trực tiếp nội dung trước khi duyệt.',
    stateTransition: 'Admin Decisioning'
  },
  {
    stepNumber: 5,
    actor: 'Quản trị viên (Admin) - Trường hợp A: PHÊ DUYỆT',
    action: 'Admin bấm nút "Chấp thuận & Cập nhật lên Cây chính".',
    systemResponse: 'Hệ thống mở Database Transaction: (1) Cập nhật/Thêm mới vào bảng `family_members`, (2) Tự động tái tính toán bảng `member_closure`, (3) Xóa cache Redis của Cây gia phả, (4) Đổi `change_requests.status = approved`, (5) Ghi `audit_logs`.',
    stateTransition: 'Status: APPROVED -> Tree Updated'
  },
  {
    stepNumber: 6,
    actor: 'Quản trị viên (Admin) - Trường hợp B: TỪ CHỐI',
    action: 'Admin bấm "Từ chối" và nhập lý do (ví dụ: "Chưa rõ chi phái của người mẹ, đề nghị bổ sung giấy khai sinh").',
    systemResponse: 'Hệ thống cập nhật `change_requests.status = rejected`, lưu `review_comment`, gửi thông báo trả về cho Liên lạc viên bổ sung.',
    stateTransition: 'Status: REJECTED'
  }
];

export const WORKFLOW_QR_CONTRIBUTION: WorkflowStep[] = [
  {
    stepNumber: 1,
    actor: 'Con cháu họ tộc / Khách viếng',
    action: 'Truy cập mục "Quỹ & Đóng góp họ tộc", nhập Họ tên, Chi họ/Thế hệ, Số tiền muốn công đức và chọn Mục đích (Nghĩa vụ, Cúng dường, Khuyến học, Xây dựng...).',
    systemResponse: 'Hệ thống tự động sinh Mã giao dịch duy nhất (Transaction Ref: `HO_NGUYEN_[TIMESTAMP]_[RAND]`) và vẽ mã VietQR chuẩn NAPAS 247 có sẵn STK Quỹ và nội dung chuyển khoản.',
    stateTransition: 'Form: QR Generated'
  },
  {
    stepNumber: 2,
    actor: 'Con cháu họ tộc',
    action: 'Dùng ứng dụng Ngân hàng di động (V種のVietcombank, MBBank, Techcombank...) quét mã QR và thực hiện lệnh chuyển tiền 24/7.',
    systemResponse: 'Giao dịch ngân hàng hoàn tất thành công trên điện thoại người chuyển.',
    stateTransition: 'Bank Transaction Completed'
  },
  {
    stepNumber: 3,
    actor: 'Con cháu họ tộc',
    action: 'Chụp ảnh màn hình phiếu chuyển tiền (Bill thành công), tải lên form xác nhận tại trang web và bấm "Gửi xác nhận đóng góp".',
    systemResponse: 'Client upload ảnh lên Cloud Storage (qua Presigned URL), sau đó ghi nhận bản ghi vào bảng `contributions` với status="pending".',
    stateTransition: 'Status: PENDING_VERIFICATION'
  },
  {
    stepNumber: 4,
    actor: 'Thủ quỹ / Quản trị viên (Admin)',
    action: 'Đăng nhập trang quản trị Quỹ, kiểm tra danh sách đóng góp "Chờ xác nhận". Đối chiếu với Sao kê tài khoản ngân hàng thực tế của dòng họ.',
    systemResponse: 'Hiển thị ảnh phóng to của biên lai chuyển khoản kèm mã tham chiếu và số tiền.',
    stateTransition: 'Admin Verification'
  },
  {
    stepNumber: 5,
    actor: 'Thủ quỹ / Quản trị viên (Admin)',
    action: 'Xác nhận số tiền đã vào tài khoản, bấm "Duyệt vào Sổ Quỹ".',
    systemResponse: 'Hệ thống chuyển trạng thái `status = confirmed`, cập nhật tổng số dư quỹ họ tộc, tự động đưa tên người công đức lên "Bảng vàng vinh danh công đức" công khai.',
    stateTransition: 'Status: CONFIRMED -> Added to Public Ledger'
  }
];

export const REST_API_ENDPOINTS: ApiEndpoint[] = [
  // Auth
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    summary: 'Đăng nhập tài khoản bằng số điện thoại và mật khẩu',
    authRequired: false,
    rolesAllowed: ['All'],
    requestBody: `{\n  "phone": "0912345678",\n  "password": "SecurePassword123!"\n}`,
    responseSample: `{\n  "status": "success",\n  "data": {\n    "accessToken": "eyJhbGciOiJIUzI1NiIs...",\n    "user": {\n      "id": "usr_001",\n      "phone": "0912345678",\n      "role": "admin",\n      "fullName": "Nguyễn Văn Minh"\n    }\n  }\n}`
  },
  // Family Members & Tree
  {
    method: 'GET',
    path: '/api/v1/family-tree',
    summary: 'Lấy toàn bộ đồ thị cây gia phả (nodes và edges phân cấp)',
    authRequired: false,
    rolesAllowed: ['All'],
    responseSample: `{\n  "status": "success",\n  "data": {\n    "rootId": "mem_gen1_01",\n    "totalGenerations": 5,\n    "membersCount": 14,\n    "nodes": [...],\n    "links": [...]\n  }\n}`
  },
  {
    method: 'GET',
    path: '/api/v1/members/search',
    summary: 'Tìm kiếm nâng cao thành viên (họ tên, thế hệ, chi họ, còn sống, địa chỉ)',
    authRequired: false,
    rolesAllowed: ['All'],
    requestBody: `Query Params: ?name=Minh&generation=3&branch=Chi 1&isAlive=true`,
    responseSample: `{\n  "status": "success",\n  "total": 1,\n  "page": 1,\n  "items": [\n    {\n      "id": "mem_gen3_01",\n      "fullName": "Nguyễn Văn Minh",\n      "generation": 3,\n      "branch": "Chi 1",\n      "isAlive": true,\n      "workplace": "Nguyên Vụ trưởng Bộ Kế hoạch Đầu tư"\n    }\n  ]\n}`
  },
  {
    method: 'GET',
    path: '/api/v1/members/:id/lineage-tree',
    summary: 'Lấy cây phả hệ thu nhỏ 3 thế hệ trực hệ (Ông bà/Cha mẹ -> Đương sự -> Con cháu)',
    authRequired: false,
    rolesAllowed: ['All'],
    responseSample: `{\n  "target": { "id": "mem_gen3_01", "name": "Nguyễn Văn Minh" },\n  "parents": [{ "id": "mem_gen2_01", "name": "Nguyễn Văn Phúc" }],\n  "grandParents": [{ "id": "mem_gen1_01", "name": "Nguyễn Văn Khang" }],\n  "spouse": { "name": "Hoàng Thị Nguyệt" },\n  "children": [\n    { "id": "mem_gen4_01", "name": "Nguyễn Quang Hải" },\n    { "id": "mem_gen4_02", "name": "Nguyễn Lan Anh" }\n  ]\n}`
  },
  {
    method: 'POST',
    path: '/api/v1/members',
    summary: 'Thêm trực tiếp thành viên vào Cây gia phả (Admin only)',
    authRequired: true,
    rolesAllowed: ['admin'],
    requestBody: `{\n  "fullName": "Nguyễn Tuấn Kiệt",\n  "generation": 5,\n  "gender": "male",\n  "fatherId": "mem_gen4_01",\n  "birthYear": 2024\n}`,
    responseSample: `{\n  "status": "success",\n  "message": "Thành viên đã được thêm trực tiếp vào cây gia phả",\n  "data": { "id": "mem_gen5_04", "status": "active" }\n}`
  },
  // Change Requests (Liaison & Admin Workflow)
  {
    method: 'POST',
    path: '/api/v1/change-requests',
    summary: 'Liên lạc viên gửi đề xuất thêm hoặc sửa dữ liệu thành viên',
    authRequired: true,
    rolesAllowed: ['admin', 'liaison'],
    requestBody: `{\n  "type": "create_member",\n  "proposedData": {\n    "fullName": "Nguyễn Thiên An",\n    "generation": 5,\n    "fatherId": "mem_gen4_01",\n    "birthYear": 2024\n  },\n  "notes": "Cháu gái mới sinh, gửi kèm giấy khai sinh"\n}`,
    responseSample: `{\n  "status": "success",\n  "message": "Đề xuất đã được ghi nhận ở trạng thái Chờ phê duyệt",\n  "requestId": "req_099"\n}`
  },
  {
    method: 'PATCH',
    path: '/api/v1/change-requests/:id/review',
    summary: 'Admin xét duyệt đề xuất của Liên lạc viên (Approve / Reject)',
    authRequired: true,
    rolesAllowed: ['admin'],
    requestBody: `{\n  "decision": "approved", // hoặc "rejected"\n  "comment": "Thông tin giấy khai sinh chính xác, hợp lệ"\n}`,
    responseSample: `{\n  "status": "success",\n  "message": "Đề xuất đã được chấp thuận và tích hợp lên cây phả đồ chính"\n}`
  },
  // Contributions & Funds
  {
    method: 'POST',
    path: '/api/v1/contributions/generate-qr',
    summary: 'Tạo payload mã VietQR cho lệnh đóng góp quỹ họ',
    authRequired: false,
    rolesAllowed: ['All'],
    requestBody: `{\n  "donorName": "Nguyễn Văn Hùng",\n  "amount": 20000000,\n  "purpose": "study_fund"\n}`,
    responseSample: `{\n  "qrDataUrl": "https://api.vietqr.io/image/...",\n  "transactionRef": "HO_NGUYEN_2026_0981",\n  "bank": "MBBank",\n  "accountNo": "1903688889999",\n  "transferContent": "HO NGUYEN 2026 0981"\n}`
  },
  {
    method: 'POST',
    path: '/api/v1/contributions',
    summary: 'Gửi biên lai xác nhận đóng góp (upload receipt bill)',
    authRequired: false,
    rolesAllowed: ['All'],
    requestBody: `{\n  "donorName": "Nguyễn Văn Hùng",\n  "generationOrBranch": "Chi 1 - Đời 3",\n  "amount": 20000000,\n  "purpose": "study_fund",\n  "transactionRef": "MBB_20260301_88291",\n  "receiptImageUrl": "https://storage.giaphahotoc.vn/receipts/bill_01.jpg",\n  "notes": "Ủng hộ quỹ khuyến học"\n}`,
    responseSample: `{\n  "status": "success",\n  "message": "Giao dịch đã được ghi nhận. Ban quản trị sẽ đối soát và xác nhận sớm nhất.",\n  "contributionId": "contrib_101"\n}`
  },
  {
    method: 'PATCH',
    path: '/api/v1/contributions/:id/confirm',
    summary: 'Thủ quỹ / Admin xác nhận tiền đã vào quỹ',
    authRequired: true,
    rolesAllowed: ['admin'],
    requestBody: `{\n  "status": "confirmed"\n}`,
    responseSample: `{\n  "status": "success",\n  "message": "Đã xác nhận giao dịch vào sổ quỹ họ tộc thành công"\n}`
  },
  // News & Articles
  {
    method: 'POST',
    path: '/api/v1/articles',
    summary: 'Tạo bài viết mới cho mục Tin tức & Hoạt động',
    authRequired: true,
    rolesAllowed: ['admin', 'liaison', 'reporter'],
    requestBody: `{\n  "title": "Lễ khánh thành nhà thờ tổ",\n  "category": "activity",\n  "summary": "Tóm tắt...",\n  "content": "Nội dung Markdown...",\n  "status": "published" // Phóng viên có thể là "pending_review"\n}`,
    responseSample: `{\n  "status": "success",\n  "articleId": "art_202"\n}`
  }
];
