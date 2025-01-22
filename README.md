# Getting started
yarn
cd backend
yarn supabase start
yarn supabase db reset
yarn supabase status # Read the variables needed
cd ..
 Edit '.env' file and save the supabase variables and OpenAI key
cp .env backend/supabase/functions/
cp .env frontend/
yarn dev &

