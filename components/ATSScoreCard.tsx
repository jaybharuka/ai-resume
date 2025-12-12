'use client';

import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ATSScoreCardProps {
  analysis: {
    total_score: number;
    breakdown: {
      keyword_match: number;
      impact_score: number;
      formatting_check: number;
      brevity_score: number;
    };
    missing_keywords: string[];
    feedback: string;
  } | null;
  isLoading: boolean;
  onAnalyze: () => void;
  onKeywordClick?: (keyword: string) => void;
}

export default function ATSScoreCard({ analysis, isLoading, onAnalyze, onKeywordClick }: ATSScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score < 50) return '#ef4444'; // Red
    if (score < 75) return '#eab308'; // Yellow
    return '#22c55e'; // Green
  };

  return (
    <div className="flex flex-col h-full">
      {!analysis ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="mb-4 text-gray-400">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">ATS Analysis</h3>
          <p className="text-sm text-gray-500 mb-6">
            Scan your resume against the job description to see your match score and missing keywords.
          </p>
          <button
            onClick={onAnalyze}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Scanning...' : 'Run ATS Scan'}
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">ATS Score</h3>
            <button 
              onClick={onAnalyze} 
              disabled={isLoading}
              className="text-xs text-blue-600 hover:underline"
            >
              {isLoading ? 'Scanning...' : 'Re-scan'}
            </button>
          </div>

          {/* Gauge */}
          <div className="w-32 h-32 mx-auto mb-6">
            <CircularProgressbar
              value={analysis.total_score}
              text={`${analysis.total_score}`}
              styles={buildStyles({
                textSize: '24px',
                pathColor: getScoreColor(analysis.total_score),
                textColor: getScoreColor(analysis.total_score),
                trailColor: '#f3f4f6',
              })}
            />
          </div>

          {/* Breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Keyword Match</span>
              <span className="font-medium">{analysis.breakdown.keyword_match}/40</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${(analysis.breakdown.keyword_match / 40) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Impact Score</span>
              <span className="font-medium">{analysis.breakdown.impact_score}/30</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full" 
                style={{ width: `${(analysis.breakdown.impact_score / 30) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Formatting</span>
              <span className="font-medium">{analysis.breakdown.formatting_check}/15</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${(analysis.breakdown.formatting_check / 15) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Brevity</span>
              <span className="font-medium">{analysis.breakdown.brevity_score}/15</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(analysis.breakdown.brevity_score / 15) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Missing Keywords */}
          {analysis.missing_keywords.length > 0 && (
            <div className="mb-6 bg-red-50 p-3 rounded border border-red-100">
              <h4 className="text-xs font-bold text-red-700 uppercase mb-2">Missing Keywords (Click to Fix)</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_keywords.map((keyword, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => onKeywordClick && onKeywordClick(keyword)}
                    className="px-2 py-1 bg-white text-red-600 text-xs rounded border border-red-200 hover:bg-red-100 hover:border-red-300 cursor-pointer transition-colors text-left"
                    title="Click to generate a bullet point for this skill"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Analysis</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {analysis.feedback}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
