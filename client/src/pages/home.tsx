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
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthForm = z.infer<typeof authSchema>;

export default function Home() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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
      console.log("Attempting login with email:", data.email);
      console.log("Firebase auth instance status:", auth ? "initialized" : "not initialized");

      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      console.log("Login successful:", userCredential.user);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      setLocation("/search");
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
        : error.code === 'auth/operation-not-allowed'
        ? "Email/Password sign-in is not enabled. Please contact support."
        : error.code === 'auth/auth-domain-config-required'
        ? "This domain is not authorized for Firebase Authentication. Please contact support."
        : error.message || "Login failed. Please try again.";

      console.error("Detailed error info:", {
        code: error.code,
        message: error.message,
        formattedMessage: errorMessage
      });

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

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      console.log("Registration successful:", userCredential.user);

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
        : error.code === 'auth/operation-not-allowed'
        ? "Email/Password registration is not enabled. Please contact support."
        : error.code === 'auth/weak-password'
        ? "Password is too weak. Please use at least 6 characters."
        : error.code === 'auth/auth-domain-config-required'
        ? "This domain is not authorized for Firebase Authentication. Please contact support."
        : error.message || "Registration failed. Please try again.";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="container max-w-lg mx-auto px-4 pt-8">
      <Card className="mt-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl hidden md:block">AIConnect</CardTitle>
          <CardDescription className="text-primary">
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