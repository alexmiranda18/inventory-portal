import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Implement password reset logic here
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1000);
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
              Recuperar senha
            </h2>
            <p className="mt-2 text-gray-600">
              {submitted
                ? "Se existe uma conta com este e-mail, você receberá um link para redefinir sua senha."
                : "Digite seu e-mail e enviaremos instruções para redefinir sua senha"}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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

              <Button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? "Enviando..." : "Enviar instruções"}
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
          ) : (
            <div className="text-center mt-8">
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                variant="outline"
                className="mt-4"
              >
                Tentar novamente
              </Button>
              <div className="mt-4">
                <Link
                  to="/login"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Voltar para o login
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
