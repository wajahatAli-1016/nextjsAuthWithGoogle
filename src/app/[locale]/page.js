"use client"
import React from 'react'
import styles from '../page.module.css'
import {useSession} from 'next-auth/react'

export default function LocalePage(){
    const {data: session} = useSession();
    if (session) {
        return (
          <div className={styles.container}>
            <h1>Welcome, {session.user.email}</h1>
            <h1>Welcome, {session.user.name}</h1>
          </div>
        );
      }
} 