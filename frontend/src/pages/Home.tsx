import { Container } from "@mui/material";
import FeaturesSection from "../components/FeaturesSection";

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <Container maxWidth="lg">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
              Học tiếng Anh thông minh
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Nền tảng học tiếng Anh toàn diện với AI hỗ trợ, giúp bạn phát triển đầy đủ 4 kỹ năng: Nghe, Nói, Đọc, Viết
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors duration-200">
              Bắt đầu học ngay
            </button>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <FeaturesSection />
    </div>
  );
};

export default Home;
