
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For now, use simple credential validation since we don't have proper password hashing
      const validCredentials = {
        'anas': 'eva919123',
        'adminlocal': 'admin9094', 
        'adminuser': 'user123',
        'admin': 'admin123'
      };

      const expectedPassword = validCredentials[credentials.username as keyof typeof validCredentials];
      
      if (!expectedPassword || credentials.password !== expectedPassword) {
        throw new Error('Invalid credentials');
      }

      // Query the admin_users table to get user details
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', credentials.username)
        .eq('is_active', true)
        .single();

      if (error) {
        console.log('Admin user not found in database, creating session with default role');
        // Create session with default role if user not in database but credentials are valid
        const sessionData = {
          id: 'temp-' + Date.now(),
          username: credentials.username,
          role: credentials.username === 'anas' ? 'super_admin' : 'local_admin',
          sessionId: Date.now().toString(),
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('adminSession', JSON.stringify(sessionData));
      } else {
        // Update last_login if user exists in database
        await supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', adminUser.id);

        // Create session data
        const sessionData = {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
          sessionId: Date.now().toString(),
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('adminSession', JSON.stringify(sessionData));
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${credentials.username}!`,
      });

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <p className="text-gray-600">Enter your credentials to access the admin panel</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Test Credentials:</h4>
            <div className="text-xs space-y-1 text-gray-600">
              <p><strong>Super Admin:</strong> anas / eva919123</p>
              <p><strong>Local Admin:</strong> adminlocal / admin9094</p>
              <p><strong>User Admin:</strong> adminuser / user123</p>
              <p><strong>Default Admin:</strong> admin / admin123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
