import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import logoPath from "@assets/image_1781908878316.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/lib/api-base";

const loginSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const USER_ME_KEY = ["user-auth", "me"];

export default function DashboardLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsPending(true);
    try {
      const res = await fetch(`${API_BASE}/api/user-auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const user = await res.json();
      if (user?.token) {
        localStorage.setItem("auth_token", user.token);
      }
      queryClient.setQueryData(USER_ME_KEY, { username: user.username });
      toast({ title: "Bienvenida", description: "Sesión iniciada correctamente." });
      setLocation("/dashboard");
    } catch {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Usuario o contraseña incorrectos.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-background to-background pointer-events-none" />

      <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-md shadow-2xl relative z-10">
        <CardHeader className="flex flex-col items-center pb-8 pt-10">
          <img src={logoPath} alt="Logo" className="w-20 h-20 object-contain rounded-full mb-4" />
          <CardTitle className="font-serif text-2xl tracking-wide text-foreground">Mi Dashboard</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">Acceso para Claudia Alzate</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase tracking-widest text-xs">Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingresa tu usuario" {...field} className="bg-background/50 border-primary/30 focus-visible:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase tracking-widest text-xs">Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-background/50 border-primary/30 focus-visible:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4" disabled={isPending}>
                {isPending ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
