'use client';

import { useState } from 'react';
import { Player, Game } from '../types/poker';
import { Button, Card } from './ui';
import { Check, PlayCircle, Users } from 'lucide-react';

interface GameSetupProps {
  roster: Player[];
  lastSelectedIds?: string[];
  onStart: (game: Game) => void;
}

export function GameSetup({ roster, lastSelectedIds, onStart }: GameSetupProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(lastSelectedIds?.filter(id => roster.some(p => p.id === id)))
  );

  const togglePlayer = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleStart = () => {
    if (selectedIds.size < 2) return;
    
    const gamePlayers = roster
      .filter(p => selectedIds.has(p.id))
      .map(p => ({
        ...p,
        buyIn: 50,
      }));

    const newGame: Game = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      players: gamePlayers,
      status: 'active',
    };

    onStart(newGame);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Bắt đầu trận mới</h2>
        </div>
        <div className="text-sm font-bold text-zinc-700">
          Đã chọn {selectedIds.size} người
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roster.map((player) => {
          const isSelected = selectedIds.has(player.id);
          return (
            <Card 
              key={player.id} 
              className={`p-4 cursor-pointer transition-all border-2 ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-zinc-300 hover:border-zinc-400'
              }`}
              onClick={() => togglePlayer(player.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{player.avatar || '👤'}</span>
                  <span className={`font-bold truncate ${isSelected ? 'text-blue-900' : 'text-zinc-950'}`}>
                    {player.name}
                  </span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'bg-blue-600 border-blue-600' : 'border-zinc-400'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            </Card>
          );
        })}
        {roster.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-700 bg-zinc-100 rounded-xl font-medium">
            Vui lòng thêm người chơi vào danh sách trước.
          </div>
        )}
      </div>

      <div className="pt-6">
        <Button 
          onClick={handleStart} 
          disabled={selectedIds.size < 2}
          className="w-full h-14 text-lg"
        >
          <PlayCircle className="w-5 h-5 mr-2" />
          Bắt đầu trận đấu
        </Button>
      </div>
    </div>
  );
}
