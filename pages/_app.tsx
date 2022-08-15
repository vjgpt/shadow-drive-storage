import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { NextUIProvider } from '@nextui-org/react';
import { Wallet } from '../component/Wallet'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Wallet>
      <NextUIProvider>
        <Component {...pageProps} />
      </NextUIProvider>
    </Wallet>
  )
}

export default MyApp
