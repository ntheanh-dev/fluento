import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaBook, FaPen, FaHeadphones, FaMicrophone, FaBrain, FaComment, FaClock } from 'react-icons/fa';

interface FeatureCardProps {
  isFree: boolean;
  isAIPowered?: boolean;
  isComingSoon?: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  route?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  isFree,
  isAIPowered,
  isComingSoon = false,
  icon,
  title,
  description,
  buttonText,
  buttonColor,
  route
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (!isComingSoon && route) {
      navigate(route);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isComingSoon && route) {
      navigate(route);
    }
  };

  return (
    <div 
      className={`relative bg-white box-shadow-lg border-1 border-[#E8EAED] border-solid rounded-xl p-6 shadow-lg transition-all duration-300 transform group h-full flex flex-col ${
        isComingSoon 
          ? 'opacity-60 cursor-not-allowed' 
          : 'hover:shadow-xl hover:scale-105 hover:-translate-y-2 cursor-pointer'
      }`}
      onClick={handleCardClick}
    >

      {/* Header badges */}
      <div className="flex gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${
          isComingSoon 
            ? 'bg-gray-100 text-gray-500 border-gray-300' 
            : isFree 
              ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 group-hover:from-green-200 group-hover:to-green-300 group-hover:border-green-400' 
              : 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300 group-hover:from-orange-200 group-hover:to-orange-300 group-hover:border-orange-400'
        }`}>
          {isComingSoon ? 'SẮP RA MẮT' : (isFree ? 'MIỄN PHÍ' : 'TRẢ PHÍ')}
        </span>
        {isAIPowered && !isComingSoon && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300 group-hover:from-purple-200 group-hover:to-purple-300 group-hover:border-purple-400 transition-all duration-300">
            AI POWERED
          </span>
        )}
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className={`text-4xl transition-all duration-300 ${
          isComingSoon 
            ? 'text-gray-400' 
            : 'text-purple-600 group-hover:scale-110 group-hover:rotate-3'
        }`}>
          {icon}
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <h3 className={`text-xl font-bold transition-colors duration-300 ${
          isComingSoon 
            ? 'text-gray-500' 
            : 'text-gray-800'
        }`}>{title}</h3>
      </div>

      {/* Description */}
      <p className={`text-center mb-6 leading-relaxed transition-colors duration-300 flex-grow ${
        isComingSoon 
          ? 'text-gray-500' 
          : 'text-gray-600 group-hover:text-gray-700'
      }`}>
        {description}
      </p>

      {/* Button */}
      <button 
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 transform border-2 ${
          isComingSoon 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400' 
            : buttonColor.includes('purple') 
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white group-hover:scale-105 group-hover:shadow-lg border-transparent hover:border-white hover:border-opacity-30'
              : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white group-hover:scale-105 group-hover:shadow-lg border-transparent hover:border-white hover:border-opacity-30'
        }`}
        disabled={isComingSoon}
        onClick={handleButtonClick}
      >
        {isComingSoon ? 'Sắp ra mắt' : buttonText}
      </button>
    </div>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      isFree: true,
      isAIPowered: false,
      icon: <FaBook />,
      title: "🧠 Luyện từ vựng",
      description: "Ghi nhớ từ vựng với phương pháp spaced repetition",
      buttonText: "Bắt đầu luyện tập",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      route: "/vocabulary-practice"
    },
    {
      isFree: true,
      isAIPowered: true,
      icon: <FaPen />,
      title: "📝 Luyện viết câu",
      description: "Cải thiện kỹ năng viết với AI hỗ trợ ngữ pháp và từ vựng",
      buttonText: "Luyện viết ngay",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      route: "/writing"
    },
    {
      isFree: true,
      isAIPowered: false,
      isComingSoon: true,
      icon: <FaHeadphones />,
      title: "🎧 Luyện nghe",
      description: "Phát triển kỹ năng nghe hiểu với audio clips và transcript",
      buttonText: "Luyện nghe ngay",
      buttonColor: "bg-red-600 hover:bg-red-700",
      route: "/listening-practice"
    },
    {
      isFree: true,
      isAIPowered: false,
      isComingSoon: true,
      icon: <FaMicrophone />,
      title: "🎤 Luyện nói Shadowing",
      description: "Luyện phát âm và nói tự nhiên với kỹ thuật shadowing",
      buttonText: "Luyện nói ngay",
      buttonColor: "bg-red-600 hover:bg-red-700",
      route: "/speaking-practice"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaRocket className="text-2xl text-blue-600 animate-float" />
            <h2 className="text-3xl font-bold text-gray-800">Tính năng chính</h2>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="animate-fade-in-scale transition-all duration-500 transform hover:scale-105 h-full"
              style={{ 
                animationDelay: `${index * 200}ms`,
                animationFillMode: 'both'
              }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 