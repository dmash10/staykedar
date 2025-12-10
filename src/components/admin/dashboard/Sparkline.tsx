
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface SparklineProps {
    data: number[];
    color?: string;
    height?: number;
}

export const Sparkline = ({ data, color = '#3B82F6', height = 40 }: SparklineProps) => {
    const chartData = data.map((val, i) => ({ i, val }));

    return (
        <div style={{ height }} className="opacity-60 hover:opacity-100 transition-opacity duration-300">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <Line
                        type="monotone"
                        dataKey="val"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
