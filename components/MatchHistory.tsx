'use client';

import { useState } from 'react';
import { Game, Player } from '../types/poker';
import { Card, Button, Input } from './ui';
import { 
  History, 
  Calendar, 
  Trophy, 
  TrendingDown, 
  TrendingUp, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  AlertCircle,
  Banknote,
  Crown,
  Medal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MatchHistoryProps {
  history: Game[];
  roster?: Player[];
  onUpdateRoster?: (updatedRoster: Player[]) => void;
  onDelete: (id: string) => void;
  onUpdate: (game: Game) => void;
}

export function MatchHistory({ history, roster = [], onUpdateRoster, onDelete, onUpdate }: MatchHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProfits, setEditProfits] = useState<Record<string, number>>({});
  const [editChipValue, setEditChipValue] = useState<number>(500);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const startEditing = (game: Game) => {
    setEditingId(game.id);
    setEditProfits(
      Object.fromEntries(game.players.map(p => [p.id, p.netProfit || 0]))
    );
    setEditChipValue(game.chipValue || 500);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditProfits({});
  };

  const handleUpdateProfit = (playerId: string, value: number) => {
    setEditProfits(prev => ({ ...prev, [playerId]: value }));
  };

  const saveEdit = (game: Game) => {
    const total = Object.values(editProfits).reduce((sum, v) => sum + v, 0);
    if (total !== 0) {
      alert(`Tổng thắng thua phải bằng 0. Hiện tại đang là ${total > 0 ? '+' : ''}${total}.`);
      return;
    }

    const updatedPlayers = game.players.map(p => ({
      ...p,
      netProfit: editProfits[p.id] || 0,
      remainingChips: (p.buyIn || 0) + (editProfits[p.id] || 0)
    }));

    onUpdate({ 
      ...game, 
      players: updatedPlayers,
      chipValue: editChipValue
    });
    setEditingId(null);
  };

  const formatMoney = (value: number, chipValue: number = 500) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value * chipValue);
  };

  // Helper formatting functions for leaderboard
  const formatChips = (val: number) => {
    return val > 0 ? `+${val}` : `${val}`;
  };

  const getProfitColor = (val: number) => {
    if (val > 0) return 'text-green-600';
    if (val < 0) return 'text-red-600';
    return 'text-zinc-500';
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Compute leaderboard from history
  const leaderboard = Object.values(
    history.reduce((acc, game) => {
      game.players.forEach(p => {
        if (!acc[p.id]) {
          acc[p.id] = {
            id: p.id,
            name: p.name,
            totalNetProfit: 0,
            gamesPlayed: 0,
            avatar: p.avatar,
          };
        }
        acc[p.id].totalNetProfit += (p.netProfit || 0);
        acc[p.id].gamesPlayed += 1;
        acc[p.id].name = p.name; // Keep name fresh
        if (p.avatar) {
          acc[p.id].avatar = p.avatar; // Keep avatar fresh
        }
      });
      return acc;
    }, {} as Record<string, { id: string; name: string; totalNetProfit: number; gamesPlayed: number; avatar?: string }>)
  ).map(item => {
    // Override avatar with current roster avatar if exists
    const rosterPlayer = roster.find(r => r.id === item.id);
    return {
      ...item,
      avatar: rosterPlayer?.avatar || item.avatar,
    };
  }).sort((a, b) => b.totalNetProfit - a.totalNetProfit);

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const others = leaderboard.slice(3);

  const isRosterPlayer = (id: string) => roster.some(r => r.id === id);

  const startEditingAvatar = (id: string, fallbackPlayer: { id: string; name: string; avatar?: string }) => {
    const rosterPlayer = roster.find(r => r.id === id);
    if (rosterPlayer) {
      setEditingPlayer(rosterPlayer);
    }
  };

  const FRUIT_AVATARS = ['🍉', '🥑', '🍌', '🍎', '🍇', '🍓', '🍒', '🍍', '🍊', '🍋', '🍑', '🥝', '🥭', '🍐', '🥥'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <History className="w-6 h-6 text-zinc-600" />
        <h2 className="text-2xl font-bold">Lịch sử trận đấu</h2>
      </div>

      {/* Leaderboard Card */}
      {leaderboard.length > 0 && (
        <Card className="border-zinc-300 overflow-hidden shadow-md">
          <div 
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="bg-zinc-100 px-4 py-3 border-b border-zinc-300 flex justify-between items-center cursor-pointer hover:bg-zinc-200/70 transition-colors select-none"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="font-black text-sm uppercase tracking-wider text-zinc-950">Bảng Xếp Hạng Player</span>
            </div>
            <div className="text-zinc-500">
              {showLeaderboard ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </div>

          {showLeaderboard && (
            <div className="p-4 sm:p-6 bg-white transition-all duration-300">
              {/* Podium */}
              <div className="flex flex-col items-center justify-end pt-6 pb-4 border-b border-zinc-100">
                <div className="flex items-end justify-center w-full max-w-sm sm:max-w-md gap-2 sm:gap-4 h-56 sm:h-64 mx-auto">
                  
                  {/* Top 2 Stand */}
                  <div className="flex flex-col items-center flex-1 transition-all duration-300 hover:-translate-y-1">
                    {top2 ? (
                      <>
                        <div className="text-center mb-1.5 w-full">
                          <div 
                            onClick={() => isRosterPlayer(top2.id) && startEditingAvatar(top2.id, top2)}
                            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center font-bold text-zinc-700 shadow relative mx-auto ${
                              isRosterPlayer(top2.id) ? 'cursor-pointer hover:scale-105 hover:ring-2 hover:ring-blue-500/30 transition-all' : ''
                            }`}
                            title={isRosterPlayer(top2.id) ? "Click để đổi avatar" : ""}
                          >
                            {top2.avatar ? (
                              <span className="text-xl sm:text-2xl">{top2.avatar}</span>
                            ) : (
                              <span className="font-bold text-sm sm:text-base">{getInitials(top2.name)}</span>
                            )}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-zinc-400 text-white rounded-full p-0.5 shadow-sm">
                              <Medal className="w-3.5 h-3.5 text-zinc-100" />
                            </div>
                          </div>
                          <div className="font-bold text-xs sm:text-sm text-zinc-800 mt-1 truncate px-1 max-w-[80px] sm:max-w-[110px] mx-auto" title={top2.name}>
                            {top2.name}
                          </div>
                          <div className={`text-xs font-black ${getProfitColor(top2.totalNetProfit)}`}>
                            {formatChips(top2.totalNetProfit)}
                          </div>
                        </div>
                        <div className="w-full bg-gradient-to-t from-zinc-200 to-zinc-50 border-t border-zinc-300 rounded-t-lg h-20 sm:h-24 flex flex-col items-center justify-center shadow-sm">
                          <span className="text-xl sm:text-2xl font-black text-zinc-400">2</span>
                          <span className="text-[9px] sm:text-[10px] text-zinc-400 font-bold">{top2.gamesPlayed} trận</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-20 sm:h-24 bg-zinc-50 border border-dashed border-zinc-200 rounded-t-lg flex flex-col items-center justify-center text-zinc-300">
                        <span className="text-xl font-bold">2</span>
                        <span className="text-[8px] uppercase tracking-wider font-bold">Trống</span>
                      </div>
                    )}
                  </div>

                  {/* Top 1 Stand */}
                  <div className="flex flex-col items-center flex-1 transition-all duration-300 hover:-translate-y-1">
                    {top1 ? (
                      <>
                        <div className="text-center mb-1.5 w-full">
                          <div 
                            onClick={() => isRosterPlayer(top1.id) && startEditingAvatar(top1.id, top1)}
                            className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center font-black text-amber-800 shadow-md relative mx-auto ${
                              isRosterPlayer(top1.id) ? 'cursor-pointer hover:scale-105 hover:ring-2 hover:ring-blue-500/30 transition-all' : ''
                            }`}
                            title={isRosterPlayer(top1.id) ? "Click để đổi avatar" : ""}
                          >
                            {top1.avatar ? (
                              <span className="text-2xl sm:text-3xl">{top1.avatar}</span>
                            ) : (
                              <span className="font-black text-base sm:text-lg">{getInitials(top1.name)}</span>
                            )}
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 rounded-full p-0.5 shadow">
                              <Crown className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="font-black text-xs sm:text-base text-zinc-900 mt-1 truncate px-1 max-w-[90px] sm:max-w-[120px] mx-auto" title={top1.name}>
                            {top1.name}
                          </div>
                          <div className={`text-xs sm:text-sm font-black ${getProfitColor(top1.totalNetProfit)}`}>
                            {formatChips(top1.totalNetProfit)}
                          </div>
                        </div>
                        <div className="w-full bg-gradient-to-t from-yellow-400 to-yellow-100 border-t border-yellow-500 rounded-t-lg h-26 sm:h-32 flex flex-col items-center justify-center shadow relative overflow-hidden">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.35),transparent)] animate-pulse"></div>
                          <span className="text-2xl sm:text-3xl font-black text-yellow-700 relative z-10">1</span>
                          <span className="text-[9px] sm:text-[10px] text-yellow-800 font-bold relative z-10">{top1.gamesPlayed} trận</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-26 sm:h-32 bg-zinc-50 border border-dashed border-zinc-200 rounded-t-lg flex flex-col items-center justify-center text-zinc-300">
                        <span className="text-2xl font-bold">1</span>
                        <span className="text-[8px] uppercase tracking-wider font-bold">Trống</span>
                      </div>
                    )}
                  </div>

                  {/* Top 3 Stand */}
                  <div className="flex flex-col items-center flex-1 transition-all duration-300 hover:-translate-y-1">
                    {top3 ? (
                      <>
                        <div className="text-center mb-1.5 w-full">
                          <div 
                            onClick={() => isRosterPlayer(top3.id) && startEditingAvatar(top3.id, top3)}
                            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-orange-950 shadow relative mx-auto ${
                              isRosterPlayer(top3.id) ? 'cursor-pointer hover:scale-105 hover:ring-2 hover:ring-blue-500/30 transition-all' : ''
                            }`}
                            title={isRosterPlayer(top3.id) ? "Click để đổi avatar" : ""}
                          >
                            {top3.avatar ? (
                              <span className="text-xl sm:text-2xl">{top3.avatar}</span>
                            ) : (
                              <span className="font-bold text-sm sm:text-base">{getInitials(top3.name)}</span>
                            )}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-orange-400 text-orange-950 rounded-full p-0.5 shadow-sm">
                              <Medal className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <div className="font-bold text-xs sm:text-sm text-zinc-800 mt-1 truncate px-1 max-w-[80px] sm:max-w-[110px] mx-auto" title={top3.name}>
                            {top3.name}
                          </div>
                          <div className={`text-xs font-black ${getProfitColor(top3.totalNetProfit)}`}>
                            {formatChips(top3.totalNetProfit)}
                          </div>
                        </div>
                        <div className="w-full bg-gradient-to-t from-orange-200 to-orange-100 border-t border-orange-300 rounded-t-lg h-16 sm:h-20 flex flex-col items-center justify-center shadow-sm">
                          <span className="text-xl sm:text-2xl font-black text-orange-700/80">3</span>
                          <span className="text-[9px] sm:text-[10px] text-orange-700/80 font-bold">{top3.gamesPlayed} trận</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-16 sm:h-20 bg-zinc-50 border border-dashed border-zinc-200 rounded-t-lg flex flex-col items-center justify-center text-zinc-300">
                        <span className="text-lg font-bold">3</span>
                        <span className="text-[8px] uppercase tracking-wider font-bold">Trống</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Rank 4+ List */}
              {others.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Danh sách xếp hạng tiếp theo</h4>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {others.map((player, idx) => {
                      const rank = idx + 4;
                      return (
                        <div key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 text-center font-bold text-zinc-400 text-xs">#{rank}</span>
                            <div 
                              onClick={() => isRosterPlayer(player.id) && startEditingAvatar(player.id, player)}
                              className={`w-7 h-7 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center font-bold text-zinc-600 text-xs shrink-0 shadow-sm ${
                                isRosterPlayer(player.id) ? 'cursor-pointer hover:scale-105 hover:ring-2 hover:ring-blue-500/30 transition-all' : ''
                              }`}
                              title={isRosterPlayer(player.id) ? "Click để đổi avatar" : ""}
                            >
                              {player.avatar ? (
                                <span className="text-base">{player.avatar}</span>
                              ) : (
                                <span>{getInitials(player.name)}</span>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-zinc-900 block text-xs sm:text-sm">{player.name}</span>
                              <span className="text-[9px] text-zinc-500 font-medium">{player.gamesPlayed} trận</span>
                            </div>
                          </div>
                          
                          <div className={`font-mono font-bold text-xs sm:text-sm ${getProfitColor(player.totalNetProfit)}`}>
                            {formatChips(player.totalNetProfit)} chip
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <div className="space-y-6">
        {sortedHistory.map((game) => {
          const isEditing = editingId === game.id;
          const currentChipValue = isEditing ? editChipValue : (game.chipValue || 500);
          const totalProfit = isEditing 
            ? Object.values(editProfits).reduce((sum, v) => sum + v, 0)
            : game.players.reduce((sum, p) => sum + (p.netProfit || 0), 0);

          return (
            <Card key={game.id} className="overflow-hidden border-zinc-300">
              <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-300 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-800">
                    <Calendar className="w-4 h-4" />
                    {new Date(game.date).toLocaleDateString('vi-VN')} lúc {new Date(game.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm font-black text-zinc-950 flex items-center gap-3">
                    <span>Tổng gà: {game.players.reduce((sum, p) => sum + p.buyIn, 0)}</span>
                    <span className="text-zinc-400 font-bold">|</span>
                    <span className="flex items-center gap-1 text-blue-700">
                      <Banknote className="w-3 h-3" />
                      {currentChipValue.toLocaleString('vi-VN')} đ/chip
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {!isEditing ? (
                    <>
                      <button 
                        onClick={() => startEditing(game)}
                        className="text-zinc-400 hover:text-blue-600 transition-colors p-1"
                        title="Sửa kết quả"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => onDelete(game.id)}
                        className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                        title="Xóa trận đấu"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => saveEdit(game)}
                        className="text-green-600 hover:text-green-700 transition-colors p-1"
                        title="Lưu"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={cancelEditing}
                        className="text-zinc-400 hover:text-zinc-600 transition-colors p-1"
                        title="Hủy"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <label className="text-xs font-black uppercase text-blue-800 flex items-center gap-1">
                      <Banknote className="w-3 h-3" />
                      Giá trị mỗi chip:
                    </label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number"
                        value={editChipValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') return setEditChipValue(0);
                          const parsed = parseInt(val);
                          if (!isNaN(parsed)) setEditChipValue(parsed);
                        }}
                        className="h-8 w-32 font-black text-sm bg-white"
                      />
                      <span className="text-xs font-bold text-blue-800">VNĐ</span>
                    </div>
                  </div>
                  
                  {totalProfit !== 0 && (
                    <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                      <AlertCircle className="w-4 h-4" />
                      Tổng thắng thua đang không cân bằng: {totalProfit > 0 ? `+${totalProfit}` : totalProfit}
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {game.players
                  .sort((a, b) => {
                    if (isEditing) return 0;
                    return (b.netProfit || 0) - (a.netProfit || 0);
                  })
                  .map((player, idx) => {
                    const profit = isEditing ? (editProfits[player.id] || 0) : (player.netProfit || 0);
                    const isWinner = profit > 0;
                    const isTopWinner = !isEditing && idx === 0 && isWinner;
                    
                    return (
                      <div key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-100/80 gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {isTopWinner ? (
                              <Trophy className="w-4 h-4 text-yellow-600 shrink-0" />
                            ) : isWinner ? (
                              <TrendingUp className="w-4 h-4 text-green-700 shrink-0" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600 shrink-0" />
                            )}
                            <span className="font-bold text-zinc-950 truncate">{player.name}</span>
                          </div>
                          <div className="text-[10px] font-bold text-zinc-500 ml-6">
                            {formatMoney(profit, currentChipValue)}
                          </div>
                        </div>
                        
                        {isEditing ? (
                          <div className="w-24">
                            <Input 
                              type="number"
                              value={profit}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') return handleUpdateProfit(player.id, 0);
                                const parsed = parseInt(val);
                                if (!isNaN(parsed)) handleUpdateProfit(player.id, parsed);
                              }}
                              className="h-8 text-right font-black text-sm"
                            />
                          </div>
                        ) : (
                          <div className={`font-mono font-black ${isWinner ? 'text-green-700' : 'text-zinc-800'}`}>
                            {profit > 0 ? `+${profit}` : profit}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
              
              {isEditing && (
                <div className="px-4 pb-4">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => saveEdit(game)}
                    disabled={totalProfit !== 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </Button>
                </div>
              )}
            </Card>
          );
        })}

        {history.length === 0 && (
          <div className="py-20 text-center text-zinc-800 border-2 border-dashed border-zinc-300 rounded-xl font-bold">
            Chưa có lịch sử trận đấu.
          </div>
        )}
      </div>

      {/* Avatar Edit Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-sm p-6 bg-white border border-zinc-200 shadow-2xl relative">
            <button 
              onClick={() => setEditingPlayer(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-black text-zinc-950">Thay đổi Avatar</h3>
                <p className="text-xs font-bold text-zinc-500 mt-1">Đang chọn cho người chơi: <span className="text-zinc-800 font-extrabold">{editingPlayer.name}</span></p>
              </div>
              
              <div className="grid grid-cols-5 gap-2.5 justify-items-center py-2">
                {FRUIT_AVATARS.map((fruit) => {
                  const isSelected = editingPlayer.avatar === fruit;
                  return (
                    <button
                      key={fruit}
                      onClick={() => {
                        if (onUpdateRoster) {
                          const updatedRoster = roster.map(p => 
                            p.id === editingPlayer.id ? { ...p, avatar: fruit } : p
                          );
                          onUpdateRoster(updatedRoster);
                        }
                        
                        setEditingPlayer(prev => prev ? { ...prev, avatar: fruit } : null);
                        setTimeout(() => setEditingPlayer(null), 200);
                      }}
                      className={`w-11 h-11 text-2xl rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/50 scale-110 shadow-sm ring-2 ring-blue-500/20' 
                          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      {fruit}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
