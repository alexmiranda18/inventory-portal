import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
  
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });
  
      if (response.ok) {
        toast.success("Senha redefinida com sucesso!");
        navigate("/login");
      } else {
        const data = await response.json();
        toast.error(data.message || "Erro ao redefinir senha");
      }
    } catch (error) {
      toast.error("Erro ao redefinir senha");
    } finally {
      setIsLoading(false);
    }
  };
  
  

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Link inválido
            </h2>
            <p className="text-gray-600 mb-4">
              Este link de redefinição de senha é inválido ou expirou.
            </p>
            <Link
              to="/forgot-password"
              className="text-primary-600 hover:text-primary-500"
            >
              Solicitar novo link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
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
              Redefinir senha
            </h2>
            <p className="mt-2 text-gray-600">Digite sua nova senha abaixo</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Nova senha</Label>
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

              <div>
                <Label htmlFor="confirmPassword">Confirme a nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? "Redefinindo..." : "Redefinir senha"}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Voltar para o login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
