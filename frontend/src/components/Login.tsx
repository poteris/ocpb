import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h1>
        </div>
        
        <form className="space-y-4">
          <div>
            <Input 
              type="email"
              placeholder="Email"
              className="w-full"
              required
            />
          </div>

          <div>
            <Input 
              type="password"
              placeholder="Password"
              className="w-full"
              required
            />
          </div>

          <div className="flex items-center justify-end">
            <Link 
              href="/" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4"
            >
              Forgot Password?
            </Link>
          </div>

          <Button className="w-full">
            Log in
          </Button>
        </form>
      </div>
    </div>
  );
}
