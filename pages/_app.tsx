import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { NextUIProvider } from '@nextui-org/react';
import { Wallet } from '../component/Wallet'
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Wallet>
      <NextUIProvider>
        <Component {...pageProps} />
        <Toaster/>
      </NextUIProvider>
    </Wallet>
  )
}

export default MyApp
