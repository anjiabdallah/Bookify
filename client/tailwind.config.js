import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        fairy: {
          'primary': '#E8739A',
          'secondary': '#F4A7B9',
          'accent': '#C45C8A',
          'neutral': '#3D1A26',
          'base-100': '#FFF0F5',
          'base-200': '#FFE4EF',
          'base-300': '#F9C8DA',
          'info': '#93C5FD',
          'success': '#86EFAC',
          'warning': '#FCD34D',
          'error': '#F87171',
        },
        fairydark: {
          'primary': '#E8739A',
          'secondary': '#7D3D5A',
          'accent': '#C45C8A',
          'neutral': '#FFE4EF',
          'base-100': '#1E0F15',
          'base-200': '#2A1520',
          'base-300': '#3D1A2C',
          'info': '#93C5FD',
          'success': '#86EFAC',
          'warning': '#FCD34D',
          'error': '#F87171',
        },
      },
    ],
  },
};
