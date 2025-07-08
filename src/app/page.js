"use client";
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "./page.module.css"
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react"
import Link from "next/link";
import image from "../assets/google.png"


const Home = () => {
  const [form, setForm] = useState({ email: "", password: "" })
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }


  const handleSubmit = async(e) => {

    console.log("Login submitted:", form)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:JSON.stringify(form),
      });
      


      const data = await response.json();
      if(!response.ok){
        setMessage(data.message);
        return;
      }
      if(response.ok){
        router.push('/homePage'); 
      }
      
      

      
    } catch(err){
      console.log(err)
    }


  }
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.replace('/homePage')

    return null;
  }




  return (

    <Card className={styles.container}>
      <div className={styles.card}>
        <CardHeader>
          <CardTitle className={styles.titleL}><h1>Login</h1></CardTitle>
        </CardHeader>
        <CardContent >
          <form onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email"><h4>Email</h4></Label>
              <Input
                className={styles.input}
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"

                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="password"><h4>Password</h4></Label>
              <Input
                className={styles.input}
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"

                onChange={handleChange}
                required
              />
            </div>
            {message && (
        <p className={styles.red}>
          {message}
        </p>
      )}
            <Button type="submit" className={styles.btnL} >
              Login
            </Button>
            <div className={styles.linkL}>
              <Link href={"/signup"}>Don't have an account? Signup</Link>
            </div>
            <div className={styles.orL}>
              <h4 href={"/"}>OR</h4>
            </div>

            <div>
              <button onClick={() => {
                signIn("google")
              }} className={styles.btnGoogleL}><img className={styles.image} src={image.src} /></button>
            </div>

          </form>
        </CardContent>
      </div>
    </Card>
  )
}

export default Home;
