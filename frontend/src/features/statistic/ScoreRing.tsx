import React from 'react';

interface ScoreRingProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    color?: string;
}

const ScoreRing: React.FC<ScoreRingProps> = ({ score, size = 'md', label, color = '#198de6' }) => {
    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let containerSize = 'w-32 h-32';
    let textSize = 'text-4xl';

    if (size === 'sm') {
        containerSize = 'w-16 h-16';
        textSize = 'text-lg';
    } else if (size === 'lg') {
        containerSize = 'w-40 h-40';
        textSize = 'text-5xl';
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div className={`relative flex items-center justify-center ${containerSize}`}>
                <svg
                    height="100%"
                    width="100%"
                    viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                    className="transform -rotate-90"
                >
                    <circle
                        stroke="#e2e8f0"
                        strokeWidth={stroke}
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                    <circle
                        stroke={color}
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                        strokeLinecap="round"
                        fill="transparent"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className={`font-bold ${textSize} text-slate-800`}>{score}</span>
                    {size !== 'sm' && <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">out of 100</span>}
                </div>
            </div>
            {label && <span className={`mt-2 font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'} text-slate-600`}>{label}</span>}
        </div>
    );
};

export default ScoreRing;