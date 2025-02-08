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

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(categoryData),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create category");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsFormOpen(false);
      setNewCategory({ name: "", description: "" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, categoryData }) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(categoryData),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update category");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsFormOpen(false);
      setIsEditing(false);
      setEditingCategoryId(null);
      setNewCategory({ name: "", description: "" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Se a resposta for 204 (No Content), não tente parsear o JSON
      if (response.status === 204) {
        return null; // Retorna null ou um valor vazio
      }

      // Se a resposta não for 204, tente parsear o JSON
      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      return response.json(); // Parseia o JSON apenas se houver conteúdo
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      console.error("Erro ao excluir categoria:", error.message);
    },
  });

  const handleSubmit = () => {
    if (!newCategory.name) {
      alert("Preencha o nome da categoria.");
      return;
    }

    if (isEditing) {
      updateCategoryMutation.mutate({
        id: editingCategoryId,
        categoryData: newCategory,
      });
    } else {
      createCategoryMutation.mutate(newCategory);
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setEditingCategoryId(category.id);
    setNewCategory({
      name: category.name,
      description: category.description,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (categoryId) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const filteredCategories = categories?.filter((category) => {
    const term = searchTerm.toLowerCase();
    return (
      category.name.toLowerCase().includes(term) ||
      category.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isFormOpen && (
        <div className="border p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">
            {isEditing ? "Editar Categoria" : "Criar Nova Categoria"}
          </h2>
          <div className="space-y-4">
            <Input
              placeholder="Nome da categoria"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
            />
            <Input
              placeholder="Descrição da categoria"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                setIsEditing(false);
                setEditingCategoryId(null);
                setNewCategory({ name: "", description: "" });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(category.id)}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
