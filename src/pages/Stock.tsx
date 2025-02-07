
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function Stock() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stockMovements, isLoading } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: async () => {
      const response = await fetch("/api/stock-movements", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch stock movements");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Movimentações de Estoque</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nova Movimentação
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar movimentações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Observação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockMovements?.map((movement: any) => (
              <TableRow key={movement.id}>
                <TableCell>
                  {new Date(movement.date).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>{movement.product.name}</TableCell>
                <TableCell>
                  {movement.type === "IN" ? "Entrada" : "Saída"}
                </TableCell>
                <TableCell>{movement.quantity}</TableCell>
                <TableCell>{movement.observation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
