import { Container } from "@mui/material";
import { FeaturesSection } from "../components/ui";

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
              Nền tảng luyện viết tiếng Anh thông minh ứng dụng AI, đồng hành cùng bạn chinh phục kỹ năng ngôn ngữ một cách toàn diện và hiệu quả.
            </p>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <FeaturesSection />
    </div>
  );
};

export default Home;
