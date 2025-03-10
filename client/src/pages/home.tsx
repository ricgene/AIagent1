import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { loginUser, registerUser, resetPassword } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from 'react';
import { isFirebaseInitialized } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthForm = z.infer<typeof authSchema>;

export default function Home() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds total waiting time

    const checkInitialization = () => {
      console.log("Checking Firebase initialization status...");
      if (isFirebaseInitialized()) {
        console.log("Firebase initialized successfully");
        setIsInitializing(false);
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        console.error("Firebase initialization timed out");
        setIsInitializing(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize authentication. Please refresh the page.",
        });
        return;
      }

      setTimeout(checkInitialization, 100);
    };

    checkInitialization();
  }, [toast]);

  const loginForm = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLogin = async (data: AuthForm) => {
    try {
      if (!isFirebaseInitialized()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Authentication system is still initializing. Please try again in a moment.",
        });
        return;
      }

      console.log("Attempting login with email:", data.email);
      await loginUser(data.email, data.password);
      console.log("Login successful");

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      // Navigate to messages page after successful login
      setTimeout(() => setLocation("/messages"), 500);

    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.code === 'auth/user-not-found'
        ? "No account found with this email. Please check your email or sign up."
        : error.code === 'auth/wrong-password'
        ? "Incorrect password. Please try again."
        : error.code === 'auth/invalid-email'
        ? "Invalid email format. Please enter a valid email address."
        : error.code === 'auth/invalid-credential'
        ? "Invalid credentials. Please check your email and password."
        : error.message || "Login failed. Please try again.";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const onRegister = async (data: AuthForm) => {
    try {
      console.log("Attempting registration with email:", data.email);
      await registerUser(data.email, data.password);
      console.log("Registration successful");

      toast({
        title: "Success",
        description: "Account created successfully! You can now log in.",
      });

      registerForm.reset();
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? "An account with this email already exists."
        : error.code === 'auth/invalid-email'
        ? "Invalid email format. Please enter a valid email address."
        : error.code === 'auth/weak-password'
        ? "Password is too weak. Please use at least 6 characters."
        : error.message || "Registration failed. Please try again.";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email);
      toast({
        title: "Success",
        description: "Password reset email sent. Please check your inbox.",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset email.",
      });
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div>Initializing authentication...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto px-4 pt-8">
      <Card className="mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl text-primary">PRIZM Agent</CardTitle>
          <CardDescription>
            Connect with businesses using AI-powered matching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      const email = loginForm.getValues("email");
                      if (email) {
                        handleResetPassword(email);
                      } else {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: "Please enter your email address first.",
                        });
                      }
                    }}
                  >
                    Forgot Password?
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-4"
                >
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Choose a password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}