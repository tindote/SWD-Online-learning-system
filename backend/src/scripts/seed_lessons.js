require('dotenv').config();
const db = require('../config/db');

const lessonsToAdd = [
  // Course 1: Full-Stack Web Development with React & Node.js (add lessons 5, 6)
  {
    course_id: 1,
    title: 'Xác thực người dùng với JSON Web Token (JWT) & Bảo mật Cookie',
    content: `Trong bài học này, chúng ta sẽ tìm hiểu toàn diện về cơ chế xác thực Stateless Authentication sử dụng JWT:
- Cấu trúc 3 phần của JWT: Header, Payload, Signature.
- Tạo token với jsonwebtoken và mã hóa mật khẩu với bcrypt.
- Lưu trữ an toàn trên Client: HttpOnly Cookies vs LocalStorage.
- Xây dựng Auth Middleware bảo vệ các Private Routes trong Express.`,
    video_url: 'https://www.youtube.com/embed/mbsmsi7l3r4',
    resource_url: 'https://jwt.io/introduction',
    lesson_order: 5
  },
  {
    course_id: 1,
    title: 'Deploy Full-Stack App lên Cloud và Thiết lập CI/CD Pipeline',
    content: `Hoàn tất dự án và đưa ứng dụng lên môi trường Production:
- Build ứng dụng React với Vite và tối ưu bundle size.
- Thiết lập biến môi trường an toàn trên Server.
- Triển khai Backend Node.js lên Render / Railway và Frontend lên Vercel.
- Tự động hóa kiểm thử và deploy với GitHub Actions CI/CD.`,
    video_url: 'https://www.youtube.com/embed/n4p_O10v7p4',
    resource_url: 'https://docs.github.com/en/actions',
    lesson_order: 6
  },

  // Course 2: Python for Data Science and Machine Learning (add lessons 4, 5)
  {
    course_id: 2,
    title: 'Xây dựng mô hình Machine Learning đầu tiên với Scikit-Learn',
    content: `Bài học này trang bị kiến thức nền tảng về học có giám sát (Supervised Learning):
- Tiền xử lý dữ liệu: Xử lý giá trị null, scaling và one-hot encoding.
- Chia tập Train/Test dữ liệu với train_test_split.
- Huấn luyện thuật toán Hồi quy tuyến tính (Linear Regression) và Decision Tree.
- Đánh giá mô hình: MSE, RMSE, R2 Score và Confusion Matrix.`,
    video_url: 'https://www.youtube.com/embed/0B5eIE_1vpU',
    resource_url: 'https://scikit-learn.org/stable/',
    lesson_order: 4
  },
  {
    course_id: 2,
    title: 'Dự án thực tế: Phân tích và Dự đoán Giá Bất Động Sản',
    content: `Áp dụng toàn bộ quy trình Data Science vào một bài toán thực tế:
- Khám phá và làm sạch bộ dữ liệu thực tế (EDA).
- Feature Engineering: Trích xuất các đặc trưng quan trọng.
- Thử nghiệm và so sánh nhiều mô hình (Random Forest, Gradient Boosting).
- Trình bày kết quả phân tích và export model với joblib.`,
    video_url: 'https://www.youtube.com/embed/Wqmtf9SA_kk',
    resource_url: 'https://kaggle.com/datasets',
    lesson_order: 5
  },

  // Course 3: iOS & Swift Bootcamp for Beginners (add lessons 3, 4, 5)
  {
    course_id: 3,
    title: 'Quản lý Trạng thái và Navigation trong SwiftUI',
    content: `Nắm vững luồng dữ liệu (Data Flow) trong ứng dụng SwiftUI:
- Sự khác biệt giữa @State, @Binding, @ObservedObject và @EnvironmentObject.
- Điều hướng hiện đại với NavigationStack và NavigationPath.
- Xây dựng Form nhập liệu mượt mà với validation theo thời gian thực.`,
    video_url: 'https://www.youtube.com/embed/1XbHwR_vW7k',
    resource_url: 'https://developer.apple.com/documentation/swiftui/state-and-data-flow',
    lesson_order: 3
  },
  {
    course_id: 3,
    title: 'Tích hợp RESTful API với URLSession và Codable Protocol',
    content: `Kết nối ứng dụng iOS với backend:
- Sử dụng URLSession với mô hình Async/Await trong Swift 5+.
- Parse JSON dữ liệu tự động với Codable và JSONDecoder.
- Quản lý trạng thái tải: Loading, Success, Error state trên giao diện người dùng.`,
    video_url: 'https://www.youtube.com/embed/sqo8449Dgu8',
    resource_url: 'https://developer.apple.com/documentation/foundation/urlsession',
    lesson_order: 4
  },
  {
    course_id: 3,
    title: 'Đóng gói, Kiểm thử và Phát hành Ứng dụng lên App Store',
    content: `Quy trình phát hành chuyên nghiệp từ Xcode lên App Store Connect:
- Tạo Certificate, App ID và Provisioning Profile trên Apple Developer Portal.
- Kiểm thử Beta với TestFlight và thu thập phản hồi từ người dùng.
- Chuẩn bị Screenshots, Metadata và gửi kiểm duyệt lên App Store Review.`,
    video_url: 'https://www.youtube.com/embed/wX883L6N3t8',
    resource_url: 'https://developer.apple.com/app-store/submissions/',
    lesson_order: 5
  },

  // Course 4: Introduction to Cloud Computing & AWS Services (add lessons 3, 4, 5)
  {
    course_id: 4,
    title: 'Cơ sở Dữ liệu Đám mây: Quản lý AWS RDS & DynamoDB',
    content: `Tìm hiểu các giải pháp lưu trữ dữ liệu hiệu năng cao trên AWS:
- Khởi tạo MySQL/PostgreSQL Managed Instance với AWS RDS.
- Cơ chế Multi-AZ Deployment và Read Replicas để chống chịu lỗi.
- Giới thiệu NoSQL serverless với Amazon DynamoDB: Partition Key và Sort Key.`,
    video_url: 'https://www.youtube.com/embed/e_kXz9vQ7F0',
    resource_url: 'https://aws.amazon.com/rds/',
    lesson_order: 3
  },
  {
    course_id: 4,
    title: 'Kiến trúc Không máy chủ (Serverless) với AWS Lambda & API Gateway',
    content: `Tiết kiệm chi phí và tăng tốc độ mở rộng ứng dụng:
- Nguyên lý hoạt động của kiến trúc Serverless (FaaS).
- Viết hàm Lambda xử lý sự kiện với Node.js.
- Tạo REST API endpoint với Amazon API Gateway kết nối trực tiếp đến Lambda.
- Giám sát logs và metric hiệu năng qua AWS CloudWatch.`,
    video_url: 'https://www.youtube.com/embed/EBCdyQ3eGlI',
    resource_url: 'https://aws.amazon.com/lambda/',
    lesson_order: 4
  },
  {
    course_id: 4,
    title: 'Bảo mật Đám mây & Phân quyền Truy cập với AWS IAM & VPC',
    content: `Bảo vệ hạ tầng ứng dụng theo tiêu chuẩn an ninh đám mây:
- Quản lý danh tính và phân quyền với AWS Identity and Access Management (IAM).
- Thiết kế mạng ảo Virtual Private Cloud (VPC), Public/Private Subnet và NAT Gateway.
- Cấu hình Security Groups và Network ACLs chống tấn công mạng.`,
    video_url: 'https://www.youtube.com/embed/9oF84E8p72s',
    resource_url: 'https://aws.amazon.com/iam/',
    lesson_order: 5
  },

  // Course 5: Modern UI/UX Design with Figma (add lessons 3, 4, 5)
  {
    course_id: 5,
    title: 'Hệ thống Màu sắc và Nghệ thuật Typography trong UI Design',
    content: `Xây dựng nền tảng thị giác mạnh mẽ cho ứng dụng số:
- Nguyên lý tỷ lệ 60-30-10 và cách tạo Color Palette hài hòa.
- Phân cấp thông tin (Visual Hierarchy) thông qua Typography Scale.
- Kiểm tra độ tương phản màu sắc đáp ứng tiêu chuẩn Accessibility (WCAG 2.1).`,
    video_url: 'https://www.youtube.com/embed/fW5z_FwZ7eA',
    resource_url: 'https://www.figma.com/resource-library/',
    lesson_order: 3
  },
  {
    course_id: 5,
    title: 'Làm chủ Auto-Layout, Component Variants và Variables trong Figma',
    content: `Nâng tầm hiệu suất thiết kế với các tính năng chuyên nghiệp của Figma:
- Thiết kế giao diện co giãn Responsive với Auto-Layout nâng cao (Wrap, Min/Max).
- Xây dựng Component Set với Variants và Boolean Properties.
- Thiết lập Figma Variables hỗ trợ chế độ Light/Dark Mode tức thì.`,
    video_url: 'https://www.youtube.com/embed/NxSfl8M_3yE',
    resource_url: 'https://help.figma.com/hc/en-us/articles/360040451373-Create-dynamic-designs-with-auto-layout',
    lesson_order: 4
  },
  {
    course_id: 5,
    title: 'Kiểm thử Trải nghiệm Người dùng (Usability Testing) & Hand-off cho Dev',
    content: `Hoàn thiện quy trình thiết kế hướng sản phẩm:
- Thiết lập kịch bản Usability Testing và đo lường tỷ lệ hoàn thành tác vụ.
- Tổ chức file thiết kế chuẩn chỉ với Figma Dev Mode.
- Ghi chú thông số Spacing, Tokens và xuất Assets tối ưu cho Frontend Developer.`,
    video_url: 'https://www.youtube.com/embed/k749U1N7u5Q',
    resource_url: 'https://www.nngroup.com/articles/usability-testing-101/',
    lesson_order: 5
  },

  // Course 6: Docker & Kubernetes: Practical Containerization (lessons 1, 2, 3, 4)
  {
    course_id: 6,
    title: 'Tổng quan về Containerization và Làm quen với Docker Engine',
    content: `Khởi đầu với công nghệ Container giúp đóng gói và chuẩn hóa môi trường:
- Sự khác biệt căn bản giữa Virtual Machine (Máy ảo) và Container.
- Cài đặt và cấu hình Docker Desktop trên Windows/macOS/Linux.
- Các lệnh thao tác cơ bản: docker run, docker ps, docker stop, docker rm.
- Khám phá Docker Hub và tải các image phổ biến: Nginx, Node.js, MySQL.`,
    video_url: 'https://www.youtube.com/embed/gAkwW2tuIqE',
    resource_url: 'https://docs.docker.com/get-started/',
    lesson_order: 1
  },
  {
    course_id: 6,
    title: 'Viết Dockerfile Chuẩn và Kỹ thuật Multi-stage Builds',
    content: `Tự tạo Image tùy chỉnh cho ứng dụng Web:
- Cú pháp cơ bản của Dockerfile: FROM, WORKDIR, COPY, RUN, CMD, EXPOSE.
- Tối ưu kích thước image từ hàng GB xuống chỉ vài chục MB với Multi-stage builds.
- Sử dụng tệp .dockerignore để tăng tốc quá trình build và bảo mật bí mật mã nguồn.`,
    video_url: 'https://www.youtube.com/embed/JofsaZ3H1qM',
    resource_url: 'https://docs.docker.com/build/building/multi-stage/',
    lesson_order: 2
  },
  {
    course_id: 6,
    title: 'Điều phối Đa dịch vụ (Multi-container) với Docker Compose',
    content: `Kết nối ứng dụng Full-stack chỉ với 1 câu lệnh docker compose up:
- Định dạng cú pháp tệp docker-compose.yml (services, networks, volumes).
- Gắn kết dữ liệu bền vững (Data Persistence) cho Database với Docker Volumes.
- Thiết lập mạng nội bộ giữa Frontend, Backend API và MySQL Server.`,
    video_url: 'https://www.youtube.com/embed/HG6yIjZapSA',
    resource_url: 'https://docs.docker.com/compose/',
    lesson_order: 3
  },
  {
    course_id: 6,
    title: 'Triển khai và Quản lý Ứng dụng với Kubernetes Cluster (K8s)',
    content: `Học cách điều phối container tự động ở quy mô lớn:
- Kiến trúc Kubernetes: Control Plane, Worker Nodes, Pods, Deployments, Services.
- Viết YAML Manifest định nghĩa Pod và ReplicaSet.
- Cân bằng tải (Load Balancing) và Expose ứng dụng với Kubernetes Service.
- Tự động mở rộng (Auto-scaling) và cập nhật không gián đoạn (Rolling Updates).`,
    video_url: 'https://www.youtube.com/embed/X48VuDVv0do',
    resource_url: 'https://kubernetes.io/docs/concepts/',
    lesson_order: 4
  },

  // Course 7: Advanced React 18: Performance & Architecture (lessons 1, 2, 3, 4)
  {
    course_id: 7,
    title: 'Tính năng Đồng thời trong React 18: Suspense, useTransition & useDeferredValue',
    content: `Khai phá sức mạnh Concurrent React để giao diện luôn mượt mà và phản hồi tức thì:
- Cơ chế Concurrent Rendering và ưu tiên cập nhật (Priority Updates).
- Trì hoãn xử lý tác vụ nặng với hook useTransition mà không gây đơ giao diện.
- Trì hoãn giá trị hiển thị tìm kiếm với useDeferredValue.
- Lazy-loading component và Data Fetching mượt mà cùng React Suspense.`,
    video_url: 'https://www.youtube.com/embed/jCGMedd6ptM',
    resource_url: 'https://react.dev/reference/react/useTransition',
    lesson_order: 1
  },
  {
    course_id: 7,
    title: 'Tối ưu Hiệu năng Render Chuyên sâu: useMemo, useCallback & Profiler',
    content: `Khắc phục triệt để hiện tượng Re-render không cần thiết trong ứng dụng lớn:
- Khi nào NÊN và KHÔNG NÊN dùng useMemo, useCallback và React.memo.
- Sử dụng React DevTools Profiler để đo thời gian render và tìm Flamegraph bottlenecks.
- Kỹ thuật Virtualization hiển thị danh sách hàng chục nghìn phần tử với React Window.`,
    video_url: 'https://www.youtube.com/embed/DEPwA3mv_R8',
    resource_url: 'https://react.dev/reference/react/memo',
    lesson_order: 2
  },
  {
    course_id: 7,
    title: 'Custom Hooks Nâng cao và Quản lý Trạng thái Hiện đại với Zustand',
    content: `Thay thế Redux cồng kềnh bằng Zustand đơn giản, mạnh mẽ và siêu nhẹ:
- Thiết kế Custom Hooks tái sử dụng logic: useDebounce, useLocalStorage, useFetch.
- Tạo Global Store với Zustand: Actions, Selectors và Async middleware.
- Tích hợp Redux DevTools Extension và LocalStorage Persist với Zustand.`,
    video_url: 'https://www.youtube.com/embed/oxTP6hP4q7A',
    resource_url: 'https://docs.pmnd.rs/zustand/getting-started/introduction',
    lesson_order: 3
  },
  {
    course_id: 7,
    title: 'Kiến trúc Modular, Design Patterns và Micro-Frontends trong React',
    content: `Xây dựng codebase chuẩn Enterprise có khả năng mở rộng cho nhiều team:
- Feature-driven Folder Structure vs Layer-driven Structure.
- Các mẫu thiết kế phổ biến: Compound Components, Render Props, Provider Pattern.
- Giới thiệu kiến trúc Micro-frontends sử dụng Webpack Module Federation / Vite.`,
    video_url: 'https://www.youtube.com/embed/MSq_DCRxOxw',
    resource_url: 'https://patterns.dev',
    lesson_order: 4
  },

  // Course 8: Deep Learning & Computer Vision with PyTorch (lessons 1, 2, 3, 4)
  {
    course_id: 8,
    title: 'Nhập môn Deep Learning & Các thao tác Tensor với PyTorch',
    content: `Bước đầu làm quen với framework học sâu hàng đầu thế giới:
- Tìm hiểu cấu trúc dữ liệu PyTorch Tensor và so sánh với NumPy Arrays.
- Cơ chế Autograd tự động tính đạo hàm và Backpropagation.
- Xây dựng mô hình Perceptron đa tầng (MLP) cho bài toán phân loại số viết tay MNIST.
- Huấn luyện mô hình trên GPU với CUDA acceleration.`,
    video_url: 'https://www.youtube.com/embed/V_xro14G74U',
    resource_url: 'https://pytorch.org/tutorials/',
    lesson_order: 1
  },
  {
    course_id: 8,
    title: 'Mạng nơ-ron Tích chập (CNN) cho Bài toán Phân loại Hình ảnh',
    content: `Kiến trúc mạng thần kinh chuyên biệt cho xử lý thị giác máy tính:
- Nguyên lý hoạt động của Convolutional Layer, Kernel, Stride, Padding.
- Giảm chiều dữ liệu với Pooling Layer (Max Pooling, Average Pooling).
- Tránh Overfitting với Dropout và Data Augmentation (xoay, lật, chỉnh màu ảnh).
- Xây dựng mô hình CNN hoàn chỉnh phân loại ảnh tập dữ liệu CIFAR-10.`,
    video_url: 'https://www.youtube.com/embed/IA3WxTTPXqQ',
    resource_url: 'https://cs231n.github.io/convolutional-networks/',
    lesson_order: 2
  },
  {
    course_id: 8,
    title: 'Kỹ thuật Học chuyển giao (Transfer Learning) với ResNet & EfficientNet',
    content: `Tận dụng các mô hình đã được huấn luyện trên hàng triệu hình ảnh:
- Khái niệm Transfer Learning và Fine-Tuning trong Deep Learning.
- Sử dụng Torchvision Models: ResNet-50, EfficientNet-B0.
- Đóng băng trọng số (Freeze weights) và thay thế Fully Connected Classification Head.
- Huấn luyện nhận diện bệnh trên lá cây với độ chính xác trên 96%.`,
    video_url: 'https://www.youtube.com/embed/qaDe0qQZ5h8',
    resource_url: 'https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html',
    lesson_order: 3
  },
  {
    course_id: 8,
    title: 'Nhận diện và Định vị Đối tượng Thời gian thực với YOLOv8',
    content: `Triển khai bài toán Object Detection hiện đại:
- Sự khác nhau giữa Image Classification, Object Detection và Image Segmentation.
- Giới thiệu kiến trúc YOLO (You Only Look Once) và Ultralytics YOLOv8.
- Chuẩn bị và dán nhãn dữ liệu tùy chỉnh với Roboflow.
- Train mô hình Custom Object Detection và chạy suy luận (Inference) trên Video thực tế.`,
    video_url: 'https://www.youtube.com/embed/m9fH9OWnSQU',
    resource_url: 'https://docs.ultralytics.com/',
    lesson_order: 4
  },

  // Course 9: Ethical Hacking & Web Application Security (lessons 1, 2, 3, 4)
  {
    course_id: 9,
    title: 'Tổng quan An ninh Mạng và Khung Bảo mật OWASP Top 10',
    content: `Nắm vững tư duy bảo mật phòng thủ và các nguy cơ an ninh mạng phổ biến:
- Khái niệm Ethical Hacking (White Hat Hacker) và ranh giới pháp lý an toàn thông tin.
- Tổng quan danh mục OWASP Top 10 lỗ hổng bảo mật ứng dụng web nguy hiểm nhất.
- Cài đặt môi trường thực hành bảo mật an toàn với Kali Linux và DVWA (Damn Vulnerable Web App).`,
    video_url: 'https://www.youtube.com/embed/3Kq1MIfTWCE',
    resource_url: 'https://owasp.org/www-project-top-ten/',
    lesson_order: 1
  },
  {
    course_id: 9,
    title: 'Khai thác và Phòng chống Tấn công SQL Injection (SQLi)',
    content: `Phân tích sâu lỗ hổng tiêm mã truy vấn cơ sở dữ liệu:
- Nguyên nhân cốt lõi gây ra SQL Injection: Nối chuỗi dữ liệu đầu vào không kiểm soát.
- Các hình thức tấn công: In-band SQLi, Blind SQLi (Boolean-based, Time-based).
- Sử dụng công cụ SQLMap tự động kiểm tra lỗ hổng.
- Biện pháp phòng chống triệt để: Parameterized Queries (Prepared Statements) và ORM.`,
    video_url: 'https://www.youtube.com/embed/ciNHn38EyRc',
    resource_url: 'https://portswigger.net/web-security/sql-injection',
    lesson_order: 2
  },
  {
    course_id: 9,
    title: 'Tấn công XSS (Cross-Site Scripting) và CSRF (Cross-Site Request Forgery)',
    content: `Bảo vệ người dùng khỏi các cuộc tấn công khai thác trên trình duyệt:
- Phân loại XSS: Stored XSS, Reflected XSS và DOM-based XSS.
- Khai thác cắp Session Cookie và mạo danh người dùng.
- Cơ chế CSRF và cách phòng chống bằng Anti-CSRF Tokens cùng SameSite Cookie.
- Thiết lập Content Security Policy (CSP) chặt chẽ cho Web App.`,
    video_url: 'https://www.youtube.com/embed/EoaDgDgDZQA',
    resource_url: 'https://portswigger.net/web-security/cross-site-scripting',
    lesson_order: 3
  },
  {
    course_id: 9,
    title: 'Quy trình Penetration Testing Toàn diện và Viết Báo cáo Lỗ hổng',
    content: `Thực hiện đánh giá bảo mật chuyên nghiệp theo tiêu chuẩn PTES:
- Các giai đoạn kiểm thử xâm nhập: Reconnaissance, Scanning, Exploitation, Post-exploitation.
- Sử dụng Burp Suite Professional để chặn bắt và thao túng gói tin HTTP Requests.
- Đánh giá mức độ nghiêm trọng theo thang điểm CVSS v3.
- Soạn thảo báo cáo lỗ hổng kỹ thuật và đề xuất giải pháp vá lỗi cho doanh nghiệp.`,
    video_url: 'https://www.youtube.com/embed/2_lswM1S264',
    resource_url: 'https://portswigger.net/burp',
    lesson_order: 4
  }
];

async function seedLessons() {
  console.log(`Starting to seed ${lessonsToAdd.length} lessons...`);
  let addedCount = 0;

  for (const lesson of lessonsToAdd) {
    // Check if lesson with this course_id and lesson_order already exists
    const [existing] = await db.query(
      'SELECT id FROM lessons WHERE course_id = ? AND lesson_order = ?',
      [lesson.course_id, lesson.lesson_order]
    );

    if (existing.length > 0) {
      // Update existing
      await db.query(
        'UPDATE lessons SET title = ?, content = ?, video_url = ?, resource_url = ? WHERE id = ?',
        [lesson.title, lesson.content, lesson.video_url, lesson.resource_url, existing[0].id]
      );
      console.log(`Updated lesson ${lesson.lesson_order} for course ${lesson.course_id}: ${lesson.title}`);
    } else {
      // Insert new
      await db.query(
        'INSERT INTO lessons (course_id, title, content, video_url, resource_url, lesson_order) VALUES (?, ?, ?, ?, ?, ?)',
        [lesson.course_id, lesson.title, lesson.content, lesson.video_url, lesson.resource_url, lesson.lesson_order]
      );
      console.log(`Inserted lesson ${lesson.lesson_order} for course ${lesson.course_id}: ${lesson.title}`);
      addedCount++;
    }
  }

  console.log(`Done! Added ${addedCount} new lessons and updated existing ones.`);
  process.exit(0);
}

seedLessons().catch(err => {
  console.error('Error seeding lessons:', err);
  process.exit(1);
});
