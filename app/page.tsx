'use client';

import { useState, useEffect } from 'react';
import { Player, Game, View } from './../types/poker';
import { storage } from './../lib/storage';
import { RosterManager } from './../components/RosterManager';
import { GameSetup } from './../components/GameSetup';
import { InGameTracker } from './../components/InGameTracker';
import { Settlement } from './../components/Settlement';
import { MatchHistory } from './../components/MatchHistory';
import { Button, cn } from './../components/ui';
import { Users, Play, History as HistoryIcon, Spade } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<View>('setup');
  const [roster, setRoster] = useState<Player[]>([]);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [history, setHistory] = useState<Game[]>([]);

  // Load data on mount to avoid hydration mismatch
  useEffect(() => {
    const loadedRoster = storage.getPlayers();
    const loadedActive = storage.getActiveGame();
    const loadedHistory = storage.getHistory();

    setRoster(loadedRoster);
    setHistory(loadedHistory);
    
    if (loadedActive) {
      setActiveGame(loadedActive);
      setView('playing');
    } else {
      setView(loadedRoster.length > 0 ? 'setup' : 'roster');
    }
    
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Spade className="w-12 h-12 text-blue-600 animate-pulse" />
      </div>
    );
  }

  const handleUpdateRoster = (newRoster: Player[]) => {
    setRoster(newRoster);
    storage.savePlayers(newRoster);
  };

  const handleStartGame = (game: Game) => {
    setActiveGame(game);
    storage.saveActiveGame(game);
    setView('playing');
  };

  const handleUpdateGame = (game: Game) => {
    setActiveGame(game);
    storage.saveActiveGame(game);
  };

  const handleSaveMatch = (finalGame: Game) => {
    const newHistory = [finalGame, ...history];
    setHistory(newHistory);
    storage.saveHistory(newHistory);
    storage.clearActiveGame();
    setActiveGame(null);
    setView('history');
  };

  const handleDeleteHistory = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa trận đấu này?')) return;
    const newHistory = history.filter(g => g.id !== id);
    setHistory(newHistory);
    storage.saveHistory(newHistory);
  };

  const handleUpdateHistory = (updatedGame: Game) => {
    const newHistory = history.map(g => g.id === updatedGame.id ? updatedGame : g);
    setHistory(newHistory);
    storage.saveHistory(newHistory);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight">
            <span className="text-2xl shrink-0 animate-bounce" style={{ animationDuration: '3s' }}>🍚</span>
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Nồi cơm của Xuân Bách
            </span>
          </div>
          
          <nav className="flex gap-1">
            <Button 
              variant={view === 'roster' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setView('roster')}
              disabled={!!activeGame && view !== 'settlement'}
              className={cn("font-black", view !== 'roster' && "text-zinc-950")}
            >
              <Users className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Danh sách</span>
            </Button>
            <Button 
              variant={(view === 'setup' || view === 'playing' || view === 'settlement') ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setView(activeGame ? 'playing' : 'setup')}
              className={cn("font-black", !(view === 'setup' || view === 'playing' || view === 'settlement') && "text-zinc-950")}
            >
              <Play className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{activeGame ? 'Trận đấu' : 'Trận mới'}</span>
            </Button>
            <Button 
              variant={view === 'history' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setView('history')}
              className={cn("font-black", view !== 'history' && "text-zinc-950")}
            >
              <HistoryIcon className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Lịch sử</span>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'roster' && (
          <RosterManager players={roster} onUpdate={handleUpdateRoster} />
        )}

        {view === 'setup' && (
          <GameSetup 
            roster={roster} 
            lastSelectedIds={history[0]?.players.map(p => p.id)}
            onStart={handleStartGame} 
          />
        )}

        {view === 'playing' && activeGame && (
          <InGameTracker 
            game={activeGame} 
            roster={roster}
            onUpdate={handleUpdateGame} 
            onEnd={() => setView('settlement')} 
          />
        )}

        {view === 'settlement' && activeGame && (
          <Settlement 
            game={activeGame} 
            roster={roster}
            onBack={() => setView('playing')} 
            onSave={handleSaveMatch} 
          />
        )}

        {view === 'history' && (
          <MatchHistory 
            history={history} 
            roster={roster}
            onUpdateRoster={handleUpdateRoster}
            onDelete={handleDeleteHistory} 
            onUpdate={handleUpdateHistory}
          />
        )}
      </main>

      <footer className="py-8 text-center text-zinc-400 text-xs border-t border-zinc-200 bg-white mt-auto">
        &copy; {new Date().getFullYear()} Nồi cơm của Xuân Bách. Tất cả dữ liệu được lưu trong trình duyệt.
      </footer>
    </div>
  );
}
