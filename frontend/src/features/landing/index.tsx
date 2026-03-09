import React from 'react';
import { Button, Avatar, Badge } from 'antd';
import {
    CreditCard,
    Target,
    FileText,
    CheckCircle,
    ArrowDown,
    Globe,
    HelpCircle,
    Mail,
    Menu,
    X
} from 'lucide-react';
import { motion } from 'motion/react';
import home from "../../assets/image/home.png";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Hero = () => {

    const navigate = useNavigate();
    const isAuthenticated = Cookies.get("accessToken") !== undefined;
    const handleStart = () => {
        if (isAuthenticated) {
            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    };
    return (
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="flex flex-col gap-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 font-display">
                                Làm chủ kỹ năng viết tiếng Anh với phản hồi từ <span className="text-[#137fec]">AI</span>
                            </h1>
                            <p className="text-lg text-slate-600 max-w-xl font-display">
                                Nâng tầm kỹ năng ngôn ngữ của bạn với các bản sửa lỗi theo thời gian thực, gợi ý từ vựng sắc bén và lộ trình học tập được cá nhân hóa.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-4 bg-[#137fec] text-white font-bold rounded-lg shadow-xl shadow-[#137fec]/30 text-lg font-display"
                                onClick={handleStart}
                            >
                                Bắt đầu ngay
                            </motion.button>
                            <button className="px-8 py-4 bg-slate-100 text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-colors text-lg font-display">
                                Xem giới thiệu
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 font-display">
                            <div className="flex -space-x-2">
                                <div className="size-8 rounded-full border-2 border-white bg-slate-300"></div>
                                <div className="size-8 rounded-full border-2 border-white bg-slate-400"></div>
                                <div className="size-8 rounded-full border-2 border-white bg-slate-500"></div>
                            </div>
                            <span>Được tin dùng bởi hơn 100+ học viên</span>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square rounded-2xl bg-gradient-to-tr from-[#137fec]/20 to-[#137fec]/5 absolute -inset-4 blur-2xl"></div>
                        <div className="relative bg-slate-100 rounded-2xl overflow-hidden aspect-video shadow-2xl border border-slate-200">
                            <img className="w-full h-full object-cover"
                                src={home} alt="Dashboard" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Features = () => {
    return (
        <section className="py-24 bg-[#f6f7f8]" id="features">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display">Chế độ học tập tùy chỉnh</h2>
                    <p className="text-slate-600 text-lg font-display">Chọn phong cách luyện tập phù hợp nhất với mục tiêu và trình độ hiện tại của bạn.</p>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="size-12 bg-[#137fec]/10 rounded-lg flex items-center justify-center mb-6">
                            <Target className="text-[#137fec] w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 font-display">Luyện dịch câu đơn</h3>
                        <p className="text-slate-600 leading-relaxed font-display">Tập trung vào độ chính xác và ngữ pháp ở cấp độ vi mô. Hoàn hảo để nắm vững các thì và giới từ cụ thể.</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="size-12 bg-[#137fec]/10 rounded-lg flex items-center justify-center mb-6">
                            <FileText className="text-[#137fec] w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 font-display">Luyện dịch đoạn văn</h3>
                        <p className="text-slate-600 leading-relaxed font-display">Làm chủ dòng chảy, ngữ cảnh và các cấu trúc câu nâng cao. Học cách kết nối các ý tưởng một cách tự nhiên và chuyên nghiệp.</p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const AIFeedback = () => {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-slate-900 rounded-3xl p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-12 relative">
                    <div className="flex-1 space-y-6 z-10">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#137fec] text-white text-xs font-bold tracking-widest uppercase font-display">Công cụ AI</div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight font-display">Phản hồi AI thông minh</h2>
                        <p className="text-slate-300 text-lg leading-relaxed font-display">
                            Mạng lưới thần kinh tiên tiến của chúng tôi không chỉ bắt lỗi chính tả. Nó cung cấp các phân tích về ngữ pháp, nâng cao từ vựng và cấu trúc theo thời gian thực để cải thiện mọi câu bạn viết. Giống như có một biên tập viên bản ngữ bên cạnh bạn 24/7.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Sửa lỗi ngữ pháp theo ngữ cảnh",
                                "Gợi ý từ đồng nghĩa để tránh lặp từ",
                                "Điều chỉnh giọng văn và phong cách"
                            ].map((item, index) => (
                                <li key={index} className="flex items-center gap-3 text-white font-display">
                                    <CheckCircle className="text-[#137fec] w-5 h-5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="mt-4 px-6 py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition-colors font-display">Khám phá công cụ phân tích</button>
                    </div>
                    <div className="flex-1 w-full max-w-md lg:max-w-none relative">
                        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-2xl">
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-800 rounded-lg">
                                    <p className="text-slate-400 italic text-sm mb-2 font-display">Bản nháp của bạn:</p>
                                    <p className="text-white font-display">The report was finish by the team yesterday.</p>
                                </div>
                                <div className="flex justify-center">
                                    <ArrowDown className="text-[#137fec] w-6 h-6" />
                                </div>
                                <div className="p-4 bg-[#137fec]/20 rounded-lg border border-[#137fec]/40">
                                    <p className="text-[#137fec] font-bold text-sm mb-2 font-display">AI Sửa lỗi:</p>
                                    <p className="text-white font-display">The team <span className="text-[#137fec] font-bold decoration-[#137fec] underline decoration-2">finished</span> the report yesterday.</p>
                                    <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-400 font-display">Thể chủ động thường hấp dẫn và rõ ràng hơn cho các báo cáo chuyên nghiệp.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const HowItWorks = () => {
    const steps = [
        {
            id: 1,
            title: "Thêm API Key",
            desc: "Kết nối khóa API của bạn trong phần Hồ sơ để kích hoạt các tính năng phân tích AI thông minh."
        },
        {
            id: 2,
            title: "Chọn chế độ",
            desc: "Lựa chọn giữa các chế độ câu, đoạn văn hoặc dịch thuật để bắt đầu phiên học của bạn."
        },
        {
            id: 3,
            title: "Dịch hoặc Viết",
            desc: "Nhập văn bản của bạn hoặc dịch từ ngôn ngữ mẹ đẻ bằng trình chỉnh sửa trực quan của chúng tôi."
        },
        {
            id: 4,
            title: "Nhận phản hồi tức thì",
            desc: "Nhận các sửa lỗi và giải thích chi tiết ngay lập tức để học hỏi từ mọi sai lầm."
        }
    ];

    return (
        <section className="py-24 bg-[#f6f7f8]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl font-bold tracking-tight mb-4 font-display">Cách thức hoạt động</h2>
                    <p className="text-slate-600 font-display">Ba bước đơn giản để đạt được sự lưu loát.</p>
                </div>
                <div className="grid md:grid-cols-4 gap-12 relative">
                    <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-slate-200 -z-0"></div>
                    {steps.map((step) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center text-center group">
                            <div className="size-20 bg-white rounded-full flex items-center justify-center border-4 border-[#f6f7f8] shadow-xl text-[#137fec] text-3xl font-bold group-hover:bg-[#137fec] group-hover:text-white transition-all duration-300 font-display">
                                {step.id}
                            </div>
                            <h3 className="mt-6 text-xl font-bold font-display">{step.title}</h3>
                            <p className="mt-3 text-slate-600 font-display">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="text-[#137fec]">
                                <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                                    <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <span className="text-xl font-bold font-display">English Pro</span>
                        </div>
                        <p className="text-slate-600 max-w-xs mb-6 font-display">Thúc đẩy giao tiếp toàn cầu thông qua việc làm chủ ngôn ngữ bằng AI.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 font-display">Nền tảng</h4>
                        <ul className="space-y-2 text-sm text-slate-600 font-display">
                            <li><a href="#" className="hover:text-[#137fec] transition-colors">Dự án</a></li>
                            <li><a href="#" className="hover:text-[#137fec] transition-colors">Xếp hạng</a></li>
                            <li><a href="#" className="hover:text-[#137fec] transition-colors">Từ điển</a></li>
                            <li><a href="#" className="hover:text-[#137fec] transition-colors">Công cụ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 font-display">Tài nguyên</h4>
                        <ul className="space-y-2 text-sm text-slate-600 font-display">
                            <li><a href="#" className="hover:text-[#137fec] transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-[#137fec] transition-colors">Cộng đồng</a></li>
                            <li><a href="#" className="hover:text-[#137fec] transition-colors">Trợ giúp</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 font-display">Pháp lý</h4>
                        <ul className="space-y-2 text-sm text-slate-600 font-display">
                            <li><a href="#" className="hover:text-[#137fec] transition-colors">Điều khoản</a></li>
                            <li><a href="#" className="hover:text-[#137fec] transition-colors">Bảo mật</a></li>
                            <li><a href="#" className="hover:text-[#137fec] transition-colors">Cookie</a></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500 font-display">© 2024 English Pro AI. Bảo lưu mọi quyền.</p>
                    <div className="flex gap-6">
                        <a href="#" className="text-slate-400 hover:text-[#137fec] transition-colors"><Globe className="w-5 h-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-[#137fec] transition-colors"><HelpCircle className="w-5 h-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-[#137fec] transition-colors"><Mail className="w-5 h-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-display">
            <main>
                <Hero />
                <Features />
                <AIFeedback />
                <HowItWorks />
            </main>
            {/* <Footer /> */}
        </div>
    );
}
