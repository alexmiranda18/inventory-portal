import { motion } from "framer-motion";
import { ArrowRight, BarChart2, Lock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

const features = [
  {
    icon: <Package className="h-6 w-6" />,
    title: "Gestão de Estoque",
    description: "Controle completo do seu inventário em tempo real",
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Segurança Avançada",
    description: "Autenticação segura e controle de acesso por níveis",
  },
  {
    icon: <BarChart2 className="h-6 w-6" />,
    title: "Análise de Dados",
    description: "Relatórios detalhados e métricas importantes",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-gray-900 mb-6"
          >
            Gerencie seu estoque com
            <span className="text-primary-600"> eficiência</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            Simplifique o controle do seu inventário com nossa plataforma
            intuitiva e segura.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/login">
              <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                Começar agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
