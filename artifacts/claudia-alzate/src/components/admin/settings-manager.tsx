import { useState } from "react";
import { useUpdateCredentials } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function SettingsManager() {
  const { toast } = useToast();
  const updateMutation = useUpdateCredentials();
  
  const [form, setForm] = useState({
    currentPassword: "",
    username: "",
    password: ""
  });

  const handleSave = () => {
    updateMutation.mutate({ data: form }, {
      onSuccess: () => {
        toast({ title: "Credentials updated successfully" });
        setForm({ currentPassword: "", username: "", password: "" });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Update failed", description: "Please check your current password." });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-foreground">Settings</h2>
        <p className="text-muted-foreground text-sm">Update your admin credentials.</p>
      </div>

      <Card className="border-border bg-card max-w-md">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Current Password</label>
            <Input 
              type="password" 
              value={form.currentPassword} 
              onChange={e => setForm({...form, currentPassword: e.target.value})} 
              placeholder="Required to make changes"
            />
          </div>
          
          <div className="pt-4 border-t border-border space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">New Username</label>
              <Input 
                value={form.username} 
                onChange={e => setForm({...form, username: e.target.value})} 
                placeholder="Leave blank to keep current"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">New Password</label>
              <Input 
                type="password" 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                placeholder="Leave blank to keep current"
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending || !form.currentPassword || (!form.username && !form.password)} 
            className="w-full mt-2"
          >
            {updateMutation.isPending ? "Updating..." : "Update Credentials"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
