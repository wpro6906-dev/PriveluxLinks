import { useLocation } from "wouter";
import { useLogin, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import logoPath from "@assets/image_1781908878316.png";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const USER_ME_KEY = ["user-auth", "me"];

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();
  
  const { data: user } = useGetMe({
    query: { 
      queryKey: getGetMeQueryKey(),
      retry: false
    }
  });

  if (user) {
    setLocation("/admin");
    return null;
  }

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(data: LoginFormValues) {
    loginMutation.mutate({ data }, {
      onSuccess: (result: any) => {
        if (result?.token) {
          localStorage.setItem("auth_token", result.token);
        }
        if (result?.role === "user") {
          queryClient.setQueryData(USER_ME_KEY, { username: result.username });
          toast({
            title: "¡Bienvenida!",
            description: "Sesión iniciada correctamente.",
          });
          setLocation("/dashboard");
        } else {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({
            title: "Welcome back",
            description: "Logged in successfully.",
          });
          setLocation("/admin");
        }
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: "Invalid username or password.",
        });
      }
    });
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-background to-background pointer-events-none" />
      
      <Card className="w-full max-w-md border-primary/20 bg-card/80 backdrop-blur-md shadow-2xl relative z-10">
        <CardHeader className="flex flex-col items-center pb-8 pt-10">
          <img src={logoPath} alt="Logo" className="w-20 h-20 object-contain rounded-full mb-4" />
          <CardTitle className="font-serif text-2xl tracking-wide text-foreground">Acceso</CardTitle>
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
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
