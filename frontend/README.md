# Writing App FE - React Application

Một ứng dụng React hiện đại được xây dựng với TypeScript, Material UI và Tailwind CSS.

## 🚀 Công nghệ sử dụng

- **React 18** - Thư viện UI
- **TypeScript** - Type safety
- **Vite** - Build tool nhanh
- **React Router DOM** - Client-side routing
- **Material UI** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Emotion** - CSS-in-JS (được sử dụng bởi Material UI)

## 📁 Cấu trúc dự án

```
src/
├── components/     # Reusable components
├── pages/         # Page components
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Contact.tsx
│   └── NotFound.tsx
├── layouts/       # Layout components
│   └── MainLayout.tsx
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── assets/        # Static assets
├── App.tsx        # Main App component
├── main.tsx       # Entry point
└── index.css      # Global styles
```

## 🛠️ Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js (version 18+)
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

### Build cho production
```bash
npm run build
```

### Preview build production
```bash
npm run preview
```

## 🎨 Tính năng

### Routing
- **Trang chủ** (`/`) - Landing page với thông tin giới thiệu
- **Giới thiệu** (`/about`) - Thông tin chi tiết về dự án và công nghệ
- **Liên hệ** (`/contact`) - Form liên hệ với validation
- **404** - Trang lỗi tùy chỉnh

### UI/UX
- **Responsive Design** - Tương thích với mọi thiết bị
- **Material Design** - Sử dụng Material UI components
- **Dark/Light Theme** - Hỗ trợ theme tùy chỉnh
- **Mobile Navigation** - Drawer menu cho mobile
- **Smooth Transitions** - Animation mượt mà

### Styling
- **Tailwind CSS** - Utility classes cho styling nhanh
- **Material UI** - Pre-built components
- **Custom Theme** - Theme tùy chỉnh với brand colors

## 🔧 Cấu hình

### Tailwind CSS
File cấu hình: `tailwind.config.js`
- Content paths được cấu hình cho React/TypeScript
- Có thể mở rộng theme tùy chỉnh

### Material UI Theme
File cấu hình: `src/App.tsx`
- Primary color: Blue (#1976d2)
- Secondary color: Pink (#dc004e)
- Typography: Roboto font family

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

### GitHub Pages
```bash
npm run build
# Push dist folder to gh-pages branch
```

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 📞 Liên hệ

- Email: contact@writing-app-fe.com
- Phone: +84 123 456 789
- Address: Hà Nội, Việt Nam
