"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Github, Loader2, Chrome, LogOut } from "lucide-react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from "next-auth/react";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState("signin");
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handlesubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('/api/backend/v2/userinfo/new_user', {
        name,
        email,
        password,
      });

      if (res.status === 200) {
        router.push('/mailnode');
      } else {
        window.location.reload();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handlesign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        alert('Invalid credentials, please try again.');
      } else {
        router.push('/');
      }
    } catch (error) {
      alert('Error signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { callbackUrl: '/' });
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to EmailAI</DialogTitle>
        </DialogHeader>

        {/* ✅ If already logged in */}
        {session ? (
          <></>
        ) : (
          // ✅ If NOT logged in, show sign in / signup tabs
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <>
            
            </>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* --- Sign In Tab --- */}
            <TabsContent value="signin" className="mt-4">
              <form className="space-y-4" onSubmit={handlesign}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input onChange={(e) => setEmail(e.target.value)} id="email" type="email" placeholder="name@example.com" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input onChange={(e) => setPassword(e.target.value)} id="password" type="password" className="pl-9" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
              <div className="mt-4 space-y-2">
                <Button variant="outline" className="w-full flex gap-2" onClick={() => handleOAuthSignIn('google')}>
                  <Chrome className="h-4 w-4" /> Continue with Google
                </Button>
                <Button variant="outline" className="w-full flex gap-2" onClick={() => handleOAuthSignIn('github')}>
                  <Github className="h-4 w-4" /> Continue with GitHub
                </Button>
              </div>
            </TabsContent>

            {/* --- Sign Up Tab --- */}
            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handlesubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input onChange={(e) => setName(e.target.value)} id="name" type="text" placeholder="John Doe" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input onChange={(e) => setEmail(e.target.value)} id="signup-email" type="email" placeholder="name@example.com" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input onChange={(e) => setPassword(e.target.value)} id="signup-password" type="password" className="pl-9" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create Account"}
                </Button>
                <div className="mt-4 space-y-2">
                  <Button variant="outline" className="w-full flex gap-2" onClick={() => handleOAuthSignIn('google')}>
                    <Chrome className="h-4 w-4" /> Sign Up with Google
                  </Button>
                  <Button variant="outline" className="w-full flex gap-2" onClick={() => handleOAuthSignIn('github')}>
                    <Github className="h-4 w-4" /> Sign Up with GitHub
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
    </div>
  );
}
