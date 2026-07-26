'use client';

import { useState, useMemo } from 'react';
import { Game, Player } from '../types/poker';
import { Card } from './ui';
import { 
  LineChart as LineChartIcon, 
  CalendarDays, 
  Filter, 
  Eye, 
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PerformanceChartProps {
  history: Game[];
  roster?: Player[];
  selectedMonth?: string;
  onSelectMonth?: (month: string) => void;
}

const PLAYER_COLORS = [
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0891b2', // Cyan
  '#ea580c', // Orange
  '#4f46e5', // Indigo
  '#0d9488', // Teal
  '#e11d48', // Rose
];

export function PerformanceChart({ 
  history, 
  roster = [], 
  selectedMonth: externalSelectedMonth,
  onSelectMonth
}: PerformanceChartProps) {
  // Current month key YYYY-MM
  const getCurrentMonthKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const currentMonthKey = getCurrentMonthKey();
  const [internalSelectedMonth, setInternalSelectedMonth] = useState<string>(currentMonthKey);

  const selectedMonth = externalSelectedMonth !== undefined ? externalSelectedMonth : internalSelectedMonth;

  const handleMonthChange = (month: string) => {
    if (onSelectMonth) {
      onSelectMonth(month);
    } else {
      setInternalSelectedMonth(month);
    }
  };

  // Collapse/expand state
  const [showChart, setShowChart] = useState(true);
  // Hidden player set for legend toggling
  const [hiddenPlayerIds, setHiddenPlayerIds] = useState<Set<string>>(new Set());
  // Hovered point index for interactive tooltip
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Available unique months from history
  const availableMonths = useMemo(() => {
    const historyMonthKeys = Array.from(
      new Set(
        history.map(g => {
          const d = new Date(g.date);
          if (isNaN(d.getTime())) return '';
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          return `${y}-${m}`;
        }).filter(Boolean)
      )
    );
    return Array.from(new Set([currentMonthKey, ...historyMonthKeys])).sort((a, b) => b.localeCompare(a));
  }, [history, currentMonthKey]);

  const getMonthLabel = (key: string) => {
    if (key === 'ALL') return 'Tất cả thời gian';
    const [year, month] = key.split('-');
    const isCurrent = key === currentMonthKey;
    return `Tháng ${parseInt(month, 10)}/${year}${isCurrent ? ' (Tháng này)' : ''}`;
  };

  // Filter games based on selected month & sort chronologically (oldest to newest)
  const sortedFilteredGames = useMemo(() => {
    const filtered = history.filter(game => {
      if (selectedMonth === 'ALL') return true;
      const d = new Date(game.date);
      if (isNaN(d.getTime())) return false;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}` === selectedMonth;
    });

    return [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history, selectedMonth]);

  // Collect all unique player info present in filtered games
  const playerMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string; avatar?: string; color: string }>();
    let colorIdx = 0;

    sortedFilteredGames.forEach(game => {
      game.players.forEach(p => {
        if (!map.has(p.id)) {
          const rosterP = roster.find(r => r.id === p.id);
          map.set(p.id, {
            id: p.id,
            name: rosterP?.name || p.name,
            avatar: rosterP?.avatar || p.avatar,
            color: PLAYER_COLORS[colorIdx % PLAYER_COLORS.length]
          });
          colorIdx++;
        }
      });
    });

    return map;
  }, [sortedFilteredGames, roster]);

  const allPlayerIds = useMemo(() => Array.from(playerMap.keys()), [playerMap]);

  // Build chart points (cumulative totals per match)
  const chartPoints = useMemo(() => {
    if (sortedFilteredGames.length === 0) return [];

    const runningTotals: Record<string, number> = {};
    allPlayerIds.forEach(id => { runningTotals[id] = 0; });

    // Baseline point
    const points = [
      {
        gameId: 'start',
        label: 'Đầu kỳ',
        fullDate: 'Điểm xuất phát (0 chip)',
        cumulative: { ...runningTotals },
        matchProfit: {} as Record<string, number>
      }
    ];

    sortedFilteredGames.forEach((game, idx) => {
      const d = new Date(game.date);
      const label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      const fullDate = `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

      const matchProfit: Record<string, number> = {};
      game.players.forEach(p => {
        const profit = p.netProfit || 0;
        matchProfit[p.id] = profit;
        runningTotals[p.id] = (runningTotals[p.id] || 0) + profit;
      });

      points.push({
        gameId: game.id,
        label: `${label} (#${idx + 1})`,
        fullDate,
        cumulative: { ...runningTotals },
        matchProfit
      });
    });

    return points;
  }, [sortedFilteredGames, allPlayerIds]);

  // Calculate Y-axis bounds
  const { minY, maxY, yTicks } = useMemo(() => {
    if (chartPoints.length === 0) return { minY: -10, maxY: 10, yTicks: [-10, 0, 10] };

    let minVal = 0;
    let maxVal = 0;

    const visiblePlayerIds = allPlayerIds.filter(id => !hiddenPlayerIds.has(id));

    chartPoints.forEach(pt => {
      visiblePlayerIds.forEach(id => {
        const val = pt.cumulative[id] || 0;
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;
      });
    });

    // Add padding margin
    const margin = Math.max(Math.ceil((maxVal - minVal) * 0.15), 10);
    let floorY = Math.floor((minVal - margin) / 5) * 5;
    let ceilY = Math.ceil((maxVal + margin) / 5) * 5;

    if (floorY > 0) floorY = 0;
    if (ceilY < 0) ceilY = 0;

    // Build ~5 clean Y tick values
    const step = Math.max(Math.ceil((ceilY - floorY) / 4 / 5) * 5, 5);
    const ticks: number[] = [];
    for (let v = floorY; v <= ceilY; v += step) {
      ticks.push(v);
    }
    if (!ticks.includes(0)) ticks.push(0);
    ticks.sort((a, b) => a - b);

    return {
      minY: ticks[0],
      maxY: ticks[ticks.length - 1],
      yTicks: ticks
    };
  }, [chartPoints, allPlayerIds, hiddenPlayerIds]);

  const togglePlayerVisibility = (id: string) => {
    setHiddenPlayerIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Dimensions for SVG
  const width = 640;
  const height = 320;
  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (chartPoints.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (chartPoints.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    if (maxY === minY) return paddingTop + chartHeight / 2;
    return paddingTop + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;
  };

  const activePoint = hoveredPointIndex !== null ? chartPoints[hoveredPointIndex] : null;

  return (
    <Card className="border-zinc-300 overflow-hidden shadow-md">
      {/* Header */}
      <div 
        onClick={() => setShowChart(!showChart)}
        className="bg-zinc-100 px-4 py-3 border-b border-zinc-300 flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:bg-zinc-200/70 transition-colors select-none"
      >
        <div className="flex flex-wrap items-center gap-2">
          <LineChartIcon className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="font-black text-sm uppercase tracking-wider text-zinc-950">
            Biểu Đồ Biến Động Điểm
          </span>
          <span className="bg-blue-500/10 text-blue-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-blue-500/30">
            {getMonthLabel(selectedMonth)}
          </span>
        </div>
        <div className="text-zinc-500">
          {showChart ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </div>

      {showChart && (
        <div className="p-4 sm:p-6 bg-white space-y-4">
        {/* Month selector control */}
        <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
            <Filter className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Thời gian biểu đồ:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleMonthChange(currentMonthKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedMonth === currentMonthKey
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              📅 Tháng hiện tại
            </button>

            <div className="relative inline-flex items-center flex-1 sm:flex-initial">
              <select
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className={`w-full sm:w-auto pl-8 pr-7 py-1.5 border rounded-lg text-xs font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none ${
                  selectedMonth !== currentMonthKey && selectedMonth !== 'ALL'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-500/20'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {availableMonths.map(mKey => {
                  const [y, m] = mKey.split('-');
                  const isCurrent = mKey === currentMonthKey;
                  return (
                    <option key={mKey} value={mKey}>
                      🗓️ Tháng {parseInt(m, 10)}/{y} {isCurrent ? '(Tháng này)' : ''}
                    </option>
                  );
                })}
                <option value="ALL">🏆 Tất cả thời gian</option>
              </select>
              <CalendarDays className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => handleMonthChange('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedMonth === 'ALL'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/20'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              🏆 Tất cả
            </button>
          </div>
        </div>

        {/* Legend Filter Bar */}
        {allPlayerIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-zinc-500 mr-1">Hiển thị Player:</span>
            {allPlayerIds.map(id => {
              const player = playerMap.get(id);
              if (!player) return null;
              const isHidden = hiddenPlayerIds.has(id);

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => togglePlayerVisibility(id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    isHidden
                      ? 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through opacity-60'
                      : 'bg-white text-zinc-800 border-zinc-300 shadow-sm hover:border-zinc-400'
                  }`}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: isHidden ? '#cbd5e1' : player.color }} 
                  />
                  <span>{player.name}</span>
                  {isHidden ? <EyeOff className="w-3 h-3 text-zinc-400" /> : <Eye className="w-3 h-3 text-zinc-400" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Chart SVG Canvas */}
        {sortedFilteredGames.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 my-2">
            <LineChartIcon className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-zinc-700">Chưa có dữ liệu biến động cho {getMonthLabel(selectedMonth)}</p>
            <p className="text-xs text-zinc-400 mt-1">Cần có ít nhất 1 trận đấu để hiển thị biểu đồ.</p>
          </div>
        ) : (
          <div className="relative bg-zinc-900/5 rounded-xl p-2 sm:p-4 border border-zinc-200">
            <div className="w-full overflow-x-auto">
              <svg 
                viewBox={`0 0 ${width} ${height}`} 
                className="w-full h-auto min-w-[500px] overflow-visible select-none"
                onMouseLeave={() => setHoveredPointIndex(null)}
              >
                {/* Horizontal Grid Lines & Y-axis labels */}
                {yTicks.map(tickVal => {
                  const yPos = getY(tickVal);
                  const isZero = tickVal === 0;

                  return (
                    <g key={tickVal}>
                      <line
                        x1={paddingLeft}
                        y1={yPos}
                        x2={width - paddingRight}
                        y2={yPos}
                        stroke={isZero ? '#475569' : '#e2e8f0'}
                        strokeWidth={isZero ? 1.5 : 1}
                        strokeDasharray={isZero ? '4 4' : undefined}
                      />
                      <text
                        x={paddingLeft - 8}
                        y={yPos + 4}
                        textAnchor="end"
                        className={`text-[10px] font-mono font-bold ${
                          isZero ? 'fill-zinc-700 font-extrabold' : tickVal > 0 ? 'fill-emerald-600' : 'fill-red-500'
                        }`}
                      >
                        {tickVal > 0 ? `+${tickVal}` : tickVal}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis labels */}
                {chartPoints.map((pt, idx) => {
                  const xPos = getX(idx);
                  const isHovered = hoveredPointIndex === idx;

                  return (
                    <g key={pt.gameId} className="cursor-pointer" onClick={() => setHoveredPointIndex(idx)}>
                      <text
                        x={xPos}
                        y={height - 12}
                        textAnchor="middle"
                        className={`text-[9px] font-bold ${
                          isHovered ? 'fill-blue-600 font-black text-[10px]' : 'fill-zinc-500'
                        }`}
                      >
                        {pt.label}
                      </text>
                      {/* Vertical Hover Guide Line */}
                      {isHovered && (
                        <line
                          x1={xPos}
                          y1={paddingTop}
                          x2={xPos}
                          y2={height - paddingBottom}
                          stroke="#3b82f6"
                          strokeWidth={1.5}
                          strokeDasharray="3 3"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Draw Player Lines */}
                {allPlayerIds.map(id => {
                  if (hiddenPlayerIds.has(id)) return null;
                  const player = playerMap.get(id);
                  if (!player) return null;

                  // Generate SVG path d string
                  const pathD = chartPoints.map((pt, idx) => {
                    const x = getX(idx);
                    const y = getY(pt.cumulative[id] || 0);
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');

                  return (
                    <g key={id}>
                      {/* Smooth Line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={player.color}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300 opacity-90 hover:opacity-100 hover:stroke-[3.5px]"
                      />

                      {/* Dots on points */}
                      {chartPoints.map((pt, idx) => {
                        const x = getX(idx);
                        const y = getY(pt.cumulative[id] || 0);
                        const isHovered = hoveredPointIndex === idx;

                        return (
                          <circle
                            key={`${id}-${idx}`}
                            cx={x}
                            cy={y}
                            r={isHovered ? 5.5 : 3.5}
                            fill={isHovered ? '#ffffff' : player.color}
                            stroke={player.color}
                            strokeWidth={isHovered ? 3 : 1.5}
                            className="cursor-pointer transition-all duration-150"
                            onMouseEnter={() => setHoveredPointIndex(idx)}
                          />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Invisible Hover Rect overlay for smooth tracking */}
                {chartPoints.map((_, idx) => {
                  const xPos = getX(idx);
                  const colWidth = chartWidth / Math.max(chartPoints.length, 1);
                  return (
                    <rect
                      key={idx}
                      x={xPos - colWidth / 2}
                      y={paddingTop}
                      width={colWidth}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Interactive Tooltip Card on Hover */}
            {activePoint && (
              <div className="mt-3 p-3 bg-white border border-zinc-200 rounded-xl shadow-lg animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2">
                  <span className="text-xs font-black text-zinc-900">📅 Trận: {activePoint.fullDate}</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{activePoint.label}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {allPlayerIds.map(id => {
                    if (hiddenPlayerIds.has(id)) return null;
                    const player = playerMap.get(id);
                    if (!player) return null;

                    const cumVal = activePoint.cumulative[id] || 0;
                    const matchVal = activePoint.matchProfit[id];

                    return (
                      <div 
                        key={id} 
                        className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-50 border border-zinc-150"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: player.color }} />
                          <span className="text-xs font-bold text-zinc-800 truncate">{player.name}</span>
                        </div>

                        <div className="text-right ml-2 shrink-0">
                          <span className={`text-xs font-mono font-black ${
                            cumVal > 0 ? 'text-emerald-600' : cumVal < 0 ? 'text-red-600' : 'text-zinc-600'
                          }`}>
                            {cumVal > 0 ? `+${cumVal}` : cumVal}
                          </span>
                          {matchVal !== undefined && (
                            <span className={`block text-[9px] font-mono font-bold ${
                              matchVal > 0 ? 'text-emerald-500' : matchVal < 0 ? 'text-red-500' : 'text-zinc-400'
                            }`}>
                              ({matchVal > 0 ? `+${matchVal}` : matchVal})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </Card>
  );
}
