import { ThemeConfig } from '../types';

export const THEME_CONFIGS: Record<string, ThemeConfig> = {
  default: {
    id: 'default',
    palette: {
      primary: '255 208 40',      // #FFD028 Retro Yellow
      secondary: '74 222 128',    // #4ADE80 Retro Green
      accent: '239 68 68',        // #EF4444 Retro Red
      background: {
        base: '255 249 240',      // #FFF9F0 Cream
        surface: '255 255 255',   // #FFFFFF White
      },
      text: {
        primary: '15 23 42',      // #0f172a slate-900
        secondary: '100 116 139', // #64748b slate-500
      },
      border: '226 232 240',      // slate-200
    },
    typography: {
      fontFamily: '"VT323", monospace',
      radiusBase: '0.5rem',       // 8px
    },
  },
  cyberpunk: {
    id: 'cyberpunk',
    palette: {
      primary: '252 226 5',       // #fce205 Cyber Yellow
      secondary: '255 0 60',      // #ff003c Cyber Red
      accent: '6 182 212',        // #06b6d4 Cyan
      background: {
        base: '11 12 16',         // #0b0c10 Deep dark
        surface: '31 40 51',      // #1f2833 Darker slate
      },
      text: {
        primary: '200 200 200',   // Light gray
        secondary: '102 252 241', // #66fcf1 Neon Cyan
      },
      border: '69 162 158',       // #45a29e Slate cyan
    },
    typography: {
      fontFamily: '"VT323", monospace', // keep pixel font or change if needed
      radiusBase: '0px',          // Sharp edges
    },
    assets: {
      backgroundUrl: '/assets/cyber-grid.png', // Just an example
    }
  },
  dark: {
    id: 'dark',
    palette: {
      primary: '255 208 40',
      secondary: '74 222 128',
      accent: '239 68 68',
      background: {
        base: '26 26 26',         // #1a1a1a
        surface: '45 45 45',      // #2d2d2d
      },
      text: {
        primary: '243 244 246',   // gray-100
        secondary: '156 163 175', // gray-400
      },
      border: '64 64 64',         // neutral-700
    },
    typography: {
      fontFamily: '"VT323", monospace',
      radiusBase: '0.5rem',
    },
  },
};
