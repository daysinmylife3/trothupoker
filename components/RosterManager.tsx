'use client';

import { useState } from 'react';
import { Player } from '../types/poker';
import { Button, Input, Card } from './ui';
import { UserPlus, Trash2, Users } from 'lucide-react';

interface RosterManagerProps {
  players: Player[];
  onUpdate: (players: Player[]) => void;
}

export function RosterManager({ players, onUpdate }: RosterManagerProps) {
  const [newName, setNewName] = useState('');

  const addPlayer = () => {
    if (!newName.trim()) return;
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: newName.trim(),
    };
    onUpdate([...players, newPlayer]);
    setNewName('');
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

      <div className="flex gap-2">
        <Input 
          placeholder="Nhập tên người chơi..." 
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
        />
        <Button onClick={addPlayer} className="shrink-0 font-bold">
          <UserPlus className="w-4 h-4 mr-2" />
          Thêm
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <Card key={player.id} className="p-4 flex items-center justify-between group hover:border-blue-400 transition-colors border-zinc-300">
            <span className="font-bold text-zinc-950 truncate">{player.name}</span>
            <button 
              onClick={() => removePlayer(player.id)}
              className="text-zinc-500 hover:text-red-600 transition-colors p-1"
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
