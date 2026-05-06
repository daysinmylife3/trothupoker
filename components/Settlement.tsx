'use client';

import { useState } from 'react';
import { Game, GamePlayer } from '../types/poker';
import { Button, Card, Input } from './ui';
import { Calculator, ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface SettlementProps {
  game: Game;
  onBack: () => void;
  onSave: (finalGame: Game) => void;
}

export function Settlement({ game, onBack, onSave }: SettlementProps) {
  const [remainingChips, setRemainingChips] = useState<Record<string, number>>(
    Object.fromEntries(game.players.map(p => [p.id, 0]))
  );

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
    });
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

      <Card className="p-4 bg-zinc-100 border-zinc-300">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="text-sm text-zinc-700 font-bold">Trạng thái kiểm tra</div>
            <div className={`text-lg font-black flex items-center gap-2 ${diff === 0 ? 'text-green-700' : 'text-amber-700'}`}>
              {diff === 0 ? (
                <>Cân bằng (Tổng: {totalBuyIn})</>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Chênh lệch: {diff > 0 ? `+${diff}` : diff} 
                  <span className="text-sm font-bold">(Gà: {totalBuyIn}, Chip: {totalRemaining})</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {game.players.map((player) => {
          const remaining = remainingChips[player.id] || 0;
          const profit = remaining - player.buyIn;
          return (
            <Card key={player.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 border-zinc-300">
              <div className="flex-1 min-w-0">
                <div className="font-black text-xl truncate text-zinc-950">{player.name}</div>
                <div className="text-sm text-zinc-700 font-bold">Đã mua: {player.buyIn}</div>
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
                
                <div className={`w-24 text-right ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  <div className="text-[10px] font-black uppercase text-zinc-600 mb-1">Thắng/Thua</div>
                  <div className="font-black text-xl">
                    {profit > 0 ? `+${profit}` : profit}
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
          className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
        >
          <Save className="w-5 h-5 mr-2" />
          Lưu vào lịch sử
        </Button>
      </div>
    </div>
  );
}
