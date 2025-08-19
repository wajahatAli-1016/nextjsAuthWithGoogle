"use client"
import dynamic from 'next/dynamic';

const Game = dynamic(() => import('../../game/page'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Loading game...
    </div>
  )
});

export default function LocalizedGame() {
  return <Game />;
} 