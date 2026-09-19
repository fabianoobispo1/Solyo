export interface BarChartPoint {
  day: string;
  kwh: number;
  condition: "sunny" | "cloudy";
}

export interface BarChartProps {
  data: BarChartPoint[];
  className?: string;
}

const VIEWBOX_WIDTH = 560;
const CHART_TOP = 34;
const CHART_BOTTOM = 170;
const LABEL_Y = 190;
const GAP = 6;

export function BarChart({ data, className }: BarChartProps) {
  const maxKwh = Math.max(...data.map((point) => point.kwh), 1);
  const barWidth = (VIEWBOX_WIDTH - GAP * (data.length - 1)) / data.length;
  const chartHeight = CHART_BOTTOM - CHART_TOP;
  const gridLines = [0, 1, 2, 3];
  const todayIndex = data.length - 1;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} 200`}
      className={className}
      width="100%"
      preserveAspectRatio="none"
      role="img"
      aria-label="Geração diária dos últimos 14 dias"
    >
      {gridLines.map((line) => {
        const y = CHART_TOP + (chartHeight / (gridLines.length - 1)) * line;
        return (
          <line
            key={line}
            x1={0}
            y1={y}
            x2={VIEWBOX_WIDTH}
            y2={y}
            stroke="rgba(255,255,255,0.06)"
          />
        );
      })}

      <text x={0} y={CHART_TOP - 8} fontSize="9" fill="rgba(255,255,255,0.3)">
        {Math.round(maxKwh)} kWh
      </text>
      <text x={0} y={CHART_BOTTOM + 12} fontSize="9" fill="rgba(255,255,255,0.3)">
        0
      </text>

      {data.map((point, index) => {
        const isToday = index === todayIndex;
        const x = index * (barWidth + GAP);
        const barHeight = Math.max((point.kwh / maxKwh) * chartHeight, 4);
        const y = CHART_BOTTOM - barHeight;
        const fill = isToday
          ? "#F2A422"
          : point.condition === "cloudy"
            ? "rgba(30,55,75,0.8)"
            : "rgba(255,255,255,0.15)";

        const tooltipText = `${point.kwh} kWh`;
        const tooltipWidth = Math.max(barWidth + 8, tooltipText.length * 6.5 + 16);
        const tooltipX = Math.min(
          Math.max(x + barWidth / 2 - tooltipWidth / 2, 0),
          VIEWBOX_WIDTH - tooltipWidth
        );

        return (
          <g key={point.day}>
            {isToday && (
              <g>
                <rect
                  x={tooltipX}
                  y={y - 26}
                  width={tooltipWidth}
                  height={18}
                  rx="5"
                  fill="#F2A422"
                />
                <text
                  x={tooltipX + tooltipWidth / 2}
                  y={y - 14}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="var(--font-display)"
                  fill="#0F1720"
                  textAnchor="middle"
                >
                  {tooltipText}
                </text>
              </g>
            )}
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="5" fill={fill} />
            {isToday && (
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.min(6, barHeight)}
                rx="3"
                fill="rgba(255,255,255,0.25)"
              />
            )}
            <text
              x={x + barWidth / 2}
              y={LABEL_Y}
              fontSize="9"
              fill="rgba(255,255,255,0.3)"
              textAnchor="middle"
            >
              {point.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
