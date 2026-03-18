import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Lock, Rocket, ShieldCheck } from 'lucide-react';
import { toast } from "sonner";

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('admin_secret', token);
      
      toast.success('Authenticated successfully');
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Failed to authenticate. Please check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md bg-black/40 border-white/10 backdrop-blur-xl z-10 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-2 border border-accent/20 ring-4 ring-accent/5">
            <ShieldCheck className="w-6 h-6 text-accent" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Admin Portal</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to manage your portfolio content
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="relative group">
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="bg-white/5 border-white/10 ring-offset-black focus:ring-accent transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-accent" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10 bg-white/5 border-white/10 ring-offset-black focus:ring-accent transition-all duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pb-8">
            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-white font-semibold transform transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Launch Builder'}
              <Rocket className="ml-2 w-4 h-4" />
            </Button>
            <p className="text-xs text-center text-muted-foreground/60 italic">
              "Great things are done by a series of small things brought together."
            </p>
          </CardFooter>
        </form>
      </Card>
      
      {/* Decorative dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
    </div>
  );
};

export default AdminLoginPage;
