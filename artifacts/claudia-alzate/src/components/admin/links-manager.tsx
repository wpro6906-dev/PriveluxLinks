import { useState } from "react";
import { 
  useGetLinks, 
  getGetLinksQueryKey, 
  useCreateLink, 
  useUpdateLink, 
  useDeleteLink 
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
  
  const { data: links = [], isLoading } = useGetLinks({
    query: { queryKey: getGetLinksQueryKey() }
  });
  
  const createMutation = useCreateLink();
  const updateMutation = useUpdateLink();
  const deleteMutation = useDeleteLink();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", url: "", icon: "globe", description: "", active: true });

  const sortedLinks = [...links].sort((a, b) => a.order - b.order);

  const handleToggleActive = (id: number, active: boolean) => {
    updateMutation.mutate({ id, data: { active } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetLinksQueryKey() })
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this link?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetLinksQueryKey() });
          toast({ title: "Link deleted" });
        }
      });
    }
  };

  const handleStartEdit = (link: any) => {
    setEditingId(link.id);
    setEditForm({ ...link });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const data = { ...editForm, url: normalizeUrl(editForm.url) };
    updateMutation.mutate({ id: editingId, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetLinksQueryKey() });
        setEditingId(null);
        toast({ title: "Link updated" });
      }
    });
  };

  const handleAdd = () => {
    const data = { ...addForm, url: normalizeUrl(addForm.url) };
    createMutation.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetLinksQueryKey() });
        setIsAdding(false);
        setAddForm({ title: "", url: "", icon: "globe", description: "", active: true });
        toast({ title: "Link added" });
      }
    });
  };

  if (isLoading) return <div>Loading links...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Manage Links</h2>
          <p className="text-muted-foreground text-sm">Organize your public profile links.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {isAdding ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {isAdding ? "Cancel" : "Add Link"}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-primary/20 bg-card">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Title</label>
                <Input value={addForm.title} onChange={e => setAddForm({...addForm, title: e.target.value})} placeholder="e.g. My Website" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">URL</label>
                <Input value={addForm.url} onChange={e => setAddForm({...addForm, url: e.target.value})} placeholder="https://..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Icon</label>
                <Input value={addForm.icon} onChange={e => setAddForm({...addForm, icon: e.target.value})} placeholder="instagram, whatsapp..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Description (Optional)</label>
                <Input value={addForm.description} onChange={e => setAddForm({...addForm, description: e.target.value})} placeholder="Brief subtitle..." />
              </div>
            </div>
            <Button onClick={handleAdd} disabled={createMutation.isPending || !addForm.title || !addForm.url}>
              Save Link
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {sortedLinks.map(link => {
          const Icon = getIconComponent(link.icon);
          const isEditing = editingId === link.id;

          return (
            <Card key={link.id} className="border-border bg-card/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="cursor-move text-muted-foreground">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div className="bg-primary/10 p-2 rounded text-primary">
                  <Icon className="w-5 h-5" />
                </div>

                {isEditing ? (
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Title" className="h-8 text-sm" />
                    <Input value={editForm.url} onChange={e => setEditForm({...editForm, url: e.target.value})} placeholder="URL" className="h-8 text-sm" />
                    <Input value={editForm.icon} onChange={e => setEditForm({...editForm, icon: e.target.value})} placeholder="Icon" className="h-8 text-sm" />
                    <Input value={editForm.description || ""} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Description" className="h-8 text-sm" />
                  </div>
                ) : (
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{link.title}</h4>
                    <p className="text-xs text-muted-foreground truncate max-w-md">{link.url}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 ml-4">
                  {!isEditing && (
                    <Switch 
                      checked={link.active} 
                      onCheckedChange={(c) => handleToggleActive(link.id, c)} 
                    />
                  )}
                  
                  {isEditing ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={handleSaveEdit} disabled={updateMutation.isPending} className="text-green-500">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => handleStartEdit(link)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(link.id)} className="text-destructive">
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
            No links added yet.
          </div>
        )}
      </div>
    </div>
  );
}
