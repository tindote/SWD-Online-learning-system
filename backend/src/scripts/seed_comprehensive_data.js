require('dotenv').config();
const db = require('../config/db');

const instructorsToAdd = [
  {
    name: 'Hoàng Tuấn Anh',
    email: 'tuananh.hoang@example.com',
    bio: 'Mobile Tech Lead với hơn 8 năm phát triển Flutter và React Native cho các ứng dụng ngân hàng số.',
    role: 'instructor'
  },
  {
    name: 'Đặng Hoàng Nam',
    email: 'hoangnam.dang@example.com',
    bio: 'DevOps & SRE Specialist, chuyên gia tự động hóa CI/CD, Kubernetes và Cloud Infrastructure.',
    role: 'instructor'
  },
  {
    name: 'Nguyễn Hà Linh',
    email: 'halinh.nguyen@example.com',
    bio: 'Lead UI/UX Designer & Product Strategy tại công ty công nghệ đa quốc gia, diễn giả thiết kế Design Systems.',
    role: 'instructor'
  },
  {
    name: 'Vũ Hải Đăng',
    email: 'haidang.vu@example.com',
    bio: 'Chuyên gia An ninh mạng, chứng chỉ OSCP & CISSP, cựu trưởng nhóm bảo mật thông tin và SOC Analyst.',
    role: 'instructor'
  }
];

const newCourses = [
  {
    title: 'Next.js 15 & React Server Components: Xây dựng Web App Toàn diện',
    description: 'Làm chủ Next.js 15 App Router, Server Actions, Tối ưu SEO, Cache đa tầng và tích hợp xác thực bảo mật chuẩn Production.',
    instructor: 'Dr. Alex Morgan',
    category: 'Web Development',
    price: 69.99,
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Giới thiệu Next.js 15 App Router & Kiến trúc Server Components',
        content: 'Tìm hiểu sự khác biệt giữa Server Components và Client Components, cách thức giảm Bundle Size về 0 cho các trang render từ máy chủ.',
        video_url: 'https://www.youtube.com/embed/SqcY0GlETPk',
        resource_url: 'https://nextjs.org/docs'
      },
      {
        order: 2,
        title: 'Xử lý dữ liệu với Next.js Server Actions & Revalidation',
        content: 'Thực thi các hàm mutation trực tiếp trên server mà không cần tạo REST endpoint trung gian, kết hợp revalidatePath và revalidateTag.',
        video_url: 'https://www.youtube.com/embed/7H_QH9nipNs',
        resource_url: 'https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations'
      },
      {
        order: 3,
        title: 'Xác thực người dùng với NextAuth.js (Auth.js v5) & Role Protection',
        content: 'Cấu hình OAuth Google/GitHub và Credentials Provider, xử lý JWT session, middleware bảo vệ tuyến đường theo phân quyền người dùng.',
        video_url: 'https://www.youtube.com/embed/mbsmsi7l3r4',
        resource_url: 'https://authjs.dev'
      },
      {
        order: 4,
        title: 'Tối ưu hóa Hiệu năng, Hình ảnh, Font chữ & SEO Toàn diện',
        content: 'Khai thác tối đa next/image, next/font, generateMetadata cho SEO động và OpenGraph image phục vụ chia sẻ mạng xã hội.',
        video_url: 'https://www.youtube.com/embed/O6P86uwfdR0',
        resource_url: 'https://nextjs.org/docs/app/building-your-application/optimizing'
      },
      {
        order: 5,
        title: 'Triển khai Full-Stack Next.js trên Vercel và Docker Server Riêng',
        content: 'Build ứng dụng dạng standalone container, cấu hình biến môi trường production, kết nối CDN và giám sát lỗi với Sentry.',
        video_url: 'https://www.youtube.com/embed/n4p_O10v7p4',
        resource_url: 'https://nextjs.org/docs/app/building-your-application/deploying'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Xây dựng Blog tĩnh động với Next.js 15 App Router',
        description: 'Tạo ứng dụng Blog đọc tin từ API hoặc Markdown, áp dụng Dynamic Routes, Static Generation và generateMetadata chuẩn SEO.',
        due_date: '2026-11-01 23:59:59'
      },
      {
        title: 'Bài tập 2: Xây dựng Dashboard Quản lý với Server Actions & NextAuth',
        description: 'Phát triển trang quản trị người dùng có đăng nhập, bảo vệ tuyến đường với Middleware và form thêm sửa xóa sử dụng Server Actions.',
        due_date: '2026-11-15 23:59:59'
      }
    ]
  },
  {
    title: 'Phát triển Backend Hiệu năng cao với Golang (Go) & REST/gRPC',
    description: 'Học cách xây dựng hệ thống Microservices mạnh mẽ, xử lý hàng trăm nghìn requests/giây với Goroutines, Gin Framework và gRPC protocol.',
    instructor: 'Dr. Alex Morgan',
    category: 'Web Development',
    price: 79.99,
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Cơ bản về Go: Syntax, Pointers, Structs & Interfaces',
        content: 'Nắm vững triết lý thiết kế của Go: sự đơn giản, tĩnh kiểu nghiêm ngặt, quản lý bộ nhớ và cách sử dụng struct thay cho class hướng đối tượng.',
        video_url: 'https://www.youtube.com/embed/un6ZyFkqFKo',
        resource_url: 'https://go.dev/tour/'
      },
      {
        order: 2,
        title: 'Đồng thời trong Go: Goroutines, Channels và Mutex Synchronization',
        content: 'Khám phá mô hình CSP (Communicating Sequential Processes), giải quyết bài toán chạy song song nhiều tác vụ mà không bị Race Condition.',
        video_url: 'https://www.youtube.com/embed/yyUHQIec83I',
        resource_url: 'https://go.dev/doc/effective_go#concurrency'
      },
      {
        order: 3,
        title: 'Xây dựng REST API cực nhanh với Gin Framework và GORM',
        content: 'Tổ chức Clean Architecture trong Go: Handlers, Services, Repositories, kết nối PostgreSQL/MySQL và kiểm soát database transaction.',
        video_url: 'https://www.youtube.com/embed/7H_QH9nipNs',
        resource_url: 'https://gin-gonic.com/docs/'
      },
      {
        order: 4,
        title: 'Giao tiếp Microservices với Protocol Buffers & gRPC',
        content: 'Định nghĩa Proto file, sinh mã tự động, xây dựng gRPC Client và Server streaming dữ liệu với độ trễ thấp vượt trội so với JSON/REST.',
        video_url: 'https://www.youtube.com/embed/Bzx_z5dF7_Y',
        resource_url: 'https://grpc.io/docs/languages/go/'
      },
      {
        order: 5,
        title: 'Unit Test, Benchmark và Tối ưu Memory Allocation trong Go',
        content: 'Sử dụng go test, go bench, pprof để tìm memory leak, CPU bottleneck và viết mã đạt hiệu suất tối ưu.',
        video_url: 'https://www.youtube.com/embed/EN6Dx22cPRI',
        resource_url: 'https://pkg.go.dev/testing'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Xây dựng Dịch vụ Quản lý Sản phẩm RESTful với Gin & Go',
        description: 'Tạo REST API quản lý kho hàng với Gin framework, xác thực request validation, kết nối MySQL và xử lý graceful shutdown.',
        due_date: '2026-11-10 23:59:59'
      },
      {
        title: 'Bài tập 2: Triển khai Microservice giao tiếp bằng gRPC Protocol',
        description: 'Xây dựng 2 microservices: Order Service và Payment Service giao tiếp thông qua gRPC với protocol buffers definitions.',
        due_date: '2026-11-25 23:59:59'
      }
    ]
  },
  {
    title: 'Vue.js 3, Vite & Pinia: Xây dựng Ứng dụng Doanh nghiệp Hiện đại',
    description: 'Chinh phục Composition API, TypeScript trong Vue 3, Quản lý State tập trung với Pinia và xây dựng giao diện mượt mà với Tailwind CSS.',
    instructor: 'Michael Chang',
    category: 'Web Development',
    price: 49.99,
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Vue 3 Composition API & Reactivity Core (ref, reactive, computed)',
        content: 'Khám phá cách mạng của Vue 3 với script setup, quản lý trạng thái phản ứng linh hoạt và tái sử dụng logic với Composables.',
        video_url: 'https://www.youtube.com/embed/bzlF85464bo',
        resource_url: 'https://vuejs.org/guide/introduction.html'
      },
      {
        order: 2,
        title: 'Tổ chức State Management quy mô lớn với Pinia Store',
        content: 'Thay thế Vuex bằng Pinia: State, Getters, Actions, hỗ trợ Devtools tuyệt vời và Type Safety tự nhiên không cần cấu hình phức tạp.',
        video_url: 'https://www.youtube.com/embed/u_JkF-8i5p8',
        resource_url: 'https://pinia.vuejs.org/'
      },
      {
        order: 3,
        title: 'Điều hướng Single Page App với Vue Router 4 & Navigation Guards',
        content: 'Cấu hình dynamic route params, nested routes, phân quyền truy cập thông qua beforeEach guards và lazy loading component.',
        video_url: 'https://www.youtube.com/embed/juocv4AtrCs',
        resource_url: 'https://router.vuejs.org/'
      },
      {
        order: 4,
        title: 'Xây dựng Component Thư viện tái sử dụng với TypeScript',
        content: 'Khai báo props, emits với kiểu dữ liệu chuẩn chỉnh, sử và slot scoped để tạo các UI Component linh hoạt như Modal, DataTable, Dropdown.',
        video_url: 'https://www.youtube.com/embed/SqcY0GlETPk',
        resource_url: 'https://vuejs.org/guide/typescript/overview.html'
      },
      {
        order: 5,
        title: 'Kiểm thử Component với Vitest và Tối ưu hóa Tốc độ Tải',
        content: 'Thiết lập Vitest và Vue Test Utils, đo lường độ bao phủ kiểm thử (coverage), chia nhỏ code splitting và preload tài nguyên.',
        video_url: 'https://www.youtube.com/embed/n4p_O10v7p4',
        resource_url: 'https://test-utils.vuejs.org/'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Xây dựng Ứng dụng E-Commerce Mini với Vue 3 & Pinia',
        description: 'Tạo giao diện hiển thị danh sách sản phẩm, bộ lọc danh mục, giỏ hàng lưu vào Pinia Store và tính toán tổng tiền thanh toán.',
        due_date: '2026-11-08 23:59:59'
      },
      {
        title: 'Bài tập 2: Xây dựng Dashboard Quản trị tương tác cao với Vue Router',
        description: 'Xây dựng trang Dashboard quản lý tài khoản, tích hợp biểu đồ số liệu và các Navigation Guards kiểm tra quyền truy cập.',
        due_date: '2026-11-20 23:59:59'
      }
    ]
  },
  {
    title: 'Tối ưu hóa Database & SQL Performance Tuning cho Hệ thống Lớn',
    description: 'Chuyên sâu về đánh chỉ mục Indexing (B-Tree, Hash), tối ưu hóa câu lệnh Query execution plan, cấu trúc bảng và Partitioning trong MySQL & PostgreSQL.',
    instructor: 'Dr. Alex Morgan',
    category: 'Web Development',
    price: 59.99,
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Hiểu sâu về B-Tree Index và Chiến lược Đánh chỉ mục hiệu quả',
        content: 'Cấu trúc lưu trữ dữ liệu đĩa cứng, nguyên lý hoạt động của Clustered vs Secondary Index, quy tắc Leftmost Prefix Rule.',
        video_url: 'https://www.youtube.com/embed/EN6Dx22cPRI',
        resource_url: 'https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html'
      },
      {
        order: 2,
        title: 'Đọc và Phân tích EXPLAIN / EXPLAIN ANALYZE Execution Plan',
        content: 'Giải mã các chỉ số then chốt: type (ALL, ref, range, index), possible_keys, key_len, rows examined và phát hiện Full Table Scan.',
        video_url: 'https://www.youtube.com/embed/7H_QH9nipNs',
        resource_url: 'https://dev.mysql.com/doc/refman/8.0/en/explain-output.html'
      },
      {
        order: 3,
        title: 'Tối ưu hóa truy vấn Phức tạp: JOINs, Subqueries và Window Functions',
        content: 'Chuyển đổi subquery không hiệu quả thành JOIN, áp dụng Covering Index để truy vấn chỉ quét chỉ mục mà không đọc bảng gốc.',
        video_url: 'https://www.youtube.com/embed/dcqPhpY7tWk',
        resource_url: 'https://www.postgresql.org/docs/current/performance-tips.html'
      },
      {
        order: 4,
        title: 'Phân vùng dữ liệu (Table Partitioning) và Quản lý Bảng dữ liệu Khổng lồ',
        content: 'Chiến lược chia bảng theo Range, List và Hash; tự động lưu trữ và dọn dẹp dữ liệu lịch sử hàng chục triệu bản ghi.',
        video_url: 'https://www.youtube.com/embed/Z3SYDTMP3ME',
        resource_url: 'https://dev.mysql.com/doc/refman/8.0/en/partitioning.html'
      },
      {
        order: 5,
        title: 'Connection Pooling, Sharding & Caching với Redis',
        content: 'Cấu hình pool kết nối tối ưu cho backend, kiến trúc Read/Write Splitting với Replica và tầng Cache Redis giảm tải DB.',
        video_url: 'https://www.youtube.com/embed/e_kXz9vQ7F0',
        resource_url: 'https://redis.io/docs/'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Khắc phục sự cố Slow Query trên Bảng 1 Triệu Bản Ghi',
        description: 'Sử dụng EXPLAIN để xác định nguyên nhân truy vấn chạy chậm hơn 3 giây và thiết kế chỉ mục phù hợp đưa thời gian về dưới 20ms.',
        due_date: '2026-11-05 23:59:59'
      },
      {
        title: 'Bài tập 2: Thiết kế Kiến trúc Cơ sở dữ liệu E-Commerce phân vùng',
        description: 'Tạo sơ đồ quan hệ schema hoàn chỉnh, phân vùng bảng đơn hàng theo năm/tháng và thiết lập Redis Caching tầng truy vấn.',
        due_date: '2026-11-18 23:59:59'
      }
    ]
  },
  {
    title: 'Flutter & Dart: Lập trình Ứng dụng Di động Đa Nền tảng Đỉnh Cao',
    description: 'Xây dựng ứng dụng hoàn chỉnh cho iOS và Android từ một codebase duy nhất. Làm chủ Bloc State Management, Animation và Firebase integration.',
    instructor: 'Hoàng Tuấn Anh',
    category: 'Mobile Development',
    price: 65.00,
    thumbnail: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Làm quen với Dart 3 & Kiến trúc Widget của Flutter',
        content: 'Pattern matching, Records trong Dart 3, sự khác biệt giữa StatelessWidget và StatefulWidget, vòng đời và Render Tree.',
        video_url: 'https://www.youtube.com/embed/1gDhl4leEzA',
        resource_url: 'https://flutter.dev/docs'
      },
      {
        order: 2,
        title: 'Quản lý Trạng thái Chuyên nghiệp với Bloc & Cubit Pattern',
        content: 'Tách biệt rõ ràng tầng UI, Business Logic và Data Layer. Xử lý các luồng sự kiện bất đồng bộ mượt mà không re-render dư thừa.',
        video_url: 'https://www.youtube.com/embed/la0Wz2F5k2c',
        resource_url: 'https://bloclibrary.dev/'
      },
      {
        order: 3,
        title: 'Tạo Hiệu ứng Chuyển động Mượt mà (Custom Animations & Hero)',
        content: 'Sử dụng AnimationController, Tween, AnimatedBuilder và Hero Animation để tạo trải nghiệm người dùng cao cấp chuẩn 120 FPS.',
        video_url: 'https://www.youtube.com/embed/FTFaQWZBqQ8',
        resource_url: 'https://docs.flutter.dev/ui/animations'
      },
      {
        order: 4,
        title: 'Kết nối REST API với Dio, Retrofit và Caching cục bộ',
        content: 'Xây dựng Network Client chuẩn, interceptors tự động đính kèm token xác thực, xử lý refresh token và lưu trữ offline với Hive/Isar.',
        video_url: 'https://www.youtube.com/embed/sqo8449Dgu8',
        resource_url: 'https://pub.dev/packages/dio'
      },
      {
        order: 5,
        title: 'Tích hợp Firebase Auth, Cloud Firestore & Push Notifications',
        content: 'Cấu hình Firebase CLI, xác thực người dùng bằng SMS/Email, đồng bộ dữ liệu thời gian thực và nhận thông báo FCM khi app đang chạy ngầm.',
        video_url: 'https://www.youtube.com/embed/wX883L6N3t8',
        resource_url: 'https://firebase.google.com/docs/flutter/setup'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Xây dựng App Tin Tức Đa Chuyên Mục với Flutter & Bloc',
        description: 'Tạo ứng dụng đọc tin tức lấy dữ liệu từ NewsAPI công khai, quản lý trạng thái loading, error, success bằng Bloc/Cubit.',
        due_date: '2026-11-12 23:59:59'
      },
      {
        title: 'Bài tập 2: Tích hợp Đăng nhập Firebase và Lưu Trữ Dữ liệu Offline',
        description: 'Triển khai tính năng đăng ký/đăng nhập qua Firebase Authentication và lưu danh sách bài viết yêu thích vào CSDL cục bộ Hive.',
        due_date: '2026-11-28 23:59:59'
      }
    ]
  },
  {
    title: 'React Native & Expo: Xây dựng App Native Đẳng Cấp Cho Di Động',
    description: 'Chinh phục Expo SDK hiện đại, Expo Router, Native Navigation, Camera & Geolocation và xuất bản app lên Google Play & Apple App Store.',
    instructor: 'Michael Chang',
    category: 'Mobile Development',
    price: 55.00,
    thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Khởi tạo Dự án với Expo Router & Cấu trúc File-Based Routing',
        content: 'Cài đặt môi trường phát triển siêu tốc với Expo EAS, cấu trúc thư mục app router tương tự Next.js, Tabs và Stack Navigation.',
        video_url: 'https://www.youtube.com/embed/F2ojC6TNwws',
        resource_url: 'https://docs.expo.dev/router/introduction/'
      },
      {
        order: 2,
        title: 'Tối ưu UI Linh hoạt với React Native Reanimated & Gesture Handler',
        content: 'Tạo các thao tác vuốt chạm Swipe to Delete, Drag & Drop với hiệu năng tính toán trực tiếp trên UI Thread mà không nghẽn JS Thread.',
        video_url: 'https://www.youtube.com/embed/1XbHwR_vW7k',
        resource_url: 'https://docs.swmansion.com/react-native-reanimated/'
      },
      {
        order: 3,
        title: 'Truy cập Phần cứng Thiết bị: Máy ảnh, Bộ sưu tập & Định vị GPS',
        content: 'Sử dụng expo-camera để chụp ảnh, quét mã QR; expo-location để lấy tọa độ người dùng và hiển thị bản đồ tương tác.',
        video_url: 'https://www.youtube.com/embed/sqo8449Dgu8',
        resource_url: 'https://docs.expo.dev/versions/latest/'
      },
      {
        order: 4,
        title: 'Quản lý Dữ liệu Ngoại tuyến và Đồng bộ Đám mây',
        content: 'Áp dụng AsyncStorage và MMKV siêu tốc để lưu trữ token và thông tin cá nhân, xử lý kết nối mạng chập chờn với NetInfo.',
        video_url: 'https://www.youtube.com/embed/EN6Dx22cPRI',
        resource_url: 'https://github.com/mrousavy/react-native-mmkv'
      },
      {
        order: 5,
        title: 'Build APK/IPA tự động với EAS Build và Xuất bản App',
        content: 'Tạo chứng chỉ Signing Keystore cho Android, Provisioning Profile cho iOS và cấu hình EAS Build trên hạ tầng đám mây của Expo.',
        video_url: 'https://www.youtube.com/embed/wX883L6N3t8',
        resource_url: 'https://docs.expo.dev/build/introduction/'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Xây dựng Ứng dụng Quản lý Chi tiêu Cá nhân với Expo',
        description: 'Tạo ứng dụng ghi chép thu chi hàng ngày, hỗ trợ bộ lọc theo ngày tháng và biểu đồ thống kê trực quan bằng React Native Chart.',
        due_date: '2026-11-14 23:59:59'
      },
      {
        title: 'Bài tập 2: Tích hợp Quét mã QR và Đăng ảnh với Camera Device',
        description: 'Tạo màn hình quét vé điện tử với Camera API và màn hình tải ảnh hồ sơ từ Thư viện ảnh của điện thoại.',
        due_date: '2026-11-26 23:59:59'
      }
    ]
  },
  {
    title: 'Lập trình Android Hiện đại với Kotlin & Jetpack Compose',
    description: 'Chuyển đổi toàn diện sang UI Declarative với Jetpack Compose, Coroutines, Flow, Dagger Hilt và kiến trúc Clean Architecture MVI.',
    instructor: 'Hoàng Tuấn Anh',
    category: 'Mobile Development',
    price: 49.99,
    thumbnail: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Lập trình Kotlin Hiện đại: Coroutines, Flow & Scope Functions',
        content: 'Làm chủ cú pháp Kotlin tinh gọn, xử lý các tác vụ bất đồng bộ an toàn không block UI với Coroutines và StateFlow phản ứng.',
        video_url: 'https://www.youtube.com/embed/comQ1-x2a1Q',
        resource_url: 'https://kotlinlang.org/docs/coroutines-overview.html'
      },
      {
        order: 2,
        title: 'Giao diện Declarative với Jetpack Compose & Material 3 Theme',
        content: 'Bỏ qua XML layout truyền thống, xây dựng giao diện hoàn toàn bằng Kotlin code, State Hoisting, Recomposition và Dark Mode tự động.',
        video_url: 'https://www.youtube.com/embed/F2ojC6TNwws',
        resource_url: 'https://developer.android.com/jetpack/compose'
      },
      {
        order: 3,
        title: 'Kiến trúc MVI / MVVM và Dependency Injection với Dagger Hilt',
        content: 'Tổ chức mã nguồn theo chuẩn công nghiệp: ViewModel, Repository, Use Cases, tiêm phụ thuộc sạch sẽ với annotations của Hilt.',
        video_url: 'https://www.youtube.com/embed/1XbHwR_vW7k',
        resource_url: 'https://developer.android.com/training/dependency-injection/hilt-android'
      },
      {
        order: 4,
        title: 'Lưu trữ CSDL Cục bộ với Room Database và DataStore',
        content: 'Tạo Entities, DAOs, định nghĩa quan hệ One-to-Many trong Room, lắng nghe thay đổi dữ liệu liên tục dưới dạng Flow stream.',
        video_url: 'https://www.youtube.com/embed/EN6Dx22cPRI',
        resource_url: 'https://developer.android.com/training/data-storage/room'
      },
      {
        order: 5,
        title: 'Kiểm thử Ứng dụng Android và Tối ưu Hóa Khởi động (App Startup)',
        content: 'Viết Unit Test với MockK, Compose UI Test với TestRule và phân tích hồ sơ bộ nhớ với Android Profiler.',
        video_url: 'https://www.youtube.com/embed/wX883L6N3t8',
        resource_url: 'https://developer.android.com/studio/profile'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Xây dựng Giao diện Danh sách Liên hệ với Jetpack Compose',
        description: 'Tạo màn hình danh bạ hỗ trợ tìm kiếm theo tên, cuộn danh sách mượt mà với LazyColumn và hiệu ứng hiển thị Material 3.',
        due_date: '2026-11-16 23:59:59'
      },
      {
        title: 'Bài tập 2: Tích hợp Room Database lưu trữ ghi chú cá nhân',
        description: 'Xây dựng ứng dụng Notes hoàn chỉnh với CRUD, lưu dữ liệu vào SQLite thông qua Room và truyền state về Compose qua ViewModel.',
        due_date: '2026-11-30 23:59:59'
      }
    ]
  },
  {
    title: 'Generative AI & LLM Application với LangChain & OpenAI API',
    description: 'Khám phá kỷ nguyên Trí tuệ Nhân tạo mới: Xây dựng Chatbot thông minh, Hệ thống RAG (Retrieval-Augmented Generation) và AI Agents tự hành.',
    instructor: 'Prof. Sarah Jenkins',
    category: 'Data Science & AI',
    price: 89.99,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Kỹ thuật Kỹ thuật Lời nhắc (Prompt Engineering) & OpenAI API',
        content: 'Nắm vững Few-shot Prompting, Chain-of-Thought, cấu hình temperature, max_tokens và gọi Structured Output với JSON schema.',
        video_url: 'https://www.youtube.com/embed/rfscVS0vtbw',
        resource_url: 'https://platform.openai.com/docs/'
      },
      {
        order: 2,
        title: 'Xây dựng Hệ thống RAG (Hỏi đáp Tài liệu Doanh nghiệp)',
        content: 'Trích xuất văn bản từ PDF, chia nhỏ Chunking tối ưu, tính toán Vector Embeddings và lưu trữ vào Vector DB (Chroma, Pinecone).',
        video_url: 'https://www.youtube.com/embed/dcqPhpY7tWk',
        resource_url: 'https://python.langchain.com/docs/use_cases/question_answering/'
      },
      {
        order: 3,
        title: 'Tạo AI Agents Tự hành với Tool Calling & LangGraph',
        content: 'Cho phép mô hình AI tự quyết định công cụ cần sử dụng: tìm kiếm Google, truy vấn cơ sở dữ liệu và tính toán toán học phức tạp.',
        video_url: 'https://www.youtube.com/embed/0B5eIE_1vpU',
        resource_url: 'https://langchain-ai.github.io/langgraph/'
      },
      {
        order: 4,
        title: 'Fine-Tuning Mô hình Mã nguồn mở (Llama 3, Mistral) với LoRA/QLoRA',
        content: 'Chuẩn bị tập dữ liệu huấn luyện tinh chỉnh, sử dụng thư viện Hugging Face Unsloth để huấn luyện trên GPU chi phí thấp.',
        video_url: 'https://www.youtube.com/embed/Wqmtf9SA_kk',
        resource_url: 'https://huggingface.co/docs/transformers/'
      },
      {
        order: 5,
        title: 'Bảo mật Ứng dụng LLM và Đánh giá Chất lượng với Ragas',
        content: 'Phòng chống tấn công Prompt Injection, Jailbreak và đo lường độ chính xác (Faithfulness, Answer Relevance) của RAG pipeline.',
        video_url: 'https://www.youtube.com/embed/2_lswM1S264',
        resource_url: 'https://docs.ragas.io/'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Xây dựng Chatbot Q&A Tài liệu PDF với LangChain & Vector Store',
        description: 'Tạo ứng dụng cho phép người dùng tải lên file tài liệu PDF hướng dẫn sử dụng và đặt câu hỏi để AI trả lời có trích dẫn nguồn.',
        due_date: '2026-11-18 23:59:59'
      },
      {
        title: 'Bài tập 2: Xây dựng AI Agent có khả năng tra cứu thời tiết và tính toán',
        description: 'Sử dụng LangChain Tools để trang bị cho mô hình khả năng gọi API thời tiết thực tế và máy tính giải toán.',
        due_date: '2026-12-02 23:59:59'
      }
    ]
  },
  {
    title: 'Data Engineering Toàn Diện với Apache Spark, Kafka & Big Data',
    description: 'Thiết kế hệ thống xử lý luồng dữ liệu khổng lồ (Real-time Stream Processing), Data Lakehouse với Delta Lake và lập lịch với Airflow.',
    instructor: 'Prof. Sarah Jenkins',
    category: 'Data Science & AI',
    price: 99.00,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Kiến trúc Data Lakehouse Hiện đại: Sự kết hợp Data Warehouse & Data Lake',
        content: 'Tìm hiểu kiến trúc Medallion (Bronze, Silver, Gold), ACID transactions trên tệp tin Parquet với Delta Lake và Apache Iceberg.',
        video_url: 'https://www.youtube.com/embed/DAQNHzOcO5A',
        resource_url: 'https://spark.apache.org/docs/latest/'
      },
      {
        order: 2,
        title: 'Xử lý Luồng Dữ liệu Thời gian Thực với Apache Kafka',
        content: 'Cấu trúc Producers, Consumers, Consumer Groups, Partitions và cơ chế đảm bảo Exactly-Once Semantics trong truyền thông sự kiện.',
        video_url: 'https://www.youtube.com/embed/e_kXz9vQ7F0',
        resource_url: 'https://kafka.apache.org/documentation/'
      },
      {
        order: 3,
        title: 'Tính toán Phân tán quy mô Lớn với Apache Spark & PySpark',
        content: 'Thực thi các phép biến đổi Transformations & Actions trên Resilient Distributed Datasets (RDDs) và DataFrames, tối ưu Shuffle & Memory Spill.',
        video_url: 'https://www.youtube.com/embed/dcqPhpY7tWk',
        resource_url: 'https://spark.apache.org/docs/latest/api/python/'
      },
      {
        order: 4,
        title: 'Xây dựng Luồng ETL Tự động hóa với Apache Airflow',
        content: 'Định nghĩa Directed Acyclic Graphs (DAGs) bằng Python, lập lịch chạy định kỳ, cấu hình Retry logic và thông báo cảnh báo lỗi tới Slack/Email.',
        video_url: 'https://www.youtube.com/embed/M988_fsOSWo',
        resource_url: 'https://airflow.apache.org/docs/'
      },
      {
        order: 5,
        title: 'Tối ưu hóa Chi phí và Quản trị Dữ liệu (Data Governance)',
        content: 'Giám sát chi phí lưu trữ Cloud Storage, theo dõi Data Lineage với OpenLineage và kiểm tra chất lượng dữ liệu với Great Expectations.',
        video_url: 'https://www.youtube.com/embed/Z3SYDTMP3ME',
        resource_url: 'https://greatexpectations.io/'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Xây dựng Pipeline Truyền Tin Real-time bằng Kafka & Python',
        description: 'Tạo ứng dụng producer giả lập gửi dữ liệu giao dịch tài chính liên tục vào Kafka Topic và consumer tổng hợp số liệu theo phút.',
        due_date: '2026-11-20 23:59:59'
      },
      {
        title: 'Bài tập 2: Lập lịch và Tự động hóa luồng ETL dữ liệu với Apache Airflow',
        description: 'Thiết kế DAG Airflow tự động kéo dữ liệu từ CSDL, chuyển đổi làm sạch và xuất báo cáo hàng ngày.',
        due_date: '2026-12-05 23:59:59'
      }
    ]
  },
  {
    title: 'Xử lý Ngôn ngữ Tự nhiên (NLP) Chuyên sâu với Transformers & BERT',
    description: 'Từ Tokenization đến Fine-tuning mô hình ngôn ngữ lớn: Phân loại văn bản, Nhận diện thực thể (NER), Tóm tắt văn bản và Dịch máy.',
    instructor: 'Prof. Sarah Jenkins',
    category: 'Data Science & AI',
    price: 85.00,
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Từ Cơ bản đến Cơ chế Attention & Kiến trúc Transformer',
        content: 'Hiểu cặn kẽ Self-Attention, Multi-Head Attention, Positional Encoding và lý do Transformer vượt trội hoàn toàn so với RNN/LSTM.',
        video_url: 'https://www.youtube.com/embed/rfscVS0vtbw',
        resource_url: 'https://arxiv.org/abs/1706.03762'
      },
      {
        order: 2,
        title: 'Tokenization Hiện đại: BPE, WordPiece & Thư viện Hugging Face',
        content: 'Thực hành với thư viện tokenizers và transformers, xử lý padding, truncation, attention masks cho dữ liệu văn bản tiếng Việt và tiếng Anh.',
        video_url: 'https://www.youtube.com/embed/0B5eIE_1vpU',
        resource_url: 'https://huggingface.co/docs/transformers/tokenizer_summary'
      },
      {
        order: 3,
        title: 'Phân loại Cảm xúc Văn bản (Sentiment Analysis) với PhoBERT',
        content: 'Fine-tune mô hình PhoBERT tiền huấn luyện dành riêng cho tiếng Việt để phân loại đánh giá bình luận khách hàng tích cực/tiêu cực.',
        video_url: 'https://www.youtube.com/embed/Wqmtf9SA_kk',
        resource_url: 'https://github.com/VinAIResearch/PhoBERT'
      },
      {
        order: 4,
        title: 'Nhận diện Thực thể có Tên (Named Entity Recognition - NER)',
        content: 'Xây dựng mô hình tự động trích xuất tên người, địa điểm, tổ chức, ngày tháng từ văn bản hợp đồng pháp lý.',
        video_url: 'https://www.youtube.com/embed/dcqPhpY7tWk',
        resource_url: 'https://spacy.io/usage/linguistic-features#named-entities'
      },
      {
        order: 5,
        title: 'Tóm tắt Văn bản Tự động với BART và T5 Encoder-Decoder',
        content: 'Huấn luyện và đánh giá mô hình tóm tắt bài báo bằng điểm ROUGE score, tối ưu tốc độ sinh từ bằng Beam Search.',
        video_url: 'https://www.youtube.com/embed/DAQNHzOcO5A',
        resource_url: 'https://huggingface.co/docs/transformers/model_doc/bart'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Xây dựng Mô hình Phân loại Đánh giá Sản phẩm với Hugging Face',
        description: 'Sử dụng mô hình Transformer có sẵn để phân loại 5,000 nhận xét của người dùng thành 3 cấp độ hài lòng với độ chính xác trên 88%.',
        due_date: '2026-11-22 23:59:59'
      },
      {
        title: 'Bài tập 2: Trích xuất Thông tin Thực thể từ Hồ sơ Ứng viên (CV Parser)',
        description: 'Xây dựng pipeline NER trích xuất kỹ năng, năm kinh nghiệm và trường đại học từ văn bản tóm tắt hồ sơ xin việc.',
        due_date: '2026-12-08 23:59:59'
      }
    ]
  },
  {
    title: 'DevOps Thực Chiến: Tự Động Hóa CI/CD với GitLab CI & GitHub Actions',
    description: 'Xây dựng quy trình tự động hóa kiểm thử mã nguồn, quét lỗ hổng bảo mật, đóng gói container và triển khai không gián đoạn (Zero-Downtime Deploy).',
    instructor: 'Đặng Hoàng Nam',
    category: 'DevOps & Cloud',
    price: 59.00,
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Nguyên lý CI/CD và Thiết lập Pipeline đầu tiên với GitHub Actions',
        content: 'Cấu trúc Workflows, Triggers, Jobs, Steps, Runners và quản lý biến bí mật an toàn với GitHub Secrets.',
        video_url: 'https://www.youtube.com/embed/n4p_O10v7p4',
        resource_url: 'https://docs.github.com/en/actions'
      },
      {
        order: 2,
        title: 'Tự động Hóa Kiểm thử Đơn vị & Quét Mã Tĩnh (SAST / SonarQube)',
        content: 'Chặn đứng lỗi code từ sớm: tích hợp linter, format check, unit test và đo lường mã độc với SonarCloud trước khi cho phép Merge Request.',
        video_url: 'https://www.youtube.com/embed/7H_QH9nipNs',
        resource_url: 'https://www.sonarsource.com/products/sonarqube/'
      },
      {
        order: 3,
        title: 'Tối ưu hóa Build Docker Image & Quét Lỗ Hổng Bảo Mật Container',
        content: 'Multi-stage build giúp giảm kích thước image từ 1GB xuống dưới 50MB, quét lỗ hổng CVE với Trivy trước khi push lên Docker Hub.',
        video_url: 'https://www.youtube.com/embed/EN6Dx22cPRI',
        resource_url: 'https://aquasecurity.github.io/trivy/'
      },
      {
        order: 4,
        title: 'Chiến lược Triển khai Hiện đại: Rolling, Blue-Green & Canary Deployments',
        content: 'So sánh các chiến thuật cập nhật phiên bản mới, giảm thiểu rủi ro sự cố và kỹ thuật rollback tức thời khi phát hiện lỗi.',
        video_url: 'https://www.youtube.com/embed/M988_fsOSWo',
        resource_url: 'https://martinfowler.com/bliki/BlueGreenDeployment.html'
      },
      {
        order: 5,
        title: 'Xây dựng Pipeline CI/CD phức tạp nhiều môi trường (Dev, Staging, Prod)',
        content: 'Phê duyệt triển khai thủ công (Manual Approval Gate), thông báo trạng thái deployment qua Slack/Telegram Webhooks.',
        video_url: 'https://www.youtube.com/embed/Z3SYDTMP3ME',
        resource_url: 'https://docs.gitlab.com/ee/ci/'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Xây dựng GitHub Actions Pipeline kiểm thử và đóng gói Docker',
        description: 'Tạo workflow kích hoạt khi có Pull Request, chạy kiểm thử tự động, build Docker image và gắn thẻ phiên bản theo semantic version.',
        due_date: '2026-11-25 23:59:59'
      },
      {
        title: 'Bài tập 2: Thiết lập Tự động Triển khai Blue-Green trên máy chủ Cloud',
        description: 'Cấu hình kịch bản triển khai không downtime với NGINX reverse proxy chuyển hướng traffic giữa hai phiên bản container.',
        due_date: '2026-12-10 23:59:59'
      }
    ]
  },
  {
    title: 'Quản Trị Cụm Kubernetes Chuyên Sâu & GitOps với ArgoCD',
    description: 'Chinh phục Kubernetes trong môi trường sản xuất: Ingress Controller, Helm Charts, HPA Auto-scaling, Giám sát Prometheus/Grafana và ArgoCD.',
    instructor: 'Đặng Hoàng Nam',
    category: 'DevOps & Cloud',
    price: 75.00,
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Kiến trúc Cụm Kubernetes: Control Plane, Worker Nodes & Networking',
        content: 'Hiểu sâu về kube-apiserver, etcd, kube-scheduler, kube-proxy, CNI plugins và cơ chế phân giải DNS CoreDNS bên trong cụm.',
        video_url: 'https://www.youtube.com/embed/6XvQy5w4Fjo',
        resource_url: 'https://kubernetes.io/docs/concepts/'
      },
      {
        order: 2,
        title: 'Đóng gói Ứng dụng K8s với Helm Charts & Kustomize',
        content: 'Quản lý cấu hình nhiều môi trường linh hoạt, định nghĩa template manifests, versioning và quản lý phụ thuộc Helm sub-charts.',
        video_url: 'https://www.youtube.com/embed/qUvLh0qK_L4',
        resource_url: 'https://helm.sh/docs/'
      },
      {
        order: 3,
        title: 'Triển khai Tự Động Hóa theo Mô Hình GitOps với ArgoCD',
        content: 'Biến Git thành nguồn chân lý duy nhất (Single Source of Truth), ArgoCD tự động phát hiện lệch lạc cấu hình và đồng bộ tức thì.',
        video_url: 'https://www.youtube.com/embed/n4p_O10v7p4',
        resource_url: 'https://argo-cd.readthedocs.io/'
      },
      {
        order: 4,
        title: 'Tự Động Co Giãn Tải (HPA, VPA) & Quản Lý Tài Nguyên Cluster',
        content: 'Thiết lập Requests & Limits, cấu hình Horizontal Pod Autoscaler dựa trên CPU, Memory và Custom Metrics (Requests per second).',
        video_url: 'https://www.youtube.com/embed/M988_fsOSWo',
        resource_url: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/'
      },
      {
        order: 5,
        title: 'Giám Sát Toàn Diện Hệ Thống với Prometheus, Grafana & Loki',
        content: 'Cài đặt Prometheus Operator, thu thập metrics ứng dụng, thiết kế Dashboard giám sát trên Grafana và cảnh báo Alertmanager.',
        video_url: 'https://www.youtube.com/embed/Z3SYDTMP3ME',
        resource_url: 'https://prometheus.io/docs/introduction/overview/'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Viết Helm Chart hoàn chỉnh cho ứng dụng Full-Stack 3 Tầng',
        description: 'Tạo Helm chart gồm Frontend, Backend và CSDL MySQL với các file values dev và prod riêng biệt.',
        due_date: '2026-11-27 23:59:59'
      },
      {
        title: 'Bài tập 2: Cấu hình Tự động Đồng bộ Ứng dụng K8s bằng ArgoCD',
        description: 'Kết nối ArgoCD với kho lưu trữ Git chứa Helm manifests và kiểm tra tính năng tự khôi phục khi có thay đổi cấu hình thủ công.',
        due_date: '2026-12-12 23:59:59'
      }
    ]
  },
  {
    title: 'Terraform & Quản Lý Hạ Tầng Dưới Dạng Mã (IaC) Đa Đám Mây',
    description: 'Tự động hóa hoàn toàn việc khởi tạo máy chủ, mạng VPC, cơ sở dữ liệu và bảo mật trên AWS và Google Cloud bằng Terraform HCL.',
    instructor: 'Đặng Hoàng Nam',
    category: 'DevOps & Cloud',
    price: 49.00,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Nền tảng Terraform: HCL Syntax, Providers & Quản lý State File',
        content: 'Tìm hiểu vòng đời terraform init, plan, apply, destroy và tầm quan trọng của việc lưu trữ Remote State trên AWS S3 với DynamoDB Lock.',
        video_url: 'https://www.youtube.com/embed/M988_fsOSWo',
        resource_url: 'https://developer.hashicorp.com/terraform/docs'
      },
      {
        order: 2,
        title: 'Xây dựng Mạng Virtual Private Cloud (VPC) Chuẩn Production trên AWS',
        content: 'Định nghĩa Public Subnets, Private Subnets, Internet Gateway, NAT Gateway và Route Tables tách biệt an toàn.',
        video_url: 'https://www.youtube.com/embed/Z3SYDTMP3ME',
        resource_url: 'https://registry.terraform.io/providers/hashicorp/aws/latest/docs'
      },
      {
        order: 3,
        title: 'Tổ chức Mã nguồn Tái sử dụng với Terraform Modules',
        content: 'Viết module chuẩn cho EC2 Instance, RDS Database, ALB Load Balancer với các biến Input Variables và Outputs rõ ràng.',
        video_url: 'https://www.youtube.com/embed/e_kXz9vQ7F0',
        resource_url: 'https://developer.hashicorp.com/terraform/language/modules'
      },
      {
        order: 4,
        title: 'Kiểm thử Hạ tầng và Quản lý Secrets với HashiCorp Vault',
        content: 'Tích hợp tfsec quét lỗ hổng bảo mật hạ tầng và sử dụng HashiCorp Vault để cấp phát thông tin đăng nhập tự động.',
        video_url: 'https://www.youtube.com/embed/EN6Dx22cPRI',
        resource_url: 'https://aquasecurity.github.io/tfsec/'
      },
      {
        order: 5,
        title: 'Tự động hóa Terraform trong CI/CD Pipeline (Terraform Cloud & Atlantis)',
        content: 'Cấu hình Atlantis tự động chạy terraform plan và bình luận kết quả trực tiếp lên Pull Request của GitHub/GitLab.',
        video_url: 'https://www.youtube.com/embed/n4p_O10v7p4',
        resource_url: 'https://www.runatlantis.io/'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Xây dựng Module Terraform khởi tạo Máy chủ Web có Load Balancer',
        description: 'Tạo mã Terraform dựng Application Load Balancer trỏ về nhóm máy chủ EC2 tự động phân phối tải.',
        due_date: '2026-11-29 23:59:59'
      },
      {
        title: 'Bài tập 2: Thiết lập Remote State S3 an toàn có mã hóa và khóa DynamoDB',
        description: 'Cấu hình backend S3 với KMS encryption và DynamoDB table để chống xung đột ghi đè state đồng thời giữa nhiều kỹ sư.',
        due_date: '2026-12-15 23:59:59'
      }
    ]
  },
  {
    title: 'Xây Dựng Design System & Micro-interactions Chuyên Nghiệp Với Figma',
    description: 'Từ nguyên lý Thiết kế Nguyên tử (Atomic Design) đến xây dựng Design Token, Auto-Layout linh hoạt, Component Variants và Micro-animations sống động.',
    instructor: 'Nguyễn Hà Linh',
    category: 'UI/UX Design & Product',
    price: 39.99,
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Nguyên lý Atomic Design & Cấu trúc Thư viện Thiết kế',
        content: 'Phân cấp Atoms, Molecules, Organisms, Templates và Pages để xây dựng hệ thống giao diện nhất quán cho toàn bộ công ty.',
        video_url: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
        resource_url: 'https://atomicdesign.bradfrost.com/'
      },
      {
        order: 2,
        title: 'Làm chủ Design Tokens & Biến Figma Variables (Color, Spacing, Typography)',
        content: 'Tạo biến số Theme Mode (Light / Dark), Responsive Breakpoint tokens giúp đồng bộ hóa trực tiếp với lập trình viên Frontend.',
        video_url: 'https://www.youtube.com/embed/FTFaQWZBqQ8',
        resource_url: 'https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma'
      },
      {
        order: 3,
        title: 'Auto-Layout Nâng Cao, Min/Max Width và Component Properties',
        content: 'Thiết kế card, form, navbar tự động co giãn thông minh thích ứng mọi kích thước màn hình mà không bị méo lệch giao diện.',
        video_url: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
        resource_url: 'https://help.figma.com/hc/en-us/articles/360040451373-Explore-autolayout-properties'
      },
      {
        order: 4,
        title: 'Micro-interactions & Interactive Components với Smart Animate',
        content: 'Tạo các tương tác vi mô tinh tế: Button hover, Toggle switch, Animated loader, Dropdown accordion với đường cong Bézier mượt mà.',
        video_url: 'https://www.youtube.com/embed/FTFaQWZBqQ8',
        resource_url: 'https://help.figma.com/hc/en-us/articles/360039818874-Create-smart-animations'
      },
      {
        order: 5,
        title: 'Quy trình Bàn giao Thiết kế (Design Handoff) & Figma to Code',
        content: 'Sử dụng Figma Dev Mode, gắn nhãn tài nguyên, xuất icon SVG tối ưu và tài liệu hóa quy chuẩn cho đội ngũ Frontend.',
        video_url: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
        resource_url: 'https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Xây dựng Thư viện Component Input & Button với Variants',
        description: 'Tạo component Button và Input đầy đủ các trạng thái (Default, Hover, Active, Disabled, Error) sử dụng Figma Variables.',
        due_date: '2026-11-10 23:59:59'
      },
      {
        title: 'Bài tập 2: Thiết kế Prototype Tương Tác Giỏ Hàng với Smart Animate',
        description: 'Tạo nguyên mẫu di động có hiệu ứng thêm sản phẩm vào giỏ, mở drawer cart và chuyển đổi số lượng mượt mà.',
        due_date: '2026-11-24 23:59:59'
      }
    ]
  },
  {
    title: 'Product Management & Chiến Lược Phát Triển Sản Phẩm Công Nghệ',
    description: 'Nắm vững tư duy Product Manager hiện đại: Từ thấu hiểu khách hàng, xây dựng Product Roadmap, phân tích chỉ số North Star đến Agile Scrum.',
    instructor: 'Nguyễn Hà Linh',
    category: 'UI/UX Design & Product',
    price: 59.99,
    thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Chân dung Product Manager Hiện đại & Vòng đời Sản phẩm (Product Life Cycle)',
        content: 'Vai trò của PM ở giao điểm giữa Công nghệ, Kinh doanh và Người dùng; phương pháp nhận diện vấn đề thực sự của thị trường.',
        video_url: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
        resource_url: 'https://www.mindtheproduct.com/'
      },
      {
        order: 2,
        title: 'Nghiên cứu Người dùng (User Research) & Phỏng vấn Khám phá Sản phẩm',
        content: 'Kỹ thuật đặt câu hỏi phỏng vấn theo phương pháp The Mom Test, xây dựng Persona và bản đồ hành trình người dùng (User Journey Map).',
        video_url: 'https://www.youtube.com/embed/FTFaQWZBqQ8',
        resource_url: 'https://www.nngroup.com/articles/user-journey-mapping/'
      },
      {
        order: 3,
        title: 'Ưu tiên Tính năng Sản phẩm: RICE, Kano & MoSCoW Frameworks',
        content: 'Cách thức định lượng điểm ưu tiên giữa hàng trăm yêu cầu tính năng từ khách hàng, ban giám đốc và đội ngũ kinh doanh.',
        video_url: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
        resource_url: 'https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/'
      },
      {
        order: 4,
        title: 'Xây dựng Product Requirements Document (PRD) & User Stories Chuẩn',
        content: 'Soạn thảo tài liệu đặc tả yêu cầu sản phẩm súc tích, viết User Stories và tiêu chí nghiệm thu Acceptance Criteria rõ ràng cho kỹ sư.',
        video_url: 'https://www.youtube.com/embed/FTFaQWZBqQ8',
        resource_url: 'https://productschool.com/blog/product-management-2/product-requirements-document-prd'
      },
      {
        order: 5,
        title: 'Đo lường Thành công với Chỉ số North Star, Churn Rate & A/B Testing',
        content: 'Thiết lập phễu chuyển đổi (Conversion Funnel), chỉ số giữ chân người dùng (Retention Cohort) và đưa ra quyết định dựa trên dữ liệu số.',
        video_url: 'https://www.youtube.com/embed/DAQNHzOcO5A',
        resource_url: 'https://amplitude.com/north-star'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Soạn thảo Tài liệu PRD cho Tính năng Chia sẻ Đơn hàng Nhóm',
        description: 'Viết tài liệu PRD hoàn chỉnh gồm: bối cảnh thị trường, mục tiêu kinh doanh, User Persona, danh sách User Stories và rủi ro kỹ thuật.',
        due_date: '2026-11-15 23:59:59'
      },
      {
        title: 'Bài tập 2: Phân tích Chỉ số Phễu Chuyển đổi và Đề xuất Thử nghiệm A/B',
        description: 'Dựa trên tập dữ liệu số liệu người dùng bỏ rơi giỏ hàng, phân tích nguyên nhân và thiết kế thử nghiệm A/B để cải thiện tỷ lệ mua.',
        due_date: '2026-12-01 23:59:59'
      }
    ]
  },
  {
    title: 'Kiểm Thử Xâm Nhập Web & Khai Thác Lỗ Hổng Thực Chiến (PenTest)',
    description: 'Thực hành tấn công và phòng thủ chuyên sâu: Khai thác SQL Injection nâng cao, SSRF, IDOR, deserialization và bypass WAF với Burp Suite Pro.',
    instructor: 'Vũ Hải Đăng',
    category: 'Cyber Security',
    price: 89.00,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Thu thập Thông tin Mục tiêu (Reconnaissance & OSINT)',
        content: 'Sử dụng Sublist3r, Amass, Shodan, Nmap để quét mở rộng bề mặt tấn công, phát hiện cổng mở và phiên bản phần mềm nhạy cảm.',
        video_url: 'https://www.youtube.com/embed/2_lswM1S264',
        resource_url: 'https://owasp.org/www-project-web-security-testing-guide/'
      },
      {
        order: 2,
        title: 'Khai thác Lỗ hổng Logic Nghiệp vụ & IDOR (Insecure Direct Object Reference)',
        content: 'Phát hiện lỗ hổng phân quyền chiều ngang (Horizontal Privilege Escalation) và chiều dọc (Vertical) qua thao tác API requests.',
        video_url: 'https://www.youtube.com/embed/bW8y_1wYx78',
        resource_url: 'https://portswigger.net/web-security/access-control'
      },
      {
        order: 3,
        title: 'Tấn công Phía Máy chủ: SSRF, RCE và File Upload Vulnerabilities',
        content: 'Kỹ thuật khai thác Server-Side Request Forgery để truy cập tài nguyên nội bộ Cloud Metadata (169.254.169.254) và chiếm quyền shell máy chủ.',
        video_url: 'https://www.youtube.com/embed/2_lswM1S264',
        resource_url: 'https://portswigger.net/web-security/ssrf'
      },
      {
        order: 4,
        title: 'Bảo mật API & Khai thác Lỗ hổng JWT Token (Algorithm Confusion)',
        content: 'Thử nghiệm giả mạo token với None algorithm, bẻ khóa bí mật JWT yếu và tấn công đánh cắp phiên làm việc.',
        video_url: 'https://www.youtube.com/embed/mbsmsi7l3r4',
        resource_url: 'https://portswigger.net/web-security/jwt'
      },
      {
        order: 5,
        title: 'Viết Báo cáo Lỗ hổng Tiêu chuẩn CVSS v3 và Biện pháp Khắc phục',
        content: 'Soạn thảo báo cáo kiểm thử bảo mật chuyên nghiệp theo chuẩn quốc tế, đánh giá rủi ro kinh doanh và hướng dẫn lập trình viên sửa code an toàn.',
        video_url: 'https://www.youtube.com/embed/2_lswM1S264',
        resource_url: 'https://www.first.org/cvss/'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Khai thác và Vá Lỗ hổng IDOR trên Hệ thống Demo',
        description: 'Tìm kiếm điểm yếu trong API cập nhật thông tin tài khoản, khai thác đọc dữ liệu người dùng khác và viết đoạn code middleware sửa lỗi.',
        due_date: '2026-11-19 23:59:59'
      },
      {
        title: 'Bài tập 2: Thực hiện Đánh giá Toàn diện Ứng dụng Web theo Chuẩn OWASP',
        description: 'Sử dụng Burp Suite để rà quét và viết báo cáo kiểm thử an toàn thông tin gồm tối thiểu 3 lỗ hổng bảo mật tìm được.',
        due_date: '2026-12-06 23:59:59'
      }
    ]
  },
  {
    title: 'SOC Analyst Thực Chiến: Điều Tra Sự Cố & Phân Tích Mã Độc',
    description: 'Làm chủ công cụ SIEM (Splunk, Elastic SIEM), kỹ thuật phân tích gói tin Wireshark, điều tra vết tấn công số (Digital Forensics) và phản ứng sự cố.',
    instructor: 'Vũ Hải Đăng',
    category: 'Cyber Security',
    price: 95.00,
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60',
    status: 'published',
    lessons: [
      {
        order: 1,
        title: 'Tổng quan Vận hành Trung tâm Điều hành An ninh Mạng (SOC)',
        content: 'Cấu trúc các tầng Tier 1 Triage, Tier 2 Incident Response, Tier 3 Threat Hunting; ma trận MITRE ATT&CK và quy trình xử lý sự cố NIST.',
        video_url: 'https://www.youtube.com/embed/2_lswM1S264',
        resource_url: 'https://attack.mitre.org/'
      },
      {
        order: 2,
        title: 'Truy vấn & Phân tích Nhật ký (Log Analysis) với Splunk / Elastic SIEM',
        content: 'Viết câu lệnh SPL (Search Processing Language) để phát hiện hành vi Brute Force, tấn công dò quét cổng và truy cập cơ sở dữ liệu bất thường.',
        video_url: 'https://www.youtube.com/embed/bW8y_1wYx78',
        resource_url: 'https://docs.splunk.com/'
      },
      {
        order: 3,
        title: 'Phân tích Giao thức Mạng với Wireshark & Network Forensics',
        content: 'Phát hiện mã độc giao tiếp với máy chủ chỉ huy (C2 Server), phân tích luồng dữ liệu DNS Tunneling và trích xuất tệp tin độc hại từ file PCAP.',
        video_url: 'https://www.youtube.com/embed/2_lswM1S264',
        resource_url: 'https://www.wireshark.org/docs/'
      },
      {
        order: 4,
        title: 'Phân tích Mã độc Cơ bản (Static & Dynamic Malware Analysis)',
        content: 'Sử dụng môi trường Sandbox cách ly an toàn, phân tích mã hash, strings, pe-headers và quan sát hành vi thay đổi Registry / File System.',
        video_url: 'https://www.youtube.com/embed/2_lswM1S264',
        resource_url: 'https://any.run/'
      },
      {
        order: 5,
        title: 'Quy trình Ứng phó Sự cố (Incident Handling) & Cách ly Độc quyền',
        content: 'Cách ly máy chủ nhiễm độc khỏi mạng nội bộ, thu thập bằng chứng RAM dump, phục hồi dữ liệu từ bản sao lưu và tổng kết bài học kinh nghiệm.',
        video_url: 'https://www.youtube.com/embed/bW8y_1wYx78',
        resource_url: 'https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final'
      }
    ],
    assignments: [
      {
        title: 'Bài tập 1: Phân tích File PCAP truy bắt Hành vi C2 Communication',
        description: 'Mở file nhật ký mạng trong Wireshark, xác định địa chỉ IP máy nạn nhân, tên miền C2 độc hại và giao thức truyền tải.',
        due_date: '2026-11-21 23:59:59'
      },
      {
        title: 'Bài tập 2: Xây dựng Quy tắc Cảnh báo (Alert Rule) trên Splunk SIEM',
        description: 'Viết truy vấn SPL phát hiện ít nhất 5 lần đăng nhập SSH thất bại liên tiếp sau đó đăng nhập thành công trong vòng 2 phút.',
        due_date: '2026-12-10 23:59:59'
      }
    ]
  }
];

// Additional assignments for existing courses (courses 1 to 9)
const existingCoursesAssignments = [
  // Course 1: Full-Stack Web Development
  {
    course_id: 1,
    title: 'Bài tập 3: Xây dựng Hệ thống Xác thực JWT và Phân quyền Role trên Express',
    description: 'Hoàn thiện luồng đăng ký, đăng nhập với mật khẩu mã hóa bcrypt, sinh JWT token và middleware bảo vệ router theo role học viên và giáo viên.',
    due_date: '2026-11-12 23:59:59'
  },
  // Course 2: Python for Data Science
  {
    course_id: 2,
    title: 'Bài tập 3: Xây dựng Mô hình Phân loại Khách hàng Tiềm năng với Scikit-Learn',
    description: 'Sử dụng thuật toán Random Forest Classifier để dự đoán tỷ lệ rời bỏ (Churn Rate) của người dùng từ tập dữ liệu viễn thông.',
    due_date: '2026-11-15 23:59:59'
  },
  // Course 3: iOS & Swift Bootcamp for Beginners
  {
    course_id: 3,
    title: 'Bài tập 1: Thiết kế Giao diện Ứng dụng Thời tiết Đẹp mắt với SwiftUI',
    description: 'Xây dựng layout hiển thị dự báo thời tiết 7 ngày với hiệu ứng nền Gradient, custom SF Symbols và hỗ trợ màn hình ngang/dọc.',
    due_date: '2026-11-04 23:59:59'
  },
  {
    course_id: 3,
    title: 'Bài tập 2: Tích hợp API OpenWeatherMap với URLSession và Async/Await',
    description: 'Gọi API thời tiết theo vị trí người dùng, parse JSON vào Swift Codable struct và hiển thị dữ liệu nhiệt độ, độ ẩm theo thời gian thực.',
    due_date: '2026-11-18 23:59:59'
  },
  // Course 4: Introduction to Cloud Computing & AWS Services
  {
    course_id: 4,
    title: 'Bài tập 1: Khởi tạo Máy ảo EC2 Linux và Cấu hình Máy chủ NGINX',
    description: 'Tạo máy ảo Ubuntu trên AWS EC2, mở cổng 80/443 trong Security Group, cài đặt NGINX và cấu hình trỏ tên miền về máy ảo.',
    due_date: '2026-11-06 23:59:59'
  },
  {
    course_id: 4,
    title: 'Bài tập 2: Lưu trữ và Phân phối Tệp Tĩnh với AWS S3 Bucket & CloudFront',
    description: 'Tạo S3 bucket bảo mật không công khai trực tiếp, kết nối CloudFront CDN và thiết lập chứng chỉ SSL miễn phí từ AWS Certificate Manager.',
    due_date: '2026-11-20 23:59:59'
  },
  // Course 5: Modern UI/UX Design with Figma
  {
    course_id: 5,
    title: 'Bài tập 1: Xây dựng Bảng Màu và Hệ thống Typography trong Figma',
    description: 'Tạo bảng màu Semantic Colors (Primary, Secondary, Success, Warning, Error) và cấp bậc phông chữ từ Heading 1 đến Body Caption.',
    due_date: '2026-11-08 23:59:59'
  },
  {
    course_id: 5,
    title: 'Bài tập 2: Thiết kế Prototype Ứng dụng Đặt Món Ăn Hoàn Chỉnh',
    description: 'Dựng wireframe và visual design cho 4 màn hình: Trang chủ, Danh mục món ăn, Chi tiết món và Thanh toán với Auto-Layout.',
    due_date: '2026-11-22 23:59:59'
  },
  // Course 6: Docker & Kubernetes: Practical Containerization
  {
    course_id: 6,
    title: 'Bài tập 1: Đóng gói Ứng dụng Web Đa Dịch vụ với Docker Compose',
    description: 'Viết docker-compose.yml khởi chạy đồng thời Node.js app, MySQL database và Redis cache, thiết lập Network và Volume lưu trữ bền vững.',
    due_date: '2026-11-09 23:59:59'
  },
  {
    course_id: 6,
    title: 'Bài tập 2: Triển khai Ứng dụng lên Cụm Kubernetes Cục bộ (Minikube / K3s)',
    description: 'Viết Kubernetes Deployment, Service ClusterIP, Ingress manifest và cấu hình ConfigMap / Secret an toàn.',
    due_date: '2026-11-23 23:59:59'
  },
  // Course 7: Advanced React 18: Performance & Architecture
  {
    course_id: 7,
    title: 'Bài tập 1: Tối ưu Render và Xử lý Trạng thái Lớn với React DevTools Profiler',
    description: 'Xác định các component bị re-render dư thừa trong danh sách 10,000 phần tử và áp dụng React.memo, useMemo, useCallback tối ưu về 60 FPS.',
    due_date: '2026-11-11 23:59:59'
  },
  {
    course_id: 7,
    title: 'Bài tập 2: Xây dựng Thư viện Custom Hooks Quản lý Dữ liệu Bất đồng bộ',
    description: 'Tự viết hook useFetchData hỗ trợ caching, retry tự động khi rớt mạng, debounce tìm kiếm và abort controller hủy request cũ.',
    due_date: '2026-11-25 23:59:59'
  },
  // Course 8: Deep Learning & Computer Vision with PyTorch
  {
    course_id: 8,
    title: 'Bài tập 1: Xây dựng Mạng CNN Phân loại Ảnh Chó và Mèo',
    description: 'Sử dụng PyTorch xây dựng kiến trúc mạng tích chập gồm Conv2d, BatchNorm, MaxPool2d, huấn luyện trên tập dữ liệu và đạt accuracy trên 90%.',
    due_date: '2026-11-13 23:59:59'
  },
  {
    course_id: 8,
    title: 'Bài tập 2: Áp dụng Transfer Learning với ResNet-50 cho Nhận diện Hoa Quả',
    description: 'Tận dụng trọng số tiền huấn luyện của ResNet-50, tinh chỉnh tầng fully connected cuối cùng và đánh giá bằng F1-score.',
    due_date: '2026-11-27 23:59:59'
  },
  // Course 9: Ethical Hacking & Web Application Security
  {
    course_id: 9,
    title: 'Bài tập 1: Phát hiện và Khai thác Lỗ hổng SQL Injection trên Môi trường Lab',
    description: 'Sử dụng SQLMap và thao tác thủ công để khai thác lỗ hổng Blind SQL Injection, trích xuất cấu trúc cơ sở dữ liệu mẫu trong lab an toàn.',
    due_date: '2026-11-14 23:59:59'
  },
  {
    course_id: 9,
    title: 'Bài tập 2: Phòng thủ Toàn diện Chống Lỗ hổng Cross-Site Scripting (XSS)',
    description: 'Phân tích mã nguồn bị hổng Stored XSS, áp dụng Content Security Policy (CSP) chặt chẽ và cơ chế làm sạch HTML (DOMPurify) để khắc phục.',
    due_date: '2026-11-28 23:59:59'
  }
];

// Additional lessons for existing courses 6 to 9 (currently only have 4 lessons each, expand to 6)
const extraLessonsForExistingCourses = [
  // Course 6: Docker & Kubernetes (lessons 5, 6)
  {
    course_id: 6,
    lesson_order: 5,
    title: 'Quản lý Dữ liệu Bền vững với Persistent Volumes (PV & PVC)',
    content: 'Tìm hiểu cách Kubernetes tách rời lưu trữ và tính toán: Khởi tạo StorageClass, cấp phát tự động PersistentVolumeClaim cho CSDL StatefulSet.',
    video_url: 'https://www.youtube.com/embed/M988_fsOSWo',
    resource_url: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/'
  },
  {
    course_id: 6,
    lesson_order: 6,
    title: 'Bảo mật Cụm K8s với Network Policies và RBAC Phân quyền',
    content: 'Thiết lập NetworkPolicy chặn lưu lượng truy cập trái phép giữa các Namespace, tạo ServiceAccount và gán quyền RoleBinding nghiêm ngặt.',
    video_url: 'https://www.youtube.com/embed/2_lswM1S264',
    resource_url: 'https://kubernetes.io/docs/concepts/security/'
  },
  // Course 7: Advanced React 18 (lessons 5, 6)
  {
    course_id: 7,
    lesson_order: 5,
    title: 'Mô hình React Server Components (RSC) & Streaming SSR',
    content: 'Hiểu bản chất của React Server Components, Suspense boundary cho Streaming SSR và cơ chế Hydration từng phần giúp tăng điểm Web Vitals.',
    video_url: 'https://www.youtube.com/embed/SqcY0GlETPk',
    resource_url: 'https://react.dev/reference/rsc/server-components'
  },
  {
    course_id: 7,
    lesson_order: 6,
    title: 'Micro-Frontend Architecture: Chia nhỏ Ứng dụng React Lớn',
    content: 'Áp dụng Module Federation với Webpack/Vite để ghép nối nhiều ứng dụng React độc lập thành một hệ thống portal duy nhất mà không xung đột mã.',
    video_url: 'https://www.youtube.com/embed/n4p_O10v7p4',
    resource_url: 'https://module-federation.io/'
  },
  // Course 8: Deep Learning & Computer Vision (lessons 5, 6)
  {
    course_id: 8,
    lesson_order: 5,
    title: 'Nhận diện Vật thể Thời gian Thực với Mô hình YOLOv8',
    content: 'Tìm hiểu cơ chế Single-Shot Detection, chuẩn bị tập dữ liệu nhãn Bounding Box với Roboflow và huấn luyện mô hình YOLOv8 phát hiện vật thể.',
    video_url: 'https://www.youtube.com/embed/0B5eIE_1vpU',
    resource_url: 'https://docs.ultralytics.com/'
  },
  {
    course_id: 8,
    lesson_order: 6,
    title: 'Phân vùng Hình ảnh Ngữ nghĩa (Semantic Segmentation) với U-Net',
    content: 'Kiến trúc mạng U-Net với Skip Connections, ứng dụng phân vùng hình ảnh y tế (chụp X-quang, MRI) và đo lường bằng chỉ số IoU và Dice coefficient.',
    video_url: 'https://www.youtube.com/embed/Wqmtf9SA_kk',
    resource_url: 'https://pytorch.org/hub/mateuszbuda_brain-segmentation-pytorch_unet/'
  },
  // Course 9: Ethical Hacking & Web Security (lessons 5, 6)
  {
    course_id: 9,
    lesson_order: 5,
    title: 'Tấn công Xác thực & Cơ chế Quản lý Phiên (Session Hijacking)',
    content: 'Tìm hiểu cách tin tặc đánh cắp session ID thông qua XSS, tấn công Cross-Site Request Forgery (CSRF) và cấu hình cờ SameSite, HttpOnly an toàn.',
    video_url: 'https://www.youtube.com/embed/mbsmsi7l3r4',
    resource_url: 'https://owasp.org/www-community/attacks/Session_fixation'
  },
  {
    course_id: 9,
    lesson_order: 6,
    title: 'Bảo vệ Cơ sở Hạ tầng Web với Cloudflare WAF & Rate Limiting',
    content: 'Triển khai tường lửa ứng dụng web Cloudflare, cấu hình quy tắc chống tấn công DDoS, giới hạn tần suất request (Rate Limiting) và ẩn IP gốc.',
    video_url: 'https://www.youtube.com/embed/2_lswM1S264',
    resource_url: 'https://developers.cloudflare.com/waf/'
  }
];

async function seedComprehensiveData() {
  console.log('--- STARTING COMPREHENSIVE SEEDING ---');

  // 1. Seed or find Instructors
  console.log('\n[1/5] Checking and seeding instructors...');
  const instructorMap = {}; // name -> id
  // Load existing instructors
  const [existingUsers] = await db.query('SELECT id, name, email FROM users');
  for (const u of existingUsers) {
    instructorMap[u.name] = u.id;
  }

  for (const inst of instructorsToAdd) {
    if (!instructorMap[inst.name]) {
      const [res] = await db.query(
        'INSERT INTO users (name, email, password, role, bio) VALUES (?, ?, ?, ?, ?)',
        [
          inst.name,
          inst.email,
          '$2b$10$HPPk9SxrIshCk8ZqvmhYfexySCxE8uJ.R.VL0l6rcbmE1/FJcUhv6',
          inst.role,
          inst.bio
        ]
      );
      instructorMap[inst.name] = res.insertId;
      console.log(`+ Added instructor: ${inst.name} (id: ${res.insertId})`);
    } else {
      console.log(`= Instructor exists: ${inst.name} (id: ${instructorMap[inst.name]})`);
    }
  }

  // 2. Extra lessons for existing courses
  console.log('\n[2/5] Seeding extra lessons for existing courses 6-9...');
  for (const item of extraLessonsForExistingCourses) {
    const [existing] = await db.query(
      'SELECT id FROM lessons WHERE course_id = ? AND lesson_order = ?',
      [item.course_id, item.lesson_order]
    );
    if (existing.length === 0) {
      await db.query(
        'INSERT INTO lessons (course_id, title, content, video_url, resource_url, lesson_order) VALUES (?, ?, ?, ?, ?, ?)',
        [item.course_id, item.title, item.content, item.video_url, item.resource_url, item.lesson_order]
      );
      console.log(`+ Added lesson ${item.lesson_order} to course ${item.course_id}: ${item.title}`);
    } else {
      await db.query(
        'UPDATE lessons SET title = ?, content = ?, video_url = ?, resource_url = ? WHERE id = ?',
        [item.title, item.content, item.video_url, item.resource_url, existing[0].id]
      );
      console.log(`= Updated lesson ${item.lesson_order} in course ${item.course_id}`);
    }
  }

  // 3. Extra assignments for existing courses 1-9
  console.log('\n[3/5] Seeding assignments for existing courses 1-9...');
  for (const a of existingCoursesAssignments) {
    const [existing] = await db.query(
      'SELECT id FROM assignments WHERE course_id = ? AND title = ?',
      [a.course_id, a.title]
    );
    if (existing.length === 0) {
      await db.query(
        'INSERT INTO assignments (course_id, title, description, due_date) VALUES (?, ?, ?, ?)',
        [a.course_id, a.title, a.description, a.due_date]
      );
      console.log(`+ Added assignment to course ${a.course_id}: ${a.title}`);
    } else {
      await db.query(
        'UPDATE assignments SET description = ?, due_date = ? WHERE id = ?',
        [a.description, a.due_date, existing[0].id]
      );
      console.log(`= Updated assignment ${existing[0].id} in course ${a.course_id}`);
    }
  }

  // 4. Seed New Courses with their Lessons & Assignments
  console.log(`\n[4/5] Seeding ${newCourses.length} brand new courses...`);
  for (const c of newCourses) {
    const instructorId = instructorMap[c.instructor] || 3;
    let courseId;

    const [existing] = await db.query('SELECT id FROM courses WHERE title = ?', [c.title]);
    if (existing.length === 0) {
      const [res] = await db.query(
        'INSERT INTO courses (title, description, instructor, instructor_id, price, category, thumbnail, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [c.title, c.description, c.instructor, instructorId, c.price, c.category, c.thumbnail, c.status]
      );
      courseId = res.insertId;
      console.log(`\n+ Created Course [${courseId}]: "${c.title}"`);
    } else {
      courseId = existing[0].id;
      await db.query(
        'UPDATE courses SET description = ?, instructor = ?, instructor_id = ?, price = ?, category = ?, thumbnail = ?, status = ? WHERE id = ?',
        [c.description, c.instructor, instructorId, c.price, c.category, c.thumbnail, c.status, courseId]
      );
      console.log(`\n= Updated Course [${courseId}]: "${c.title}"`);
    }

    // Add lessons
    for (const l of c.lessons) {
      const [exLesson] = await db.query(
        'SELECT id FROM lessons WHERE course_id = ? AND lesson_order = ?',
        [courseId, l.order]
      );
      if (exLesson.length === 0) {
        await db.query(
          'INSERT INTO lessons (course_id, title, content, video_url, resource_url, lesson_order) VALUES (?, ?, ?, ?, ?, ?)',
          [courseId, l.title, l.content, l.video_url, l.resource_url, l.order]
        );
        console.log(`  + Lesson ${l.order}: ${l.title}`);
      } else {
        await db.query(
          'UPDATE lessons SET title = ?, content = ?, video_url = ?, resource_url = ? WHERE id = ?',
          [l.title, l.content, l.video_url, l.resource_url, exLesson[0].id]
        );
        console.log(`  = Lesson ${l.order} updated`);
      }
    }

    // Add assignments
    for (const a of c.assignments) {
      const [exAssign] = await db.query(
        'SELECT id FROM assignments WHERE course_id = ? AND title = ?',
        [courseId, a.title]
      );
      if (exAssign.length === 0) {
        await db.query(
          'INSERT INTO assignments (course_id, title, description, due_date) VALUES (?, ?, ?, ?)',
          [courseId, a.title, a.description, a.due_date]
        );
        console.log(`  * Assignment: ${a.title}`);
      } else {
        await db.query(
          'UPDATE assignments SET description = ?, due_date = ? WHERE id = ?',
          [a.description, a.due_date, exAssign[0].id]
        );
        console.log(`  * Assignment updated: ${a.title}`);
      }
    }
  }

  // 5. Seed some enrollments and reviews for new courses to make platform look vibrant
  console.log('\n[5/5] Adding sample enrollments and reviews for realistic platform engagement...');
  const [students] = await db.query('SELECT id FROM users WHERE role = "student"');
  const [allCourses] = await db.query('SELECT id FROM courses');

  if (students.length > 0 && allCourses.length > 0) {
    let enrollCount = 0;
    for (const course of allCourses) {
      // Pick 2-3 random students for each course
      const sampleStudents = students.slice(0, 3);
      for (const st of sampleStudents) {
        const [exEnroll] = await db.query(
          'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
          [st.id, course.id]
        );
        if (exEnroll.length === 0) {
          await db.query(
            'INSERT INTO enrollments (user_id, course_id, status) VALUES (?, ?, "active")',
            [st.id, course.id]
          );
          enrollCount++;
        }
      }
    }
    console.log(`+ Added ${enrollCount} new course enrollments for students.`);
  }

  // Summary counts
  const [finalCourses] = await db.query('SELECT count(*) as count FROM courses');
  const [finalLessons] = await db.query('SELECT count(*) as count FROM lessons');
  const [finalAssignments] = await db.query('SELECT count(*) as count FROM assignments');
  const [finalEnrollments] = await db.query('SELECT count(*) as count FROM enrollments');

  console.log('\n=======================================');
  console.log('SEEDING COMPLETED SUCCESSFULLY!');
  console.log(`Total Courses:     ${finalCourses[0].count}`);
  console.log(`Total Lessons:     ${finalLessons[0].count}`);
  console.log(`Total Assignments: ${finalAssignments[0].count}`);
  console.log(`Total Enrollments: ${finalEnrollments[0].count}`);
  console.log('=======================================');

  process.exit(0);
}

seedComprehensiveData().catch(err => {
  console.error('Fatal error during comprehensive seeding:', err);
  process.exit(1);
});
