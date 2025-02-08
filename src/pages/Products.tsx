import { useState, useEffect } from "react";
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

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    categoryId: "",
    price: "",
    minStock: "",
    initialStock: "",
    image: null,
    description: "",
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const queryClient = useQueryClient();

  const apiUrl = import.meta.env.VITE_API_URL;

  const { data: products, isLoading } = useQuery({
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
        throw new Error("Falha ao buscar produtos");
      }
      return response.json();
    },
  });

  // Buscando categorias
  const { data: categories } = useQuery({
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
        throw new Error("Falha ao buscar categorias");
      }
      return response.json();
    },
  });

  // Mutation para criar produto usando FormData
  const createProductMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Falha ao criar produto");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsFormOpen(false);
      // Reinicia o formulário
      setNewProduct({
        name: "",
        sku: "",
        categoryId: "",
        price: "",
        minStock: "",
        initialStock: "",
        image: null,
        description: "",
      });
      setSelectedCategoryId("");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao atualizar produto");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsFormOpen(false);
      setNewProduct({
        name: "",
        sku: "",
        categoryId: "",
        price: "",
        minStock: "",
        initialStock: "",
        image: null,
        description: "",
      });
      setSelectedCategoryId("");
    },
  });

  // Mutation para excluir produto (permanece inalterada)
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        // Tenta parsear o JSON apenas se houver conteúdo
        const errorData = await response.json().catch(() => null);
        console.error("Erro ao excluir produto:", errorData);
        if (
          errorData?.message === "Cannot delete product with stock movements"
        ) {
          alert(
            "Não é possível excluir o produto devido a movimentações de estoque. Exclua as movimentações primeiro."
          );
        }
        throw new Error("Falha ao excluir produto");
      }

      // Se a resposta for 204, não tente parsear o JSON
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("Erro ao tentar excluir produto:", error.message);
    },
  });

  // Sincroniza o categoryId do produto com o estado do select
  useEffect(() => {
    setNewProduct((prev) => ({ ...prev, categoryId: selectedCategoryId }));
  }, [selectedCategoryId]);

  // Prepara os dados do formulário para envio via FormData
  const handleSubmit = () => {
    if (!selectedCategoryId) {
      alert("Selecione uma categoria antes de salvar.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("sku", newProduct.sku);
    formData.append("categoryId", selectedCategoryId);
    formData.append("price", newProduct.price);
    formData.append("minStock", newProduct.minStock);
    formData.append("initialStock", newProduct.initialStock);
    formData.append("stock", newProduct.initialStock); // Define o estoque inicial
    formData.append("description", newProduct.description);

    // Se "image" for um arquivo (File) adicione-o
    if (newProduct.image instanceof File) {
      formData.append("image", newProduct.image);
    } else if (newProduct.image) {
      // Em caso de edição, se já existir uma URL, pode ser enviada também
      formData.append("image", newProduct.image);
    }

    if (isEditing) {
      updateProductMutation.mutate({ id: editingProductId, formData });
    } else {
      createProductMutation.mutate(formData);
    }
  };

  // Trata a edição do produto (preenche o formulário)
  const handleEdit = (product) => {
    setIsEditing(true);
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name || "",
      sku: product.sku || "",
      categoryId: product.category?.id || "",
      price: product.price ? product.price.toString() : "",
      minStock: product.minStock ? product.minStock.toString() : "",
      initialStock: product.initialStock ? product.initialStock.toString() : "",
      // Se o produto já tiver uma imagem cadastrada, ela pode vir como URL
      image: product.image || null,
      description: product.description || "",
    });
    setSelectedCategoryId(product.category?.id || "");
    setIsFormOpen(true);
  };

  const handleDelete = async (productId) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir este produto e todas as suas movimentações de estoque?"
      )
    ) {
      try {
        await deleteProductMutation.mutateAsync(productId);
        alert("Produto e movimentações de estoque excluídos com sucesso!");
      } catch (error) {
        alert("Erro ao excluir produto e movimentações de estoque.");
      }
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const filteredProducts = products?.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      product.category.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Cabeçalho com título e botão para novo produto */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button
          onClick={() => {
            setIsFormOpen(true);
            setIsEditing(false);
            setEditingProductId(null);
            setNewProduct({
              name: "",
              sku: "",
              categoryId: "",
              price: "",
              minStock: "",
              initialStock: "",
              image: null,
              description: "",
            });
            setSelectedCategoryId("");
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {/* Busca */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Formulário de criação/edição */}
      {isFormOpen && (
        <div className="border p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">
            {isEditing ? "Editar Produto" : "Criar Novo Produto"}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Nome do produto"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <Input
              placeholder="SKU (Código do produto)"
              value={newProduct.sku}
              onChange={(e) =>
                setNewProduct({ ...newProduct, sku: e.target.value })
              }
            />
            <Select
              value={selectedCategoryId}
              onValueChange={(value) => setSelectedCategoryId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Preço"
              type="number"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
            />
            <Input
              placeholder="Estoque mínimo"
              type="number"
              value={newProduct.minStock}
              onChange={(e) =>
                setNewProduct({ ...newProduct, minStock: e.target.value })
              }
            />
            <Input
              placeholder="Estoque inicial"
              type="number"
              value={newProduct.initialStock}
              onChange={(e) =>
                setNewProduct({ ...newProduct, initialStock: e.target.value })
              }
            />
            {/* Campo para selecionar a imagem do produto */}
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Imagem do Produto
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setNewProduct({ ...newProduct, image: file });
                  }
                }}
                className="mt-1 block w-full"
              />
              {/* Pré-visualização da imagem selecionada (se for um arquivo) */}
              {newProduct.image && typeof newProduct.image !== "string" && (
                <img
                  src={URL.createObjectURL(newProduct.image)}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover"
                />
              )}
            </div>
            <Input
              placeholder="Descrição do produto"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                setIsEditing(false);
                setEditingProductId(null);
                setNewProduct({
                  name: "",
                  sku: "",
                  categoryId: "",
                  price: "",
                  minStock: "",
                  initialStock: "",
                  image: null,
                  description: "",
                });
                setSelectedCategoryId("");
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

      {/* Tabela de produtos com coluna de imagem */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Nova coluna para imagem */}
              <TableHead>Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.image_url && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${
                        product.image_url
                      }`}
                      alt={product.name}
                      className="w-12 h-12 object-cover"
                    />
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category.name}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(product.price)}
                </TableCell>
                <TableCell>{product.initial_stock}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(product.id)}
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
