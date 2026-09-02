import { useState } from "react";
import { useGetAnalytics, useResetAnalytics, getGetAnalyticsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, MousePointer, TrendingUp, Clock, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export function AnalyticsManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: analytics, isLoading } = useGetAnalytics({
    query: { queryKey: getGetAnalyticsQueryKey() }
  });

  const resetMutation = useResetAnalytics({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAnalyticsQueryKey() });
        toast({ title: "Analíticas reiniciadas", description: "Todos los datos han sido borrados." });
      },
      onError: () => {
        toast({ title: "Error", description: "No se pudieron reiniciar las analíticas.", variant: "destructive" });
      },
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Analytics</h2>
          <p className="text-muted-foreground text-sm">Loading your analytics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl bg-card/40" />)}
        </div>
      </div>
    );
  }

  const maxClicks = Math.max(...(analytics?.links?.map((l: any) => l.clicks) || [1]));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Analytics Overview</h2>
          <p className="text-muted-foreground text-sm">Seguimiento de visitas y clicks en tus enlaces.</p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-destructive/30 text-destructive/70 hover:text-destructive hover:border-destructive/60 hover:bg-destructive/5 gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Reiniciar todas las analíticas?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción borrará permanentemente todos los datos de visitas y clicks. No se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => resetMutation.mutate()}
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? "Reiniciando..." : "Sí, borrar todo"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-2 border-t-primary border-x-border border-b-border bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Visitas</CardTitle>
            <Eye className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">{analytics?.totalVisits || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-t-2 border-t-primary border-x-border border-b-border bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
            <MousePointer className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">{analytics?.totalClicks || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-t-2 border-t-primary border-x-border border-b-border bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Más Clickeado</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate max-w-full" title={analytics?.mostClicked || "None"}>
              {analytics?.mostClicked || "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-2 border-t-primary border-x-border border-b-border bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Última Actividad</CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">
              {analytics?.lastActivity ? new Date(analytics.lastActivity).toLocaleDateString("es-CO") : "Sin actividad"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="font-serif">Rendimiento por Enlace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(!analytics?.links || analytics.links.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aún no hay datos de clicks.</p>
          ) : (
            analytics?.links?.map((link: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{link.title}</span>
                  <span className="text-muted-foreground">{link.clicks} clicks</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${maxClicks > 0 ? (link.clicks / maxClicks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
