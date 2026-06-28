'use client';

import { useState } from 'react';
import { Player } from '../types/poker';
import { Button, Input, Card } from './ui';
import { UserPlus, Trash2, Users } from 'lucide-react';

interface RosterManagerProps {
  players: Player[];
  onUpdate: (players: Player[]) => void;
}

const FRUIT_AVATARS = ['🍉', '🥑', '🍌', '🍎', '🍇', '🍓', '🍒', '🍍', '🍊', '🍋', '🍑', '🥝', '🥭', '🍐', '🥥'];

export function RosterManager({ players, onUpdate }: RosterManagerProps) {
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return FRUIT_AVATARS[Math.floor(Math.random() * FRUIT_AVATARS.length)];
  });

  const addPlayer = () => {
    if (!newName.trim()) return;
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      avatar: selectedAvatar,
    };
    onUpdate([...players, newPlayer]);
    setNewName('');

    // Choose an unused fruit for the next player
    const usedAvatars = [...players, newPlayer].map(p => p.avatar).filter(Boolean);
    const unused = FRUIT_AVATARS.filter(f => !usedAvatars.includes(f));
    const nextFruit = unused.length > 0 
      ? unused[Math.floor(Math.random() * unused.length)] 
      : FRUIT_AVATARS[Math.floor(Math.random() * FRUIT_AVATARS.length)];
    setSelectedAvatar(nextFruit);
  };

  const removePlayer = (id: string) => {
    onUpdate(players.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-black text-zinc-950">Danh sách người chơi</h2>
      </div>

      <div className="space-y-4 bg-white p-4 rounded-xl border border-zinc-300 shadow-sm">
        <div className="flex gap-2">
          <Input 
            placeholder="Nhập tên người chơi..." 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
            className="bg-zinc-50 border-zinc-300 focus:bg-white"
          />
          <Button onClick={addPlayer} className="shrink-0 font-bold cursor-pointer">
            <UserPlus className="w-4 h-4 mr-2" />
            Thêm
          </Button>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Chọn Icon Đại Diện (Trái Cây)</span>
          <div className="flex flex-wrap gap-2">
            {FRUIT_AVATARS.map((fruit) => {
              const isSelected = selectedAvatar === fruit;
              return (
                <button
                  key={fruit}
                  type="button"
                  onClick={() => setSelectedAvatar(fruit)}
                  className={`w-10 h-10 text-xl rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
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
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <Card key={player.id} className="p-3.5 flex items-center justify-between group hover:border-blue-400 transition-colors border-zinc-300">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200 shrink-0 text-xl shadow-sm">
                {player.avatar || '👤'}
              </div>
              <span className="font-bold text-zinc-950 truncate">{player.name}</span>
            </div>
            <button 
              onClick={() => removePlayer(player.id)}
              className="text-zinc-500 hover:text-red-600 transition-colors p-1 cursor-pointer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </Card>
        ))}
        {players.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-800 border-2 border-dashed border-zinc-300 rounded-xl font-bold">
            Chưa có người chơi nào.
          </div>
        )}
      </div>
    </div>
  );
}
