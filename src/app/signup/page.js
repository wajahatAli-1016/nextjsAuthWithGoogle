"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation";
import styles from "../page.module.css"
import Link from "next/link";
import image from "../../assets/google.png"

export default function LoginForm() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      });
    const [message, setMessage] = useState("")

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(e);
    
        try {
          const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body:JSON.stringify(form),
          });
    
          const data = await response.json();
    
          
    
          
          router.push('/'); 
        } catch (err) {
          console.log(err)
        } 
      };
    const { data: session } = useSession();
    const router = useRouter();

    if (session) {
        router.replace('/homePage')

        return null;
    }


    return (
        <Card className={styles.container}>
            <div className={styles.cardS}>
                <CardHeader>
                    <CardTitle className={styles.title}><h1>Sign up</h1></CardTitle>
                </CardHeader>
                <CardContent >
                    <form onSubmit={handleSubmit}>
                        <div>
                            <Label htmlFor="email"><h4>First Name</h4></Label>
                            <Input
                                className={styles.inputS}
                                id="first-name"
                                name="firstName"
                                type="text"
                                placeholder="first name"
                              
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email"><h4>Last Name</h4></Label>
                            <Input
                                className={styles.inputS}
                                id="last-name"
                                name="lastName"
                                type="text"
                                placeholder="last name"
                               
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email"><h4>Email</h4></Label>
                            <Input
                                className={styles.inputS}
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
                                className={styles.inputS}
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                minlength="8"
                               
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email"><h4>Confirm Password</h4></Label>
                            <Input
                                className={styles.inputS}
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                placeholder="Confirm password"
                              
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.message}>
                            <p>{message}</p>
                        </div>
                        <Button type="submit" className={styles.btn}>
                            Signup
                        </Button>
                        <div className={styles.link}>
            <Link href={"/"}>Already have an account? Login</Link>
          </div>
                        
                        <div className={styles.or}>
                            <h4 href={"/"}>OR</h4>
                        </div>
                        <div>
                            <button onClick={() => {
                                signIn("google")
                            }} className={styles.btnGoogle}><img className={styles.image} src={image.src} alt="Google logo"/></button>
                        </div>
                        
                       
                    </form>
                </CardContent>
            </div>
        </Card>
    )
}
