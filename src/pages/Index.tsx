import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123" // In production, this should be properly secured
};

export default function Index() {
  const [role, setRole] = useState<string>("view");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((role === "edit" || role === "admin") && !password) {
      toast({
        title: "Error",
        description: "Password is required for edit/admin access",
        variant: "destructive",
      });
      return;
    }

    // Check for admin credentials
    if (role === "admin") {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('userRole', 'admin');
        sessionStorage.setItem('username', username);
        navigate("/events");
      } else {
        toast({
          title: "Error",
          description: "Invalid admin credentials",
          variant: "destructive",
        });
        return;
      }
    } else if (role === "edit" && username && password) {
      sessionStorage.setItem('userRole', 'edit');
      sessionStorage.setItem('username', username);
      navigate("/events");
    } else if (role === "view" && username) {
      sessionStorage.setItem('userRole', 'view');
      sessionStorage.setItem('username', username);
      navigate("/events");
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-slate-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center">
          <div className="flex items-center">
            <img 
              src="/image.png"
              alt="College Logo" 
              className="h-16 w-16 object-cover rounded-lg shadow-sm"
            />
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-800 text-center">
                College Event Management System
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8 shadow-xl bg-white/95 backdrop-blur">
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
            Welcome Back
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <Input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Role
              </label>
              <Select 
                value={role} 
                onValueChange={setRole}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={role === "view" ? "Password not required" : "Enter your password"}
                disabled={role === "view"}
                className="w-full"
                required={role === "edit"}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-700 hover:bg-red-800 text-white"
            >
              Sign In
            </Button>
          </form>
        </Card>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-white border-t">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600">
          © 2024 College Event Management System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}