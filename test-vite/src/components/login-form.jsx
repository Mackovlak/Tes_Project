import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff, Loader2 } from "lucide-react"; 

import ApiCustomer from "@/api";
import Swal from "sweetalert2";
import { toast } from "sonner";

export function LoginForm({ className, ...props }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const { login } = useAuth();
  const [loading , setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      const res = await ApiCustomer.post("/api/auth/login", {
        identifier,
        password,
      });
      const { token } = res.data;
      login(token);
      sessionStorage.removeItem("Username");
      setLoading(false)
      toast.success("Login Successfull",{
        richColors: true
      })

      setTimeout(() => {
      window.location.href = "/app";
    }, 1000);

   } catch (error) {
      sessionStorage.setItem("Username", identifier);
      toast.error("Login failed ",{
        description: "Plase Check Back The Username And The Password",
        richColors: true
      } );
      // if (error.response?.data?.errors) {
      //   const messages = error.response.data.errors
      //     .map((err) => `${err.field}: ${err.message}`)
      //     .join("\n");
      //
      //   Swal.fire({
      //     title: "Validation Error",
      //     icon: "error",
      //     text: messages,
      //     allowOutsideClick: false,
      //   });
      // } else if (error.response?.data?.message) {
      //   Swal.fire({
      //     title: "Error",
      //     icon: "error",
      //     text: error.response.data.message,
      //     allowOutsideClick: false,
      //   });
      // } else {
      //   Swal.fire("Error", "Login Failed", "error");
      // }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = sessionStorage.getItem("Username");
    if (savedUser) setIdentifier(savedUser);
  }, []);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-0 shadow-2xl shadow-black/10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        <CardContent className="grid p-0 md:grid-cols-2">
          
          <form className="p-8 md:p-10 flex flex-col justify-center bg-white" onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col items-start text-left mb-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back, Partner</h1>
                <p className="text-muted-foreground mt-1">
                  Log in to your HP Partner account
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="identifier" className="text-gray-700">Username or Email</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter your username or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="rounded-md h-11 transition-all focus-visible:ring-[#0096D6]"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-md h-11 pr-10 transition-all focus-visible:ring-[#0096D6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>


              <Button 
                type="submit" 
                className="w-full bg-[#0096D6] hover:bg-[#007AAB] text-white h-11 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                { !loading ? 
                  (
                  "Login" 
                  )
                  :
                  (
                    <>
                    <Loader2 className="animate-spin" />
                    Logging in
                    </>
                  )
                } 
              </Button>
            </div>
          </form>

          <div className="bg-[#0096D6] relative hidden md:flex items-center justify-center p-12 group overflow-hidden">
            <img 
              src="/white_hp.png" 
              alt="HP Logo" 
              className="w-3/4 max-w-[250px] object-contain transition-transform duration-500 group-hover:scale-105" 
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
