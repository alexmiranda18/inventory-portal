import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Stock() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newMovement, setNewMovement] = useState({
    productId: "",
    type: "IN",
    quantity: 0,
    notes: "",
  });

  const queryClient = useQueryClient();

  const { data: stockMovements, isLoading } = useQuery({
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

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });
  

  const createMovementMutation = useMutation({
    mutationFn: async (movementData) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stock/movements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(movementData),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create stock movement");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      setIsFormOpen(false);
      setNewMovement({
        productId: "",
        type: "IN",
        quantity: 0,
        notes: "",
      });
    },
  });
  

  const handleSubmit = () => {
    if (!newMovement.productId || newMovement.quantity <= 0) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    createMovementMutation.mutate(newMovement);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Filtra as movimentações com base no termo de busca
  const filteredMovements = stockMovements?.filter((movement) => {
    const term = searchTerm.toLowerCase();
    return (
      movement.product.name.toLowerCase().includes(term) ||
      movement.type.toLowerCase().includes(term) ||
      movement.quantity.toString().includes(term) ||
      movement.notes.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Movimentações de Estoque</h1>
        <Button onClick={() => setIsFormOpen(true)}>
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

      {isFormOpen && (
        <div className="border p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Nova Movimentação</h2>
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={newMovement.productId}
              onValueChange={(value) =>
                setNewMovement({ ...newMovement, productId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={newMovement.type}
              onValueChange={(value) =>
                setNewMovement({ ...newMovement, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de movimentação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Entrada</SelectItem>
                <SelectItem value="OUT">Saída</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Quantidade"
              type="number"
              value={newMovement.quantity}
              onChange={(e) =>
                setNewMovement({
                  ...newMovement,
                  quantity: parseInt(e.target.value, 10),
                })
              }
            />
            <Input
              placeholder="Observação"
              value={newMovement.notes}
              onChange={(e) =>
                setNewMovement({ ...newMovement, notes: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                setNewMovement({
                  productId: "",
                  type: "IN",
                  quantity: 0,
                  notes: "",
                });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </div>
        </div>
      )}

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
            {filteredMovements?.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>
                  {new Date(movement.created_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>{movement.product.name}</TableCell>
                <TableCell>
                  {movement.type === "IN" ? "Entrada" : "Saída"}
                </TableCell>
                <TableCell>{movement.quantity}</TableCell>
                <TableCell>{movement.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
