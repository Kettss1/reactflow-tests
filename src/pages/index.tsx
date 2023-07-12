import Head from 'next/head'
import styles from '@/styles/home.module.scss'
import Board from '@/components/board/board'
import { ReactFlowProvider } from 'reactflow'

export default function Home() {

  return (
    <>
      <Head>
        <title>WS Spike | Nodall</title>
        <meta name="description" content="Spike to Nodall" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.mainContainer}>
          <ReactFlowProvider>
            <Board></Board>
          </ReactFlowProvider>
        </div>
      </main>
    </>
  )
}
