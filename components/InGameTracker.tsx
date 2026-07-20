'use client';

import { useState } from 'react';
import { Game, Player, GamePlayer } from '../types/poker';
import { Button, Card, Input } from './ui';
import { Plus, Minus, CheckCheck, Coins, UserPlus, X, Trash2 } from 'lucide-react';

const FRUIT_AVATARS = ['🍉', '🥑', '🍌', '🍎', '🍇', '🍓', '🍒', '🍍', '🍊', '🍋', '🍑', '🥝', '🥭', '🍐', '🥥'];
const ANIMAL_AVATARS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', 
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐣', '🦆', 
  '🐴', '🐎', '🦄', '🐝', '🦋', '🐢', '🐍', '🐙', '🦀', '🐬', 
  '🐳', '🦈', '🐊', '🦖', '🐘', '🦛', '🦒', '🦍', '🐑', '🐐'
];
const ALL_AVATARS = [...FRUIT_AVATARS, ...ANIMAL_AVATARS];

interface InGameTrackerProps {
  game: Game;
  roster?: Player[];
  onUpdate: (game: Game) => void;
  onUpdateRoster?: (players: Player[]) => void;
  onEnd: () => void;
}

export function InGameTracker({ game, roster = [], onUpdate, onUpdateRoster, onEnd }: InGameTrackerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'new'>('roster');
  const [initialBuyIn, setInitialBuyIn] = useState<number>(50);
  
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return ALL_AVATARS[Math.floor(Math.random() * ALL_AVATARS.length)];
  });

  const availableRoster = roster.filter(r => !game.players.some(p => p.id === r.id));

  const updatePlayerBuyIn = (id: string, newBuyIn: number) => {
    const updatedPlayers = game.players.map(p => 
      p.id === id ? { ...p, buyIn: Math.max(0, newBuyIn) } : p
    );
    onUpdate({ ...game, players: updatedPlayers });
  };

  const handleAddRosterPlayer = (player: Player) => {
    const newGamePlayer: GamePlayer = {
      ...player,
      buyIn: initialBuyIn > 0 ? initialBuyIn : 50,
    };
    onUpdate({
      ...game,
      players: [...game.players, newGamePlayer],
    });
  };

  const handleCreateAndAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: newPlayerName.trim(),
      avatar: selectedAvatar,
    };

    if (onUpdateRoster) {
      onUpdateRoster([...roster, newPlayer]);
    }

    const newGamePlayer: GamePlayer = {
      ...newPlayer,
      buyIn: initialBuyIn > 0 ? initialBuyIn : 50,
    };

    onUpdate({
      ...game,
      players: [...game.players, newGamePlayer],
    });

    setNewPlayerName('');
    const usedAvatars = [...roster, newPlayer].map(p => p.avatar).filter(Boolean);
    const unused = ALL_AVATARS.filter(f => !usedAvatars.includes(f));
    const nextAvatar = unused.length > 0 
      ? unused[Math.floor(Math.random() * unused.length)] 
      : ALL_AVATARS[Math.floor(Math.random() * ALL_AVATARS.length)];
    setSelectedAvatar(nextAvatar);
  };

  const handleRemovePlayer = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa ${name} khỏi trận đấu?`)) {
      const updatedPlayers = game.players.filter(p => p.id !== id);
      onUpdate({ ...game, players: updatedPlayers });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Coins className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-zinc-950">Theo dõi trận đấu</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200">
            Tổng gà: <span className="text-blue-600 font-black">{game.players.reduce((sum, p) => sum + p.buyIn, 0)}</span>
          </div>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Thêm người chơi
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {game.players.map((player) => {
          const rosterPlayer = roster.find(r => r.id === player.id);
          const avatar = rosterPlayer?.avatar || player.avatar || '👤';
          return (
            <Card key={player.id} className="p-5 space-y-4 border-zinc-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="text-2xl shrink-0">{avatar}</span>
                  <h3 className="font-bold text-xl truncate text-zinc-950" title={player.name}>{player.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-zinc-200 px-2 py-1 rounded text-sm font-mono font-black text-zinc-950">
                    {player.buyIn}
                  </div>
                  {game.players.length > 2 && (
                    <button 
                      onClick={() => handleRemovePlayer(player.id, player.name)}
                      className="text-zinc-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="Xóa khỏi trận"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
                    className="flex-1 font-bold cursor-pointer"
                  >
                    <Minus className="w-3 h-3 mr-1" /> 50
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => updatePlayerBuyIn(player.id, player.buyIn + 50)}
                    className="flex-1 font-bold cursor-pointer"
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
          );
        })}
      </div>

      <div className="pt-6">
        <Button 
          variant="secondary"
          onClick={onEnd} 
          className="w-full h-14 text-lg bg-zinc-900 cursor-pointer"
        >
          <CheckCheck className="w-5 h-5 mr-2" />
          Kết thúc & Tính toán
        </Button>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-2 font-bold text-lg text-zinc-900">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Thêm người chơi vào trận</span>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buy-in config header */}
            <div className="p-4 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">Buy-in ban đầu</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInitialBuyIn(Math.max(0, initialBuyIn - 50))}
                  className="h-8 px-2 border-blue-300 bg-white text-blue-900 font-bold cursor-pointer"
                >
                  -50
                </Button>
                <Input 
                  type="number" 
                  value={initialBuyIn}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setInitialBuyIn(isNaN(val) ? 0 : val);
                  }}
                  className="w-20 text-center font-black text-blue-950 h-8 border-blue-300 bg-white"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInitialBuyIn(initialBuyIn + 50)}
                  className="h-8 px-2 border-blue-300 bg-white text-blue-900 font-bold cursor-pointer"
                >
                  +50
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 bg-zinc-100/50">
              <button
                onClick={() => setActiveTab('roster')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'roster' 
                    ? 'border-blue-600 text-blue-600 bg-white' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Từ danh sách ({availableRoster.length})
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'new' 
                    ? 'border-blue-600 text-blue-600 bg-white' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                + Tạo người chơi mới
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {activeTab === 'roster' ? (
                <div>
                  {availableRoster.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {availableRoster.map((player) => (
                        <div 
                          key={player.id}
                          className="flex items-center justify-between p-3 border border-zinc-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-all bg-white"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="text-xl shrink-0">{player.avatar || '👤'}</span>
                            <span className="font-bold text-zinc-900 truncate">{player.name}</span>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleAddRosterPlayer(player)}
                            className="shrink-0 font-bold bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1.5 cursor-pointer text-white"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-3">
                      <p className="text-sm font-medium text-zinc-500">
                        Tất cả người chơi trong danh sách đã có trong trận đấu.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab('new')}
                        className="font-bold text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 mr-1" /> Tạo người chơi mới ngay
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">Tên người chơi</label>
                    <Input 
                      placeholder="Nhập tên người chơi..."
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateAndAddPlayer()}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">Chọn Icon đại diện</label>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-zinc-200 rounded-xl bg-zinc-50">
                      <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Trái Cây</div>
                      <div className="flex flex-wrap gap-1.5">
                        {FRUIT_AVATARS.map((fruit) => {
                          const isSelected = selectedAvatar === fruit;
                          return (
                            <button
                              key={fruit}
                              type="button"
                              onClick={() => setSelectedAvatar(fruit)}
                              className={`w-8 h-8 text-base rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-100 scale-110 ring-2 ring-blue-500/20' 
                                  : 'border-zinc-200 hover:bg-white'
                              }`}
                            >
                              {fruit}
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider pt-2">Động Vật</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ANIMAL_AVATARS.map((animal) => {
                          const isSelected = selectedAvatar === animal;
                          return (
                            <button
                              key={animal}
                              type="button"
                              onClick={() => setSelectedAvatar(animal)}
                              className={`w-8 h-8 text-base rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-100 scale-110 ring-2 ring-blue-500/20' 
                                  : 'border-zinc-200 hover:bg-white'
                              }`}
                            >
                              {animal}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreateAndAddPlayer}
                    disabled={!newPlayerName.trim()}
                    className="w-full font-bold h-11 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 mr-2" /> Tạo & Thêm vào trận (Buy-in: {initialBuyIn})
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex justify-end">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="font-bold cursor-pointer"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
