"use client";

import { Activity, AlertTriangle, Radio, Shield, Zap } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Types
type IntervalType = number;  // For browser environments

interface RadiationData {
  CPS: number;
  CPM: number;
  Dose_uSv: number;
  Activity_Ci: number;
  Activity_Bq: number;
}

interface ChartDataPoint {
  time: string;
  uSvph: number;
  timestamp: number;
}

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  unit: string;
  danger?: boolean;
  index: number;
}

// Constants
const RADIATION_DANGER_THRESHOLD = 2.0;
const UPDATE_INTERVAL = 2000;
const MAX_CHART_POINTS = 20;

// Mock data generator with error handling
const createMockData = (): RadiationData => {
  try {
    return {
      CPS: Math.floor(Math.random() * 100) + 50,
      CPM: Math.floor(Math.random() * 6000) + 3000,
      Dose_uSv: parseFloat((Math.random() * 3).toFixed(3)),
      Activity_Ci: parseFloat((Math.random() * 0.001).toFixed(6)),
      Activity_Bq: Math.floor(Math.random() * 1000) + 500
    };
  } catch (error) {
    console.error('Error generating mock data:', error);
    return {
      CPS: 0,
      CPM: 0,
      Dose_uSv: 0,
      Activity_Ci: 0,
      Activity_Bq: 0
    };
  }
};

const GammaRaysDashboard: React.FC = () => {
  // States
  const [data, setData] = useState<RadiationData>({
    CPS: 0,
    CPM: 0,
    Dose_uSv: 0,
    Activity_Ci: 0,
    Activity_Bq: 0
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const alertRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const updateInterval = useRef<IntervalType | null>(null);

  // Setup and cleanup effect
  useEffect(() => {
    let isMounted = true;

    const updateData = () => {
      try {
        const newData = createMockData();
        if (isMounted) {
          setData(newData);
          setLastUpdate(new Date());
          setIsConnected(true);
          setError(null);

          setChartData(prev => {
            const newEntry: ChartDataPoint = {
              time: new Date().toLocaleTimeString(),
              uSvph: newData.Dose_uSv,
              timestamp: Date.now(),
            };
            return [...prev, newEntry].slice(-MAX_CHART_POINTS);
          });
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to update data';
          console.error('Update error:', errorMessage);
          setError(errorMessage);
          setIsConnected(false);
        }
      }
    };

    // Initial update
    updateData();

    // Set up interval
    const intervalId = window.setInterval(updateData, UPDATE_INTERVAL);
    updateInterval.current = intervalId;

    return () => {
      isMounted = false;
      if (updateInterval.current) {
        window.clearInterval(updateInterval.current);
        updateInterval.current = null;
      }
    };
  }, []);

  // Card animations
  useEffect(() => {
    const timeouts: number[] = [];

    cardsRef.current.forEach((card, index) => {
      if (card) {
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";
        
        const timeout = window.setTimeout(() => {
          if (card) {
            card.style.transition = "all 0.8s ease-out";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }
        }, index * 150);

        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach(window.clearTimeout);
    };
  }, []);

  // Alert animation
  useEffect(() => {
    if (!alertRef.current) return;

    const alertElement = alertRef.current;
    if (data.Dose_uSv > RADIATION_DANGER_THRESHOLD) {
      alertElement.classList.add("animate-pulse");
    } else {
      alertElement.classList.remove("animate-pulse");
    }
  }, [data.Dose_uSv]);

  const isDangerous = data.Dose_uSv > RADIATION_DANGER_THRESHOLD;
  const statusColor = isDangerous ? "bg-red-500" : "bg-green-500";
  const statusText = isDangerous ? "DANGER" : "SAFE";

  // Info Card Component
  const InfoCard = React.memo<InfoCardProps>(({ 
    icon: Icon, 
    title, 
    value, 
    unit, 
    danger = false, 
    index 
  }) => {
    if (!Icon || typeof value !== 'number') {
      return null;
    }

    return (
      <div
        ref={(el) => {
          if (cardsRef.current) {
            cardsRef.current[index] = el;
          }
        }}
        className={`
          relative overflow-hidden rounded-2xl shadow-2xl border-2 p-6 md:p-8
          transform transition-all duration-300 hover:scale-105 hover:shadow-3xl
          ${danger
            ? "bg-gradient-to-br from-red-50 to-red-100 border-red-300 shadow-red-200/50"
            : "bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-blue-200/50"
          }
        `}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Icon className={`w-8 h-8 md:w-10 md:h-10 ${danger ? "text-red-600" : "text-blue-600"}`} />
            <div
              className={`
              px-2 md:px-3 py-1 rounded-full text-xs font-bold
              ${danger ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}
            `}
            >
              {danger ? "HIGH" : "NORMAL"}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm md:text-lg font-semibold text-gray-700 mb-3">{title}</h3>

          {/* Value */}
          <div className="flex items-end space-x-2">
            <span
              className={`
              text-2xl md:text-4xl font-bold leading-none
              ${danger ? "text-red-600" : "text-blue-600"}
            `}
            >
              {typeof value === "number" 
                ? (value < 1 ? value.toFixed(6) : value.toLocaleString())
                : value
              }
            </span>
            <span className="text-gray-500 text-xs md:text-sm mb-1">{unit}</span>
          </div>
        </div>

        {/* Danger pulse effect */}
        {danger && (
          <div className="absolute inset-0 bg-red-400 opacity-20 animate-ping rounded-2xl"></div>
        )}
      </div>
    );
  });

  InfoCard.displayName = 'InfoCard';

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-red-400 text-center p-6">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500 rounded-full opacity-5 blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row items-center justify-center mb-6">
            <Radio className="w-12 h-12 md:w-16 md:h-16 text-blue-400 mb-4 md:mb-0 md:mr-4" />
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center">
              Gamma Rays Detection Dashboard
            </h1>
          </div>

          {/* Status Bar */}
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
                }`}
              ></div>
              <span className="text-sm text-gray-300">
                {isConnected ? "Connected to Firebase" : "Connecting..."}
              </span>
            </div>

            {lastUpdate && (
              <div className="text-sm text-gray-400">
                Last Update: {lastUpdate.toLocaleTimeString()}
              </div>
            )}

            <div className={`px-4 py-2 rounded-full text-sm font-bold ${statusColor} text-white shadow-lg`}>
              {statusText}
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {isDangerous ? (
          <div ref={alertRef} className="mb-8 mx-auto max-w-4xl">
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 border border-red-500 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-red-600 opacity-20 animate-pulse"></div>
              
              <div className="flex flex-col items-center space-y-4 relative z-10">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-yellow-300 animate-bounce" />
                  <h2 className="text-xl md:text-3xl font-extrabold text-white text-center">
                    ⚠️ HIGH RADIATION ALERT ⚠️
                  </h2>
                  <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-yellow-300 animate-bounce" />
                </div>

                <p className="text-red-100 text-center text-base md:text-lg">
                  Radiation levels exceed safe limits! Take immediate precautions 🚨
                </p>

                <div className="w-full bg-red-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    className="bg-red-600 h-4 animate-pulse transition-all duration-1000"
                    style={{ width: `${Math.min((data.Dose_uSv / 5) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-white font-bold text-center">
                  Current: {data.Dose_uSv} µSv/h • Danger threshold: 2.0 µSv/h
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 mx-auto max-w-4xl">
            <div className="bg-gradient-to-r from-green-600 to-green-700 border border-green-500 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4">
                <Shield className="w-8 h-8 md:w-10 md:h-10 text-green-300" />
                <div className="text-center md:text-left">
                  <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                    ✅ Safe Radiation Levels
                  </h2>
                  <p className="text-green-100">
                    All radiation measurements are within normal ranges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
          <InfoCard
            icon={Zap}
            title="Counts Per Second"
            value={data.CPS}
            unit="CPS"
            index={0}
          />
          <InfoCard
            icon={Activity}
            title="Counts Per Minute"
            value={data.CPM}
            unit="CPM"
            index={1}
          />
          <InfoCard
            icon={AlertTriangle}
            title="Dose Rate"
            value={data.Dose_uSv}
            unit="µSv/h"
            danger={isDangerous}
            index={2}
          />
          <InfoCard
            icon={Radio}
            title="Activity (Curie)"
            value={data.Activity_Ci}
            unit="Ci"
            index={3}
          />
        </div>

        {/* Chart Section */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-600">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 md:w-6 md:h-6 mr-3 text-blue-400" />
            Radiation Levels Over Time (Last 20 Readings)
          </h2>

          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF" 
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={11}
                  label={{
                    value: "µSv/h",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fill: "#9CA3AF" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                  labelStyle={{ color: "#9CA3AF" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="uSvph"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: "#60A5FA" }}
                  name="Dose Rate (µSv/h)"
                />
                {/* Danger threshold line */}
                <Line
                  type="monotone"
                  dataKey={() => 2.0}
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Danger Threshold (2.0 µSv/h)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-xs md:text-sm text-gray-400 text-center">
            * Red dashed line indicates the danger threshold (2.0 µSv/h)
          </div>
        </div>

        {/* Data Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-600">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Current Reading Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Counts Per Second:</span>
                <span className="text-white font-mono">{data.CPS} CPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Counts Per Minute:</span>
                <span className="text-white font-mono">{data.CPM} CPM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Dose Rate:</span>
                <span className={`font-mono ${isDangerous ? 'text-red-400' : 'text-green-400'}`}>
                  {data.Dose_uSv} µSv/h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Activity (Curie):</span>
                <span className="text-white font-mono">{data.Activity_Ci} Ci</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-600">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-400" />
              Safety Information
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Normal background radiation: 0.1-0.5 µSv/h</p>
              <p>• Alert threshold: 2.0 µSv/h</p>
              <p>• Current status: <span className={isDangerous ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>{statusText}</span></p>
              <p>• Data updates: Real-time via Firebase</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400">
          <p className="text-xs md:text-sm">
            Gamma Rays Detection and Alert System • Real-time monitoring • Powered by Firebase Realtime Database
          </p>
          <p className="text-xs mt-2">
            Last updated: {lastUpdate ? lastUpdate.toLocaleString() : 'Never'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GammaRaysDashboard;