"use client";

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface RadarChartProps {
  data: {
    criterion: string;
    score: number;
    fullMark: number;
  }[];
}

export const RadarChart = ({ data }: RadarChartProps) => {
  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#44403C" />
          <PolarAngleAxis 
            dataKey="criterion" 
            tick={{ fill: "#A8A29E", fontSize: 10, fontWeight: "bold" }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 20]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#FACC15"
            fill="#FACC15"
            fillOpacity={0.7}
            className="drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]"
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
};
