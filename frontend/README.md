# Monorepo is the source of Truth 


### Follow the instructions in order to run both backend and frontend. 


0. Install yarn if you haven't already. On UNIX, you can easily do so by: 

```curl -o- -L https://yarnpkg.com/install.sh | bash```

1. Populate your .env, and run: 
```supabase link --project-ref <project-id>```

2. Simply type ```yarn``` in the terminal for setup 

3. Run ```yarn dev``` in order to run backend and frontend concurrently. 

#Build Notes
- Uses .github/workflows/deploy.yml

1. Create the supabase project then
2. Add secrets in github actions