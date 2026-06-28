'use client';

import { Game } from '../types/poker';
import { Button, Card, Input } from './ui';
import { Plus, Minus, CheckCheck, Coins } from 'lucide-react';

interface InGameTrackerProps {
  game: Game;
  onUpdate: (game: Game) => void;
  onEnd: () => void;
}

export function InGameTracker({ game, onUpdate, onEnd }: InGameTrackerProps) {
  const updatePlayerBuyIn = (id: string, newBuyIn: number) => {
    const updatedPlayers = game.players.map(p => 
      p.id === id ? { ...p, buyIn: newBuyIn } : p
    );
    onUpdate({ ...game, players: updatedPlayers });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Theo dõi trận đấu</h2>
        </div>
        <div className="text-sm font-bold text-zinc-700">
          Tổng gà: {game.players.reduce((sum, p) => sum + p.buyIn, 0)}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {game.players.map((player) => (
          <Card key={player.id} className="p-5 space-y-4 border-zinc-300">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="text-2xl shrink-0">{player.avatar || '👤'}</span>
                <h3 className="font-bold text-xl truncate text-zinc-950" title={player.name}>{player.name}</h3>
              </div>
              <div className="bg-zinc-200 px-2 py-1 rounded text-sm font-mono font-black text-zinc-950">
                {player.buyIn}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Tổng mua vào (Buy-in)
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updatePlayerBuyIn(player.id, player.buyIn - 50)}
                  className="flex-1 font-bold"
                >
                  <Minus className="w-3 h-3 mr-1" /> 50
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => updatePlayerBuyIn(player.id, player.buyIn + 50)}
                  className="flex-1 font-bold"
                >
                  <Plus className="w-3 h-3 mr-1" /> 50
                </Button>
              </div>
              
              <div className="relative">
                <Input 
                  type="number" 
                  value={player.buyIn}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') return updatePlayerBuyIn(player.id, 0);
                    const parsed = parseInt(val);
                    if (!isNaN(parsed)) updatePlayerBuyIn(player.id, parsed);
                  }}
                  className="text-center font-black text-lg"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-[10px] uppercase font-black">Sửa</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="pt-6">
        <Button 
          variant="secondary"
          onClick={onEnd} 
          className="w-full h-14 text-lg bg-zinc-900"
        >
          <CheckCheck className="w-5 h-5 mr-2" />
          Kết thúc & Tính toán
        </Button>
      </div>
    </div>
  );
}
