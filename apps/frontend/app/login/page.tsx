"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Stars } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (email && password) {
        login({
          id: "1",
          name: "Astro Seeker",
          email: email,
          avatar: "/product.png?height=40&width=40",
        });
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        router.push("/chat");
      } else {
        toast({
          title: "Error",
          description: "Please fill in all fields.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="absolute inset-0 bg-[url('/product.png?height=1080&width=1920')] bg-cover bg-center opacity-10"></div>
      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Stars className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">Ask Guruji</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            by Asha Learnology
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <Button type="button" variant="outline" className="w-full">
              Login with Google
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-purple-600 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
