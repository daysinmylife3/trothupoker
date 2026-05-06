import Cookies from 'js-cookie';
import { Player, Game } from '../types/poker';

const ROSTER_KEY = 'poker_players';
const HISTORY_KEY = 'poker_history';
const ACTIVE_GAME_KEY = 'poker_active_game';

export const storage = {
  getPlayers: (): Player[] => {
    const data = Cookies.get(ROSTER_KEY);
    return data ? JSON.parse(data) : [];
  },
  savePlayers: (players: Player[]) => {
    Cookies.set(ROSTER_KEY, JSON.stringify(players), { expires: 365 });
  },
  getHistory: (): Game[] => {
    const data = Cookies.get(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveHistory: (history: Game[]) => {
    Cookies.set(HISTORY_KEY, JSON.stringify(history), { expires: 365 });
  },
  getActiveGame: (): Game | null => {
    const data = Cookies.get(ACTIVE_GAME_KEY);
    return data ? JSON.parse(data) : null;
  },
  saveActiveGame: (game: Game) => {
    Cookies.set(ACTIVE_GAME_KEY, JSON.stringify(game), { expires: 7 });
  },
  clearActiveGame: () => {
    Cookies.remove(ACTIVE_GAME_KEY);
  }
};
