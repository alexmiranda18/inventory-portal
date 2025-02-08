import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; // Importe useNavigate
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, User } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate(); // Inicialize o hook useNavigate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Registro bem-sucedido",
          description: "Sua conta foi criada com sucesso!",
        });
        navigate("/login"); // Redireciona para a página de login
      } else {
        toast({
          title: "Erro no registro",
          description: data.message || "Ocorreu um erro ao registrar.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no registro",
        description: "Ocorreu um erro ao tentar se conectar ao servidor.",
      });
    }
  };

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
              Crie sua conta
            </h2>
            <p className="mt-2 text-gray-600">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Entrar
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Campo para o nome completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Insira seu nome completo"
                    className="pl-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Campo para o email */}
              <div className="space-y-2">
                <Label htmlFor="email">Endereço de email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Insira seu e-mail"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Campo para a senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Criar uma senha"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700"
            >
              Criar uma conta
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}