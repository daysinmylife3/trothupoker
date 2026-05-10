'use client';

import { useState } from 'react';
import { Game } from '../types/poker';
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
  Banknote
} from 'lucide-react';

interface MatchHistoryProps {
  history: Game[];
  onDelete: (id: string) => void;
  onUpdate: (game: Game) => void;
}

export function MatchHistory({ history, onDelete, onUpdate }: MatchHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProfits, setEditProfits] = useState<Record<string, number>>({});
  const [editChipValue, setEditChipValue] = useState<number>(500);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <History className="w-6 h-6 text-zinc-600" />
        <h2 className="text-2xl font-bold">Lịch sử trận đấu</h2>
      </div>

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
    </div>
  );
}
