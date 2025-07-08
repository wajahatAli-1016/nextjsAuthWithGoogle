import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google"

import User from "../../../../../models/user"
import {connectToDB} from "../../../../../utils/database";

const handler = NextAuth({
    providers:[
        GoogleProvider({
            clientId:process.env.NEXTJS_PUBLIC_GOOGLE_ID,
            clientSecret:process.env.NEXTJS_PUBLIC_GOOGLE_SECRET,
        })
    ],
    callbacks:{
        async session({session}){
        
            return session
            
        },
        async signIn({account,profile,user,credentials}){
            try{
                  await connectToDB();
                  const checkEmail = await User.find({email:user.email})

                  if(checkEmail.length==0){
                    await User.insertMany({firstName:user.firstName,lastName:user.lastName,email:user.email,password:user.password});
                  }
                  return true;
            }
          
            catch(error){
               console.log(error)
               return false;
            }
        }
    }
})

export {handler as GET, handler as POST}