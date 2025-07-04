"use client";
import {FaGoogle} from "react-icons/fa"
import {signIn, useSession} from "next-auth/react"
import { useRouter } from "next/navigation" ;
import styles from './page.module.css'
const Home = () =>{
  const {data: session} = useSession();
  const router = useRouter();

  if(session){
    router.replace('/homePage')
    
    return null;
  }

  return(
  <>
    <div className={styles.container}>
     <h1>Login</h1>
     <h2>Login with google</h2>
     <button onClick={()=>{
      signIn("google")
     }}><FaGoogle className={styles.btn}/></button> 
     </div>
  </>
  )
}
export default Home;
