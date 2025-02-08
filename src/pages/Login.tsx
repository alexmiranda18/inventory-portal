import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar.",
        variant: "destructive",
      });
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Email inválido",
        description: "Insira um endereço de email válido.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        toast({
          title: "Erro no login",
          description: data.message || "Credenciais inválidas.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar fazer login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: credentialResponse.credential }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        toast({
          title: "Erro no login com Google",
          description: data.message || "Ocorreu um erro ao fazer login com o Google.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar fazer login com o Google.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleLoginError = () => {
    toast({
      title: "Erro no login com Google",
      description: "Ocorreu um erro ao tentar fazer login com o Google.",
      variant: "destructive",
    });
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />

        <div className="flex min-h-screen items-center justify-center px-4 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg"
          >
            <div className="text-center">
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                Bem-vindo de volta
              </h2>
              <p className="mt-2 text-gray-600">
                Entre para acessar sua conta ou
                <br />
                <span className="block text-center">
                  <Link
                    to="/register"
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    registre-se aqui
                  </Link>
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Ou continue com
                  </span>
                </div>
              </div>

              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                useOneTap
                scope="openid profile email"
                render={({ onClick }) => (
                  <Button
                    type="button"
                    onClick={onClick}
                    className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FcGoogle className="mr-2 h-5 w-5" />
                    )}
                    {isLoading ? "Entrando..." : "Entrar com Google"}
                  </Button>
                )}
              />
            </form>
          </motion.div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;