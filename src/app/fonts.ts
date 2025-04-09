import localFont from 'next/font/local';

export const alteHaasGrotesk = localFont({
  src: [
    {
      path: '../../public/fonts/AlteHaasGroteskRegular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AlteHaasGroteskBold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-alte-haas',
}); 