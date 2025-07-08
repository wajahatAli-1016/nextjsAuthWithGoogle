import { NextResponse } from 'next/server';
import { connectToDB } from '../../../../utils/database'
import User from '../../../../models/user';
import bcrypt from 'bcryptjs';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;
        console.log('Login attempt for email:', email);
        console.log('Password provided:', password);

        if (!email || !password) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await connectToDB();
        const userExist = await User.findOne({ email });
        console.log('User found:', userExist ? 'Yes' : 'No');
        
        if (userExist) {
            console.log('User email:', userExist.email);
            console.log('Stored hashed password:', userExist.password);
            console.log('Password length:', userExist.password.length);
        }

        if (!userExist) {
            console.log('No user found with this email');
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, userExist.password);
        console.log('Password comparison result:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('Password does not match');
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }
        
        console.log('Login successful');
        return NextResponse.json({
            message: "Login successful",
            user: {
                id: userExist._id,
                email: userExist.email,
            },
        }, { status: 200 });

    } catch (error) {
        console.log('Login error:', error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}