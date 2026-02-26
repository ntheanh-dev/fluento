import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlignLeft,
  FileText,
  PenLine,
  BarChart2,
  Globe,
  Brain,
  MessageSquare,
  ListOrdered,
  Info,
  ArrowRight,
  Clock,
  ChevronUp,
} from "lucide-react";
import {
  LEVELS,
  TOPIC_GROUPS,
  TONES,
  PRACTICE_TYPES,
  SENTENCE_COUNTS,
} from "../constants";
import { useCreateUserPracticeMutation } from "../mutation";
import type { PracticeSetupInput } from "../schema";
import { message } from "antd";

const PracticeSetup = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"sentence" | "paragraph" | "custom">(
    "paragraph",
  );

  const { mutateAsync: createUserPractice, isPending } =
    useCreateUserPracticeMutation();

  // Backend-aligned states
  const [selectedGroup, setSelectedGroup] = useState<number | null>(1);
  const [topic, setTopic] = useState<string>("LIFE");
  const [level, setLevel] = useState<string>("B1");
  const [tone, setTone] = useState<string>("FORMAL");
  const [type, setType] = useState<string>("BASIC");
  const [sentenceCount, setSentenceCount] = useState<string>("FIVE");
  const [customText, setCustomText] = useState<string>("");

  const handleStart = async () => {
    const payload: PracticeSetupInput = {
      type,
      topic: topic,
      level: level,
      tone: tone,
      sentenceCount: sentenceCount,
      customText: mode === "custom" ? customText : undefined,
    };

    try {
      const { id } = await createUserPractice(payload);
      navigate(`/session/${id}`);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; code?: number } };
        message?: string;
      };
      if (err.response?.data?.code === 1102) {
        message.error({
          content:
            "Bạn cần thêm API key để sử dụng tính năng này. Nhấn vào đây để thêm ngay!",
          onClick: () => navigate("/profile"),
          pauseOnHover: true,
          duration: 5,
        });
      } else {
        const errorMessage =
          err?.response?.data?.message ??
          err?.message ??
          "Tạo bài dịch thất bại. Vui lòng thử lại";
        message.error(errorMessage);
      }
    }
  };

  const handleReset = () => {
    setSelectedGroup(1);
    setTopic("LIFE");
    setLevel("A2");
    setTone("FORMAL");
    setType("BASIC");
    setSentenceCount("FIVE");
    setCustomText("");
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bắt đầu buổi luyện tập
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Chọn cách bạn muốn luyện dịch tiếng Việt sang tiếng Anh.
            </p>
          </div>

          {/* Mode Switch */}
          <div className="bg-slate-100 p-1.5 rounded-xl flex text-sm font-medium">
            <button
              onClick={() => setMode("paragraph")}
              className={`flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 ${
                mode === "paragraph"
                  ? "bg-white text-blue-600 shadow-sm font-bold"
                  : "text-slate-500"
              }`}
            >
              <FileText size={16} />
              Viết đoạn văn
            </button>

            <button
              onClick={() => setMode("sentence")}
              className={`flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 ${
                mode === "sentence"
                  ? "bg-white text-blue-600 shadow-sm font-bold"
                  : "text-slate-500"
              }`}
            >
              <AlignLeft size={16} />
              Dịch theo câu
            </button>

            <button
              onClick={() => setMode("custom")}
              className={`flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 ${
                mode === "custom"
                  ? "bg-white text-blue-600 shadow-sm font-bold"
                  : "text-slate-500"
              }`}
            >
              <PenLine size={16} />
              Tự do
            </button>
          </div>
        </div>

        {/* ================= COMMON CONFIG ================= */}
        {(mode === "sentence" || mode === "paragraph") && (
          <>
            <div className="py-3">
              <label className="text-sm font-bold flex items-center gap-2 py-2">
                <Globe size={16} />
                Chủ đề
              </label>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Groups List */}
                <div className="md:col-span-4 space-y-2">
                  {TOPIC_GROUPS.map((group) => (
                    <button
                      key={group.group}
                      onClick={() => {
                        setSelectedGroup(group.group);
                        setTopic(group.topics[0].value);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex justify-between items-center transition-all ${
                        selectedGroup === group.group
                          ? "bg-slate-100 text-slate-900 font-bold"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                    >
                      {group.label}
                      {selectedGroup === group.group}
                    </button>
                  ))}
                </div>

                {/* Topics Grid */}
                <div className="md:col-span-8 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    {TOPIC_GROUPS.find(
                      (g) => g.group === selectedGroup,
                    )?.topics.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTopic(t.value)}
                        className={`px-4 py-3 rounded-lg border text-sm transition-all text-left ${
                          topic === t.value
                            ? "bg-white border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500 font-medium"
                            : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* LEFT */}
              <div className="space-y-6">
                {/* Type */}
                {mode === "paragraph" && (
                  <div className="space-y-3">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <FileText size={16} />
                      Loại bài
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRACTICE_TYPES.filter(
                        (t) => t.value !== "CUSTOM_TEXT",
                      ).map((item) => (
                        <button
                          key={item.value}
                          onClick={() => setType(item.value)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border ${
                            type === item.value
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-slate-200 text-slate-600"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Level */}
                <div className="space-y-3">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Brain size={16} />
                    Trình độ
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {LEVELS.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setLevel(item.value)}
                        className={`py-2 rounded-lg text-sm font-bold border ${
                          level === item.value
                            ? "bg-orange-50 border-orange-200 text-orange-700 font-bold"
                            : "border-slate-200 text-slate-600"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="space-y-6">
                {/* Tone */}
                <div className="space-y-3">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <MessageSquare size={16} />
                    Văn phong
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 px-4"
                  >
                    {TONES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sentence Count */}
                {(mode === "sentence" || mode === "paragraph") && (
                  <div className="space-y-3">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <ListOrdered size={16} />
                      Số câu
                    </label>
                    <select
                      value={sentenceCount}
                      onChange={(e) => setSentenceCount(e.target.value)}
                      className="w-full rounded-xl border-slate-200 bg-slate-50 py-3 px-4"
                    >
                      {SENTENCE_COUNTS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Info */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <Info size={16} />
                    Thời gian ước tính
                  </h4>
                  <p className="text-xs text-amber-700">
                    Khoảng 10–20 phút tùy vào độ dài và trình độ.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= CUSTOM MODE ================= */}
        {mode === "custom" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Đoạn văn tiếng Việt của bạn</h2>

            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full min-h-[300px] rounded-xl border-2 border-slate-200 p-5"
              placeholder="Dán đoạn văn tiếng Việt vào đây..."
            />

            <div className="text-sm text-slate-400">
              {customText.length} ký tự
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-between items-center pt-6 border-t mt-8">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={16} />
            <span className="text-xs">Sẵn sàng bắt đầu luyện tập</span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-lg text-slate-500 font-bold"
            >
              Reset
            </button>

            <button
              onClick={handleStart}
              disabled={mode === "custom" && customText.length < 10}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? "Đang tạo bài dịch..." : "Bắt đầu"}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSetup;
