"use client"
import React, { Suspense } from 'react'
import styles from '../page.module.css'
import {useSession} from 'next-auth/react'

function LocalePageContent(){
    const {data: session, status} = useSession();
    
    if (status === "loading") {
        return (
          <div className={styles.container}>
            <div>Loading...</div>
          </div>
        );
    }
    
    if (session) {
        return (
          <div className={styles.container}>
            <h1>Welcome, {session.user.email}</h1>
            <h1>Welcome, {session.user.name}</h1>
          </div>
        );
    }
    
    return (
      <div className={styles.container}>
        <div>Please log in to continue</div>
      </div>
    );
}

export default function LocalePage(){
    return (
      <Suspense fallback={
        <div className={styles.container}>
          <div>Loading...</div>
        </div>
      }>
        <LocalePageContent />
      </Suspense>
    );
} 