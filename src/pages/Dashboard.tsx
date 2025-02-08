import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, ArrowDown, ArrowUp, Package } from "lucide-react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  const { data: stockMovements, isLoading: isLoadingMovements } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stock/movements`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stock movements");
      }
      return response.json();
    },
  });

  if (isLoadingProducts || isLoadingMovements) {
    return <div>Carregando...</div>;
  }

  // Calcula o estoque atual de cada produto com base nas movimentações
  const productsWithStock = products?.map((product) => {
    const productMovements = stockMovements?.filter(
      (movement) => movement.product_id === product.id
    );

    // Encontra a movimentação inicial (se existir)
    const initialMovement = productMovements?.find(
      (movement) => movement.notes === "Initial stock"
    );

    // Usa a quantidade da movimentação inicial ou 0 se não houver
    const initialStock = initialMovement ? initialMovement.quantity : 0;

    const currentStock = productMovements?.reduce((total, movement) => {
      if (movement.notes === "Initial stock") return total; // Ignora movimentações iniciais no cálculo normal
      return (
        total +
        (movement.type === "IN" ? movement.quantity : -movement.quantity)
      );
    }, initialStock); // Usa o estoque inicial como base

    return {
      ...product,
      currentStock: currentStock || 0,
    };
  });

  // Calcula o total de produtos
  const totalProducts = productsWithStock?.length || 0;

  // Filtra produtos com baixo estoque
  const lowStockProducts = productsWithStock?.filter(
    (product) => product.currentStock <= product.min_stock // min_stock do banco de dados
  );

  // Total de produtos com baixo estoque
  const lowStockCount = lowStockProducts?.length || 0;

  // Filtra as movimentações de hoje
  const today = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD
  const todayMovements = stockMovements?.filter(
    (movement) => movement.created_at.split("T")[0] === today
  );

  // Calcula o total de entradas e saídas hoje
  let todayIncoming = 0;
  let todayOutgoing = 0;

  todayMovements?.forEach((movement) => {
    if (movement.type === "IN") {
      todayIncoming += movement.quantity;
    } else if (movement.type === "OUT") {
      todayOutgoing += movement.quantity;
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Produtos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Total de produtos cadastrados
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Produtos com Baixo Estoque
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {lowStockCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Abaixo do estoque mínimo
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Entradas (Hoje)
              </CardTitle>
              <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {todayIncoming}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de produtos que entraram hoje
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Saídas (Hoje)
              </CardTitle>
              <ArrowDown className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {todayOutgoing}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de produtos que saíram hoje
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabela: Total de Produtos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Total de Produtos</CardTitle>
            <CardDescription>
              Lista de todos os produtos com estoque atual
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Estoque Atual</TableHead>
                  <TableHead>Estoque Mínimo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsWithStock?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.currentStock}</TableCell>
                    <TableCell>{product.min_stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabela: Produtos com Baixo Estoque */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Produtos com Baixo Estoque</CardTitle>
            <CardDescription>
              Produtos que precisam de reposição imediata
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Estoque Atual</TableHead>
                  <TableHead>Estoque Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.currentStock}</TableCell>
                    <TableCell>{product.minStock}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                        Baixo Estoque
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabela: Últimas Movimentações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Últimas Movimentações</CardTitle>
            <CardDescription>
              Movimentações de estoque mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockMovements?.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {new Date(movement.created_at).toLocaleDateString(
                        "pt-BR"
                      )}
                    </TableCell>
                    <TableCell>
                      {movement.product
                        ? movement.product.name
                        : "Produto não encontrado"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          movement.type === "IN"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {movement.type === "IN" ? "Entrada" : "Saída"}
                      </span>
                    </TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
