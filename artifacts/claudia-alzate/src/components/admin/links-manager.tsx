import { useState } from "react";
import { 
  useGetLinks, 
  getGetLinksQueryKey, 
  useCreateLink, 
  useUpdateLink, 
  useDeleteLink,
  useReorderLinks
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit2, Check, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { getIconComponent } from "@/components/ui/icons";

// Ensure URLs saved to the DB always have a protocol prefix so they are never
// treated as relative paths by the browser.
const normalizeUrl = (url: string) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (/^mailto:|^tel:|^sms:/i.test(url)) return url;
  return `https://${url}`;
};

export function LinksManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const linksQueryKey = getGetLinksQueryKey();

  const { data: links = [], isLoading } = useGetLinks({
    query: { queryKey: linksQueryKey }
  });

  const createMutation = useCreateLink();
  const updateMutation = useUpdateLink();
  const deleteMutation = useDeleteLink();
  const reorderMutation = useReorderLinks();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);

  const [addForm, setAddForm] = useState({
    title: "",
    url: "",
    icon: "globe",
    description: "",
    active: true
  });

  // Drag & Drop
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const sortedLinks = [...links].sort((a, b) => a.order - b.order);

  const handleToggleActive = (id: number, active: boolean) => {
    updateMutation.mutate(
      { id, data: { active } },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: linksQueryKey })
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Seguro que quieres eliminar este enlace?")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: linksQueryKey });
            toast({ title: "Enlace eliminado" });
          }
        }
      );
    }
  };

  const handleStartEdit = (link: any) => {
    setEditingId(link.id);
    setEditForm({ ...link });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    const data = {
      ...editForm,
      url: normalizeUrl(editForm.url)
    };

    updateMutation.mutate(
      { id: editingId, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: linksQueryKey });
          setEditingId(null);
          toast({ title: "Enlace actualizado" });
        }
      }
    );
  };

  const handleAdd = () => {
    const data = {
      ...addForm,
      url: normalizeUrl(addForm.url)
    };

    createMutation.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: linksQueryKey });
          setIsAdding(false);

          setAddForm({
            title: "",
            url: "",
            icon: "globe",
            description: "",
            active: true
          });

          toast({ title: "Enlace agregado" });
        }
      }
    );
  };

  // ─────────────────────────────────────────────
  // DRAG & DROP
  // ─────────────────────────────────────────────

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    id: number
  ) => {
    setDraggedId(id);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(id));
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    id: number
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    targetId: number
  ) => {
    event.preventDefault();

    if (draggedId === null || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const currentLinks = [...sortedLinks];

    const fromIndex = currentLinks.findIndex(
      link => link.id === draggedId
    );

    const toIndex = currentLinks.findIndex(
      link => link.id === targetId
    );

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const [movedLink] = currentLinks.splice(fromIndex, 1);
    currentLinks.splice(toIndex, 0, movedLink);

    const reorderedLinks = currentLinks.map((link, index) => ({
      ...link,
      order: index
    }));

    // Cambia inmediatamente el orden en pantalla
    queryClient.setQueryData(
      linksQueryKey,
      reorderedLinks
    );

    // Guarda el orden nuevo en la base de datos
    reorderMutation.mutate(
      {
        data: {
          ids: reorderedLinks.map(link => link.id)
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: linksQueryKey
          });

          toast({
            title: "Orden actualizado"
          });
        },

        onError: () => {
          queryClient.invalidateQueries({
            queryKey: linksQueryKey
          });

          toast({
            title: "No se pudo guardar el nuevo orden",
            variant: "destructive"
          });
        }
      }
    );

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  if (isLoading) {
    return <div>Cargando enlaces...</div>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-foreground">
            Manage Links
          </h2>

          <p className="text-muted-foreground text-sm">
            Organiza los enlaces de tu perfil público.
          </p>
        </div>

        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isAdding ? (
            <X className="w-4 h-4 mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}

          {isAdding ? "Cancelar" : "Agregar Link"}
        </Button>
      </div>

      {/* ADD LINK */}
      {isAdding && (
        <Card className="border-primary/20 bg-card">
          <CardContent className="pt-6 space-y-4">

            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Título
                </label>

                <Input
                  value={addForm.title}
                  onChange={e =>
                    setAddForm({
                      ...addForm,
                      title: e.target.value
                    })
                  }
                  placeholder="Ej: Instagram"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  URL
                </label>

                <Input
                  value={addForm.url}
                  onChange={e =>
                    setAddForm({
                      ...addForm,
                      url: e.target.value
                    })
                  }
                  placeholder="https://..."
                />
              </div>

            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Ícono
                </label>

                <Input
                  value={addForm.icon}
                  onChange={e =>
                    setAddForm({
                      ...addForm,
                      icon: e.target.value
                    })
                  }
                  placeholder="instagram, whatsapp..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Descripción
                </label>

                <Input
                  value={addForm.description}
                  onChange={e =>
                    setAddForm({
                      ...addForm,
                      description: e.target.value
                    })
                  }
                  placeholder="Opcional"
                />
              </div>

            </div>

            <Button
              onClick={handleAdd}
              disabled={
                createMutation.isPending ||
                !addForm.title ||
                !addForm.url
              }
            >
              Guardar Link
            </Button>

          </CardContent>
        </Card>
      )}

      {/* LINKS */}
      <div className="space-y-3">

        {sortedLinks.map(link => {
          const Icon = getIconComponent(link.icon);
          const isEditing = editingId === link.id;
          const isDragging = draggedId === link.id;
          const isDragOver =
            dragOverId === link.id &&
            draggedId !== link.id;

          return (
            <Card
              key={link.id}
              onDragOver={event =>
                handleDragOver(event, link.id)
              }
              onDrop={event =>
                handleDrop(event, link.id)
              }
              className={`
                border-border bg-card/50
                transition-all duration-200
                ${isDragging ? "opacity-40 scale-[0.99]" : ""}
                ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : ""
                }
              `}
            >
              <CardContent className="p-4 flex items-center gap-4">

                {/* DRAG HANDLE */}
                <div
                  draggable={!isEditing}
                  onDragStart={event =>
                    handleDragStart(event, link.id)
                  }
                  onDragEnd={handleDragEnd}
                  title="Arrastra para cambiar el orden"
                  className={`
                    text-muted-foreground
                    select-none
                    ${
                      isEditing
                        ? "cursor-default opacity-30"
                        : "cursor-grab active:cursor-grabbing hover:text-primary"
                    }
                  `}
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* ICON */}
                <div className="bg-primary/10 p-2 rounded text-primary">
                  <Icon className="w-5 h-5" />
                </div>

                {/* EDIT MODE */}
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-2 gap-2">

                    <Input
                      value={editForm.title}
                      onChange={e =>
                        setEditForm({
                          ...editForm,
                          title: e.target.value
                        })
                      }
                      placeholder="Título"
                      className="h-8 text-sm"
                    />

                    <Input
                      value={editForm.url}
                      onChange={e =>
                        setEditForm({
                          ...editForm,
                          url: e.target.value
                        })
                      }
                      placeholder="URL"
                      className="h-8 text-sm"
                    />

                    <Input
                      value={editForm.icon}
                      onChange={e =>
                        setEditForm({
                          ...editForm,
                          icon: e.target.value
                        })
                      }
                      placeholder="Ícono"
                      className="h-8 text-sm"
                    />

                    <Input
                      value={editForm.description || ""}
                      onChange={e =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value
                        })
                      }
                      placeholder="Descripción"
                      className="h-8 text-sm"
                    />

                  </div>
                ) : (

                  /* NORMAL MODE */
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">
                      {link.title}
                    </h4>

                    <p className="text-xs text-muted-foreground truncate max-w-md">
                      {link.url}
                    </p>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex items-center gap-3 ml-4">

                  {!isEditing && (
                    <Switch
                      checked={link.active}
                      onCheckedChange={checked =>
                        handleToggleActive(
                          link.id,
                          checked
                        )
                      }
                    />
                  )}

                  {isEditing ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleSaveEdit}
                        disabled={updateMutation.isPending}
                        className="text-green-500"
                      >
                        <Check className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setEditingId(null)
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleStartEdit(link)
                        }
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleDelete(link.id)
                        }
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                </div>
              </CardContent>
            </Card>
          );
        })}

        {sortedLinks.length === 0 && !isAdding && (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
            No hay enlaces agregados.
          </div>
        )}

      </div>
    </div>
  );
}
