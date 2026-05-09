'use client';

import { useState } from 'react';
import { Game, GamePlayer } from '../types/poker';
import { Button, Card, Input } from './ui';
import { Calculator, ArrowLeft, Save, AlertCircle, Banknote } from 'lucide-react';

interface SettlementProps {
  game: Game;
  onBack: () => void;
  onSave: (finalGame: Game) => void;
}

export function Settlement({ game, onBack, onSave }: SettlementProps) {
  const [remainingChips, setRemainingChips] = useState<Record<string, number>>(
    Object.fromEntries(game.players.map(p => [p.id, 0]))
  );
  const [chipValue, setChipValue] = useState<number>(game.chipValue || 500);

  const updateRemaining = (id: string, value: number) => {
    setRemainingChips(prev => ({ ...prev, [id]: value }));
  };

  const totalBuyIn = game.players.reduce((sum, p) => sum + p.buyIn, 0);
  const totalRemaining = Object.values(remainingChips).reduce((sum, v) => sum + v, 0);
  const diff = totalRemaining - totalBuyIn;

  const handleSave = () => {
    const settledPlayers: GamePlayer[] = game.players.map(p => {
      const remaining = remainingChips[p.id] || 0;
      return {
        ...p,
        remainingChips: remaining,
        netProfit: remaining - p.buyIn,
      };
    });

    onSave({
      ...game,
      players: settledPlayers,
      status: 'settled',
      chipValue,
    });
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value * chipValue);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold">Quyết toán</h2>
        </div>
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại trận đấu
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4 bg-zinc-100 border-zinc-300">
          <div className="space-y-1">
            <div className="text-sm text-zinc-700 font-bold">Trạng thái kiểm tra</div>
            <div className={`text-lg font-black flex items-center gap-2 ${diff === 0 ? 'text-green-700' : 'text-amber-700'}`}>
              {diff === 0 ? (
                <>Cân bằng (Tổng: {totalBuyIn})</>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Chênh lệch: {diff > 0 ? `+${diff}` : diff} 
                </>
              )}
            </div>
            {diff !== 0 && (
              <div className="text-xs font-bold text-zinc-500">
                Gà: {totalBuyIn}, Chip: {totalRemaining}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="space-y-1">
            <div className="text-sm text-blue-800 font-bold flex items-center gap-1">
              <Banknote className="w-4 h-4" />
              Giá trị 1 Chip
            </div>
            <div className="flex items-center gap-2">
              <Input 
                type="number"
                value={chipValue}
                onChange={(e) => setChipValue(parseInt(e.target.value) || 0)}
                className="font-black text-lg h-9 bg-white border-blue-300"
              />
              <span className="font-bold text-blue-800 text-sm whitespace-nowrap">VNĐ / Chip</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {game.players.map((player) => {
          const remaining = remainingChips[player.id] || 0;
          const profit = remaining - player.buyIn;
          return (
            <Card key={player.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 border-zinc-300">
              <div className="flex-1 min-w-0">
                <div className="font-black text-xl truncate text-zinc-950">{player.name}</div>
                <div className="text-sm text-zinc-700 font-bold flex justify-between sm:justify-start sm:gap-4">
                  <span>Đã mua: {player.buyIn}</span>
                  <span className="text-zinc-400">({formatMoney(player.buyIn)})</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <label className="text-[10px] font-black uppercase text-zinc-600 mb-1 block">Chip còn lại</label>
                  <Input 
                    type="number"
                    value={remaining}
                    onChange={(e) => updateRemaining(player.id, parseInt(e.target.value) || 0)}
                    className="font-black text-lg"
                  />
                </div>
                
                <div className={`w-36 text-right ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  <div className="text-[10px] font-black uppercase text-zinc-600 mb-1">Thắng/Thua</div>
                  <div className="font-black text-xl">
                    {profit > 0 ? `+${profit}` : profit}
                  </div>
                  <div className="text-xs font-bold opacity-80">
                    {formatMoney(profit)}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="pt-6">
        <Button 
          onClick={handleSave} 
          disabled={diff !== 0}
          className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5 mr-2" />
          {diff === 0 ? 'Lưu vào lịch sử' : `Chưa cân bằng (${diff > 0 ? '+' : ''}${diff})`}
        </Button>
      </div>
    </div>
  );
}
