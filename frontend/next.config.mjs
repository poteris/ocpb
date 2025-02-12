/** @type {import('next').NextConfig} */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const nextConfig = {
    env: {
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
};

export default nextConfig;