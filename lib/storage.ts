import Cookies from 'js-cookie';
import { Player, Game } from '../types/poker';

const ROSTER_KEY = 'poker_players';
const HISTORY_KEY = 'poker_history';
const ACTIVE_GAME_KEY = 'poker_active_game';

export const storage = {
  getPlayers: (): Player[] => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem(ROSTER_KEY);
      if (localData) return JSON.parse(localData);
    }
    const cookieData = Cookies.get(ROSTER_KEY);
    if (cookieData) {
      try {
        const players = JSON.parse(cookieData);
        if (typeof window !== 'undefined') {
          localStorage.setItem(ROSTER_KEY, cookieData);
        }
        Cookies.remove(ROSTER_KEY);
        return players;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  },
  savePlayers: (players: Player[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ROSTER_KEY, JSON.stringify(players));
    }
  },
  getHistory: (): Game[] => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem(HISTORY_KEY);
      if (localData) return JSON.parse(localData);
    }
    const cookieData = Cookies.get(HISTORY_KEY);
    if (cookieData) {
      try {
        const history = JSON.parse(cookieData);
        if (typeof window !== 'undefined') {
          localStorage.setItem(HISTORY_KEY, cookieData);
        }
        Cookies.remove(HISTORY_KEY);
        return history;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  },
  saveHistory: (history: Game[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  },
  deleteHistoryItem: (id: string) => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem(HISTORY_KEY);
      if (localData) {
        try {
          const history: Game[] = JSON.parse(localData);
          const updated = history.filter(g => g.id !== id);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
    }
  },
  getActiveGame: (): Game | null => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem(ACTIVE_GAME_KEY);
      if (localData) return JSON.parse(localData);
    }
    const cookieData = Cookies.get(ACTIVE_GAME_KEY);
    if (cookieData) {
      try {
        const game = JSON.parse(cookieData);
        if (typeof window !== 'undefined') {
          localStorage.setItem(ACTIVE_GAME_KEY, cookieData);
        }
        Cookies.remove(ACTIVE_GAME_KEY);
        return game;
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  },
  saveActiveGame: (game: Game) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(game));
    }
  },
  clearActiveGame: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_GAME_KEY);
    }
  }
};
