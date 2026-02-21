import React, { useState } from 'react';
import {
    User, History, CreditCard, LogOut,
    Flame, FileText, Star, Copy,
    Plus, Trash2, Zap, Sparkles,
    Mail, Camera
} from 'lucide-react';
import { Button, Input, Select, Switch, Slider, Tag } from 'antd';

const Profile: React.FC = () => {
    // State for interactivity
    const [difficulty, setDifficulty] = useState('Intermediate');
    const [dailyGoal, setDailyGoal] = useState(20);

    return (
        <div className="max-w-7xl mx-auto pb-8">
            {/* Main Layout Container */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left Sidebar */}
                <div className="w-full lg:w-80 shrink-0 space-y-6">
                    {/* Profile Summary Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-3xl font-bold border-4 border-white shadow-sm overflow-hidden">
                                <img src="https://picsum.photos/seed/profile/400" alt="Minh" className="w-full h-full object-cover" />
                            </div>
                            <button className="absolute bottom-0 right-0 bg-white border border-slate-200 p-1.5 rounded-full text-slate-500 hover:text-primary shadow-sm cursor-pointer transition-colors">
                                <Camera size={14} />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Minh Hoang</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Intermediate Learner</p>

                        <div className="mt-4 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 group cursor-pointer hover:border-blue-200 transition-colors">
                            <span className="text-xs font-mono text-slate-500 group-hover:text-primary">ID: LV-94620</span>
                            <Copy size={12} className="text-slate-400 group-hover:text-primary" />
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-2 space-y-1">
                            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-primary rounded-xl font-medium text-sm transition-colors">
                                <User size={18} /> Profile Details
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium text-sm transition-colors">
                                <History size={18} /> Translation History
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium text-sm transition-colors">
                                <CreditCard size={18} /> Subscription
                            </button>
                            <div className="h-px bg-slate-100 my-1 mx-2"></div>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors">
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 min-w-0 space-y-6">

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                <Flame size={24} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Streak</p>
                                <p className="text-xl font-bold text-slate-800">12 Days</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                                <FileText size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Translated</p>
                                <p className="text-xl font-bold text-slate-800">1,248</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                                <Star size={24} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Score</p>
                                <p className="text-xl font-bold text-slate-800">92%</p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                            <p className="text-sm text-slate-500">Manage your basic details and language settings.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                                <Input size="large" defaultValue="Minh Hoang" className="font-medium rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                                <Input size="large" defaultValue="minh.hoang@email.com" suffix={<span className="text-xs text-primary font-bold cursor-pointer hover:underline">Change</span>} className="font-medium rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Native Language</label>
                                <Select size="large" defaultValue="vietnamese" className="w-full font-medium" options={[{ value: 'vietnamese', label: 'Vietnamese (Tiếng Việt)' }]} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Interface Language</label>
                                <Select size="large" defaultValue="english" className="w-full font-medium" options={[{ value: 'english', label: 'English' }]} />
                            </div>
                        </div>
                    </div>

                    {/* AI API Keys */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">AI API Keys</h3>
                                <p className="text-sm text-slate-500">Configure external AI providers.</p>
                            </div>
                            <Button type="primary" icon={<Plus size={16} />} className="font-bold bg-primary shadow-sm rounded-lg h-9 w-full sm:w-auto">Add Key</Button>
                        </div>

                        <div className="overflow-x-auto -mx-6 sm:mx-0">
                            <div className="inline-block min-w-full align-middle px-6 sm:px-0">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase font-bold border-b border-slate-100 bg-slate-50/50">
                                        <tr>
                                            <th className="py-3 pl-4 rounded-tl-lg whitespace-nowrap">Provider Name</th>
                                            <th className="py-3 whitespace-nowrap">Key</th>
                                            <th className="py-3 whitespace-nowrap">Status</th>
                                            <th className="py-3 text-right pr-4 rounded-tr-lg whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 pl-4 font-bold text-slate-800 flex items-center gap-3 whitespace-nowrap">
                                                <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Zap size={16} fill="currentColor" /></div>
                                                GPT-4
                                            </td>
                                            <td className="py-4 font-mono text-slate-500 text-xs whitespace-nowrap">sk-•••5a2b</td>
                                            <td className="py-4 whitespace-nowrap"><Tag color="success" className="font-bold border-0 px-2 py-0.5 rounded-full">Active</Tag></td>
                                            <td className="py-4 text-right pr-4 whitespace-nowrap"><Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer inline-block transition-colors" /></td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 pl-4 font-bold text-slate-800 flex items-center gap-3 whitespace-nowrap">
                                                <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Sparkles size={16} fill="currentColor" /></div>
                                                Claude 3
                                            </td>
                                            <td className="py-4 font-mono text-slate-500 text-xs whitespace-nowrap">sk-•••9x2s</td>
                                            <td className="py-4 whitespace-nowrap"><Tag className="font-bold text-slate-500 bg-slate-100 border-0 px-2 py-0.5 rounded-full">Inactive</Tag></td>
                                            <td className="py-4 text-right pr-4 whitespace-nowrap"><Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer inline-block transition-colors" /></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Learning Preferences */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Learning Preferences</h3>
                                <p className="text-sm text-slate-500">Study goals and difficulty.</p>
                            </div>
                            <Tag className="text-primary bg-blue-50 border-blue-100 font-bold px-2">ACTIVE</Tag>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-3">Target Difficulty</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                                        <div
                                            key={level}
                                            onClick={() => setDifficulty(level)}
                                            className={`text-center py-3 rounded-xl font-bold text-sm cursor-pointer transition-all border ${difficulty === level
                                                ? 'border-primary bg-blue-50 text-primary shadow-sm'
                                                : 'border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            {level}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-xs font-bold text-slate-700">Daily Goal</label>
                                    <span className="text-primary font-bold text-sm">{dailyGoal} <span className="text-slate-400 font-normal text-xs">sentences/day</span></span>
                                </div>
                                <Slider
                                    defaultValue={20}
                                    min={5}
                                    max={50}
                                    onChange={setDailyGoal}
                                    tooltip={{ open: false }}
                                    trackStyle={{ backgroundColor: '#198de6' }}
                                    handleStyle={{ borderColor: '#198de6', backgroundColor: '#198de6', boxShadow: 'none' }}
                                    railStyle={{ backgroundColor: '#e2e8f0' }}
                                />
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mt-1">
                                    <span>Casual (5)</span>
                                    <span>Regular (20)</span>
                                    <span>Intensive (50)</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm border border-slate-100 shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Email Feedback Alerts</p>
                                        <p className="text-xs text-slate-500">Receive an email when a teacher reviews your translation.</p>
                                    </div>
                                </div>
                                <Switch defaultChecked className="self-end sm:self-auto" />
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Account Security</h3>
                            <p className="text-sm text-slate-500">Update your password and secure your account.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">Password</p>
                                    <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                                </div>
                                <Button className="font-medium text-slate-600 rounded-lg w-full sm:w-auto">Change Password</Button>
                            </div>
                            <div className="h-px bg-slate-100"></div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">Two-Factor Authentication</p>
                                    <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                                </div>
                                <Button className="bg-slate-900 text-white hover:bg-slate-800 border-none font-bold rounded-lg h-9 w-full sm:w-auto">Enable 2FA</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;