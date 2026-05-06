'use client';

import { Game } from '../types/poker';
import { Card } from './ui';
import { History, Calendar, Trophy, TrendingDown, TrendingUp } from 'lucide-react';

interface MatchHistoryProps {
  history: Game[];
}

export function MatchHistory({ history }: MatchHistoryProps) {
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <History className="w-6 h-6 text-zinc-600" />
        <h2 className="text-2xl font-bold">Lịch sử trận đấu</h2>
      </div>

      <div className="space-y-6">
        {sortedHistory.map((game) => (
          <Card key={game.id} className="overflow-hidden border-zinc-300">
            <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-300 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-800">
                <Calendar className="w-4 h-4" />
                {new Date(game.date).toLocaleDateString('vi-VN')} lúc {new Date(game.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm font-black text-zinc-950">
                Tổng gà: {game.players.reduce((sum, p) => sum + p.buyIn, 0)}
              </div>
            </div>
            
            <div className="p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {game.players
                .sort((a, b) => (b.netProfit || 0) - (a.netProfit || 0))
                .map((player, idx) => {
                  const isWinner = (player.netProfit || 0) > 0;
                  const isTopWinner = idx === 0 && isWinner;
                  
                  return (
                    <div key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-100/80">
                      <div className="flex items-center gap-2 min-w-0">
                        {isTopWinner ? (
                          <Trophy className="w-4 h-4 text-yellow-600 shrink-0" />
                        ) : isWinner ? (
                          <TrendingUp className="w-4 h-4 text-green-700 shrink-0" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span className="font-bold text-zinc-950 truncate">{player.name}</span>
                      </div>
                      <div className={`font-mono font-black ${isWinner ? 'text-green-700' : 'text-zinc-800'}`}>
                        {player.netProfit && player.netProfit > 0 ? `+${player.netProfit}` : player.netProfit}
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        ))}

        {history.length === 0 && (
          <div className="py-20 text-center text-zinc-800 border-2 border-dashed border-zinc-300 rounded-xl font-bold">
            Chưa có lịch sử trận đấu.
          </div>
        )}
      </div>
    </div>
  );
}
