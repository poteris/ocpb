import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    // Get the admin password from environment variables
    const adminPassword = process.env.EVALS_ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("EVALS_ADMIN_PASSWORD environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Simple password comparison
    const isValidPassword = password === adminPassword;

    if (isValidPassword) {
      // Log successful authentication (without exposing password)
      console.log(`Evals dashboard access granted at ${new Date().toISOString()}`);
      
      return NextResponse.json(
        { authenticated: true },
        { status: 200 }
      );
    } else {
      // Log failed authentication attempt
      console.log(`Failed evals dashboard access attempt at ${new Date().toISOString()}`);
      
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error in evals auth:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
