import { useState, useEffect } from "react";
import { useGetProfile, getGetProfileQueryKey, useUpdateProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Save, Home, MapPin, Star, Key, Building2, Phone, Mail, Users,
  Globe, Award, TrendingUp, Briefcase, Heart, ThumbsUp, Calendar,
  Clock, User, MessageCircle, DollarSign, Percent, Search,
  ShieldCheck, Zap, CheckCircle2, Linkedin, Twitter, Youtube,
  ChevronDown, type LucideIcon,
} from "lucide-react";
import { SiInstagram, SiFacebook, SiWhatsapp, SiTiktok } from "react-icons/si";

// ── Icon catalogue used in the visual picker ────────────────────────────────
type IconEntry = { key: string; label: string; Icon: LucideIcon | React.ComponentType<{ className?: string }> };

const STAT_ICONS: IconEntry[] = [
  { key: "home",          label: "Casa",        Icon: Home },
  { key: "building2",     label: "Edificio",    Icon: Building2 },
  { key: "key",           label: "Llave",       Icon: Key },
  { key: "mappin",        label: "Ubicación",   Icon: MapPin },
  { key: "star",          label: "Estrella",    Icon: Star },
  { key: "award",         label: "Premio",      Icon: Award },
  { key: "shieldcheck",   label: "Garantía",    Icon: ShieldCheck },
  { key: "checkcircle2",  label: "Verificado",  Icon: CheckCircle2 },
  { key: "users",         label: "Clientes",    Icon: Users },
  { key: "user",          label: "Persona",     Icon: User },
  { key: "heart",         label: "Favorito",    Icon: Heart },
  { key: "thumbsup",      label: "Aprobado",    Icon: ThumbsUp },
  { key: "phone",         label: "Teléfono",    Icon: Phone },
  { key: "mail",          label: "Correo",      Icon: Mail },
  { key: "messagecircle", label: "Mensaje",     Icon: MessageCircle },
  { key: "globe",         label: "Web",         Icon: Globe },
  { key: "trendingup",    label: "Tendencia",   Icon: TrendingUp },
  { key: "briefcase",     label: "Negocio",     Icon: Briefcase },
  { key: "dollar",        label: "Precio",      Icon: DollarSign },
  { key: "percent",       label: "Descuento",   Icon: Percent },
  { key: "calendar",      label: "Fecha",       Icon: Calendar },
  { key: "clock",         label: "Tiempo",      Icon: Clock },
  { key: "search",        label: "Buscar",      Icon: Search },
  { key: "zap",           label: "Rápido",      Icon: Zap },
  { key: "linkedin",      label: "LinkedIn",    Icon: Linkedin },
  { key: "twitter",       label: "Twitter",     Icon: Twitter },
  { key: "youtube",       label: "YouTube",     Icon: Youtube },
  { key: "instagram",     label: "Instagram",   Icon: SiInstagram as LucideIcon },
  { key: "facebook",      label: "Facebook",    Icon: SiFacebook as LucideIcon },
  { key: "whatsapp",      label: "WhatsApp",    Icon: SiWhatsapp as LucideIcon },
  { key: "tiktok",        label: "TikTok",      Icon: SiTiktok as LucideIcon },
];

function IconPicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = STAT_ICONS.find(e => e.key === value) ?? STAT_ICONS[0];
  const CurrentIcon = current.Icon;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors"
      >
        <span className="flex items-center gap-2">
          <CurrentIcon className="w-4 h-4 shrink-0" />
          <span className="truncate text-xs text-muted-foreground">{current.label}</span>
        </span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* picker grid */}
          <div className="absolute left-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-xl p-3 w-64">
            <div className="grid grid-cols-5 gap-1">
              {STAT_ICONS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  title={label}
                  onClick={() => { onChange(key); setOpen(false); }}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-[10px] transition-colors hover:bg-accent ${value === key ? "bg-primary/15 ring-1 ring-primary/50 text-primary" : "text-muted-foreground"}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="leading-none truncate w-full text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function IdentityManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading } = useGetProfile({
    query: { queryKey: getGetProfileQueryKey() }
  });
  
  const updateMutation = useUpdateProfile();
  
  const [form, setForm] = useState({
    firstName: "Claudia",
    lastName: "Alzate",
    firstNameColor: "#FFFFFF",
    lastNameColor: "#D4B483",
    subtitleText: "REALTOR",
    subtitleColor: "#D4B483",
    decoratorEnabled: true,
    decoratorIcon: "home",
    decoratorColor: "#D4B483",
    tagline1: "Te ayudo a encontrar más que una casa,",
    tagline2: "tu próximo hogar.",
    tagline1Color: "#FFFFFF",
    tagline2Color: "#D4B483",
    bgOverlay: 0.7,
    bgBlur: 0,
    bgZoom: 1,
    bgPosition: "center",
    gradientTop: true,
    gradientBottom: true,
    showDecorLines: true,
    showGlow: true,
    nameLetterSpacing: "0.05em",
    showArrowOnButtons: true,
    showAccentBarOnButtons: true,
    logoUrl: "",
    backgroundUrl: "",
    badgeText: "",
    badgeIcon: "mappin",
    badgeColor: "#D4B483",
    portraitUrl: "",
    portraitOpacity: 0.85,
    portraitSize: 68,
    portraitBlendLeft: 50,
    portraitBlendTop: 30,
    bgPhrase: "Luxury Real Estate",
    bgPhraseEnabled: true,
    bgPhraseOpacity: 0.04,
    statsEnabled: true,
    stats: [
      { icon: "mappin", value: "", label: "Miami, FL", enabled: true },
      { icon: "home", value: "150+", label: "Propiedades Vendidas", enabled: true },
      { icon: "star", value: "10+", label: "Años de Experiencia", enabled: true },
      { icon: "users", value: "500+", label: "Clientes Satisfechos", enabled: true },
    ],
  });

  useEffect(() => {
    if (profile) {
      const vc = (profile as any).visualConfig || {};
      setForm(prev => ({
        ...prev,
        logoUrl: profile.logoUrl || "",
        backgroundUrl: profile.backgroundUrl || "",
        firstName: vc.firstName ?? "Claudia",
        lastName: vc.lastName ?? "Alzate",
        firstNameColor: vc.firstNameColor ?? "#FFFFFF",
        lastNameColor: vc.lastNameColor ?? "#D4B483",
        subtitleText: vc.subtitleText ?? "REALTOR",
        subtitleColor: vc.subtitleColor ?? "#D4B483",
        decoratorEnabled: vc.decoratorEnabled ?? true,
        decoratorIcon: vc.decoratorIcon ?? "home",
        decoratorColor: vc.decoratorColor ?? "#D4B483",
        tagline1: vc.tagline1 ?? "Te ayudo a encontrar más que una casa,",
        tagline2: vc.tagline2 ?? "tu próximo hogar.",
        tagline1Color: vc.tagline1Color ?? "#FFFFFF",
        tagline2Color: vc.tagline2Color ?? "#D4B483",
        bgOverlay: vc.bgOverlay ?? 0.7,
        bgBlur: vc.bgBlur ?? 0,
        bgZoom: vc.bgZoom ?? 1,
        bgPosition: vc.bgPosition ?? "center",
        gradientTop: vc.gradientTop ?? true,
        gradientBottom: vc.gradientBottom ?? true,
        showDecorLines: vc.showDecorLines ?? true,
        showGlow: vc.showGlow ?? true,
        nameLetterSpacing: vc.nameLetterSpacing ?? "0.05em",
        showArrowOnButtons: vc.showArrowOnButtons ?? true,
        showAccentBarOnButtons: vc.showAccentBarOnButtons ?? true,
        badgeText: vc.badgeText ?? "",
        badgeIcon: vc.badgeIcon ?? "mappin",
        badgeColor: vc.badgeColor ?? "#D4B483",
        portraitUrl: vc.portraitUrl ?? "",
        portraitOpacity: vc.portraitOpacity ?? 0.85,
        portraitSize: vc.portraitSize ?? 68,
        portraitBlendLeft: vc.portraitBlendLeft ?? 50,
        portraitBlendTop: vc.portraitBlendTop ?? 30,
        bgPhrase: vc.bgPhrase ?? "Luxury Real Estate",
        bgPhraseEnabled: vc.bgPhraseEnabled ?? true,
        bgPhraseOpacity: vc.bgPhraseOpacity ?? 0.04,
        statsEnabled: vc.statsEnabled ?? true,
        stats: vc.stats ?? [
          { icon: "mappin", value: "", label: "Miami, FL", enabled: true },
          { icon: "home", value: "150+", label: "Propiedades Vendidas", enabled: true },
          { icon: "star", value: "10+", label: "Años de Experiencia", enabled: true },
          { icon: "users", value: "500+", label: "Clientes Satisfechos", enabled: true },
        ],
      }));
    }
  }, [profile]);

  const handleSave = () => {
    updateMutation.mutate({ 
      data: {
        name: form.firstName + " " + form.lastName,
        subtitle: form.subtitleText,
        tagline: form.tagline1 + " " + form.tagline2,
        logoUrl: form.logoUrl || null,
        backgroundUrl: form.backgroundUrl || null,
        visualConfig: {
          firstName: form.firstName,
          lastName: form.lastName,
          firstNameColor: form.firstNameColor,
          lastNameColor: form.lastNameColor,
          subtitleText: form.subtitleText,
          subtitleColor: form.subtitleColor,
          decoratorEnabled: form.decoratorEnabled,
          decoratorIcon: form.decoratorIcon,
          decoratorColor: form.decoratorColor,
          tagline1: form.tagline1,
          tagline2: form.tagline2,
          tagline1Color: form.tagline1Color,
          tagline2Color: form.tagline2Color,
          bgOverlay: form.bgOverlay,
          bgBlur: form.bgBlur,
          bgZoom: form.bgZoom,
          bgPosition: form.bgPosition,
          gradientTop: form.gradientTop,
          gradientBottom: form.gradientBottom,
          showDecorLines: form.showDecorLines,
          showGlow: form.showGlow,
          nameLetterSpacing: form.nameLetterSpacing,
          showArrowOnButtons: form.showArrowOnButtons,
          showAccentBarOnButtons: form.showAccentBarOnButtons,
          badgeText: form.badgeText,
          badgeIcon: form.badgeIcon,
          badgeColor: form.badgeColor,
          portraitUrl: form.portraitUrl,
          portraitOpacity: form.portraitOpacity,
          portraitSize: form.portraitSize,
          portraitBlendLeft: form.portraitBlendLeft,
          portraitBlendTop: form.portraitBlendTop,
          bgPhrase: form.bgPhrase,
          bgPhraseEnabled: form.bgPhraseEnabled,
          bgPhraseOpacity: form.bgPhraseOpacity,
          statsEnabled: form.statsEnabled,
          stats: form.stats,
        }
      } as any 
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        toast({ title: "Perfil actualizado" });
      }
    });
  };

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) return <div className="p-8">Cargando identidad...</div>;

  const DecoratorIcon = (() => {
    const name = form.decoratorIcon?.toLowerCase();
    if (name === "mappin") return MapPin;
    if (name === "star") return Star;
    if (name === "key") return Key;
    if (name === "building2" || name === "building") return Building2;
    return Home;
  })();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-foreground">Identidad Visual</h2>
        <p className="text-muted-foreground text-sm">Personaliza el diseño premium de tu perfil.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div className="space-y-6">
          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="identity">Identidad</TabsTrigger>
              <TabsTrigger value="colors">Colores</TabsTrigger>
              <TabsTrigger value="decorations">Decoraciones</TabsTrigger>
              <TabsTrigger value="background">Fondo</TabsTrigger>
              <TabsTrigger value="highlights">Destacados</TabsTrigger>
            </TabsList>
            
            <TabsContent value="identity" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={form.firstName} onChange={e => updateField("firstName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={form.lastName} onChange={e => updateField("lastName", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subtítulo (ej: REALTOR)</Label>
                <Input value={form.subtitleText} onChange={e => updateField("subtitleText", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tagline línea 1</Label>
                <Textarea value={form.tagline1} onChange={e => updateField("tagline1", e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Tagline línea 2</Label>
                <Textarea value={form.tagline2} onChange={e => updateField("tagline2", e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={form.logoUrl} onChange={e => updateField("logoUrl", e.target.value)} placeholder="Dejar en blanco para usar por defecto" />
              </div>

              {/* Badge / Viñeta */}
              <div className="pt-4 border-t border-border space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Viñeta de ubicación / info</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Aparece abajo a la izquierda en móvil y escritorio. Déjalo en blanco para ocultar.</p>
                </div>
                <div className="space-y-2">
                  <Label>Texto de la viñeta</Label>
                  <Input
                    value={form.badgeText}
                    onChange={e => updateField("badgeText", e.target.value)}
                    placeholder="Ej: Miami, FL · DRE #12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ícono</Label>
                  <div className="flex gap-2">
                    {([
                      { id: "mappin", Icon: MapPin, label: "Ubicación" },
                      { id: "phone", Icon: Phone, label: "Teléfono" },
                      { id: "mail", Icon: Mail, label: "Email" },
                      { id: "building2", Icon: Building2, label: "Oficina" },
                    ] as const).map(({ id, Icon, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updateField("badgeIcon", id)}
                        title={label}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                          form.badgeIcon === id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px]">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Label className="w-1/2">Color de la viñeta</Label>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="color"
                      value={form.badgeColor}
                      onChange={e => updateField("badgeColor", e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-primary/20"
                    />
                    <Input
                      value={form.badgeColor}
                      onChange={e => updateField("badgeColor", e.target.value)}
                      className="flex-1 font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              {[
                { key: "firstNameColor", label: "Color del primer nombre" },
                { key: "lastNameColor", label: "Color del apellido" },
                { key: "subtitleColor", label: "Color del subtítulo" },
                { key: "decoratorColor", label: "Color del decorador" },
                { key: "tagline1Color", label: "Color de frase línea 1" },
                { key: "tagline2Color", label: "Color de frase línea 2" }
              ].map(item => (
                <div key={item.key} className="flex items-center gap-4">
                  <div className="w-1/2">
                    <Label>{item.label}</Label>
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input 
                      type="color" 
                      value={(form as any)[item.key]} 
                      onChange={e => updateField(item.key, e.target.value)} 
                      className="w-10 h-10 rounded cursor-pointer border border-primary/20"
                    />
                    <Input 
                      value={(form as any)[item.key]} 
                      onChange={e => updateField(item.key, e.target.value)}
                      className="flex-1 font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="decorations" className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer" htmlFor="decoratorEnabled">Mostrar separador decorativo</Label>
                <Switch id="decoratorEnabled" checked={form.decoratorEnabled} onCheckedChange={v => updateField("decoratorEnabled", v)} />
              </div>
              {form.decoratorEnabled && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                  <Label>Nombre del ícono</Label>
                  <Input value={form.decoratorIcon} onChange={e => updateField("decoratorIcon", e.target.value)} placeholder="home, mapPin, star, key, building2" />
                  <p className="text-xs text-muted-foreground">home, mapPin, star, key, building2</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer" htmlFor="showDecorLines">Mostrar líneas decorativas</Label>
                <Switch id="showDecorLines" checked={form.showDecorLines} onCheckedChange={v => updateField("showDecorLines", v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer" htmlFor="showGlow">Mostrar efecto de brillo</Label>
                <Switch id="showGlow" checked={form.showGlow} onCheckedChange={v => updateField("showGlow", v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer" htmlFor="showArrowOnButtons">Flecha en botones</Label>
                <Switch id="showArrowOnButtons" checked={form.showArrowOnButtons} onCheckedChange={v => updateField("showArrowOnButtons", v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer" htmlFor="showAccentBarOnButtons">Barra de acento en botones</Label>
                <Switch id="showAccentBarOnButtons" checked={form.showAccentBarOnButtons} onCheckedChange={v => updateField("showAccentBarOnButtons", v)} />
              </div>
            </TabsContent>

            <TabsContent value="background" className="space-y-6">
              <div className="space-y-2">
                <Label>Background URL</Label>
                <Input value={form.backgroundUrl} onChange={e => updateField("backgroundUrl", e.target.value)} placeholder="Dejar en blanco para usar degradado" />
              </div>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Opacidad del overlay</Label>
                    <span className="text-xs text-muted-foreground">{form.bgOverlay}</span>
                  </div>
                  <Slider value={[form.bgOverlay]} min={0} max={1} step={0.05} onValueChange={v => updateField("bgOverlay", v[0])} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Blur del fondo</Label>
                    <span className="text-xs text-muted-foreground">{form.bgBlur}px</span>
                  </div>
                  <Slider value={[form.bgBlur]} min={0} max={20} step={1} onValueChange={v => updateField("bgBlur", v[0])} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Zoom del fondo</Label>
                    <span className="text-xs text-muted-foreground">{form.bgZoom}x</span>
                  </div>
                  <Slider value={[form.bgZoom]} min={0.5} max={2} step={0.05} onValueChange={v => updateField("bgZoom", v[0])} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Posición del fondo</Label>
                <Input value={form.bgPosition} onChange={e => updateField("bgPosition", e.target.value)} placeholder="center, top, bottom, etc" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer" htmlFor="gradientTop">Gradiente superior</Label>
                <Switch id="gradientTop" checked={form.gradientTop} onCheckedChange={v => updateField("gradientTop", v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer" htmlFor="gradientBottom">Gradiente inferior</Label>
                <Switch id="gradientBottom" checked={form.gradientBottom} onCheckedChange={v => updateField("gradientBottom", v)} />
              </div>

              {/* Portrait / Foto persona */}
              <div className="pt-4 border-t border-border space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Foto de persona (retrato)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Se muestra abajo a la derecha en móvil y en la columna de foto en escritorio. Déjalo en blanco para ocultar.</p>
                </div>
                <div className="space-y-2">
                  <Label>URL de la foto</Label>
                  <Input
                    value={form.portraitUrl}
                    onChange={e => updateField("portraitUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Opacidad</Label>
                    <span className="text-xs text-muted-foreground">{Math.round(form.portraitOpacity * 100)}%</span>
                  </div>
                  <Slider value={[form.portraitOpacity]} min={0.1} max={1} step={0.05} onValueChange={v => updateField("portraitOpacity", v[0])} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Tamaño</Label>
                    <span className="text-xs text-muted-foreground">{form.portraitSize}%</span>
                  </div>
                  <Slider value={[form.portraitSize]} min={35} max={95} step={1} onValueChange={v => updateField("portraitSize", v[0])} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Fusión lateral (izquierda)</Label>
                    <span className="text-xs text-muted-foreground">{form.portraitBlendLeft}%</span>
                  </div>
                  <Slider value={[form.portraitBlendLeft]} min={10} max={80} step={2} onValueChange={v => updateField("portraitBlendLeft", v[0])} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Fusión superior</Label>
                    <span className="text-xs text-muted-foreground">{form.portraitBlendTop}%</span>
                  </div>
                  <Slider value={[form.portraitBlendTop]} min={5} max={70} step={2} onValueChange={v => updateField("portraitBlendTop", v[0])} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="highlights" className="space-y-6">
              {/* Background phrase */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Frase destacada (escritorio)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Aparece en la zona superior derecha, con tipografía elegante y alineación a la derecha, justo encima del retrato.</p>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="bgPhraseEnabled">Mostrar frase decorativa</Label>
                  <Switch id="bgPhraseEnabled" checked={form.bgPhraseEnabled} onCheckedChange={v => updateField("bgPhraseEnabled", v)} />
                </div>
                {form.bgPhraseEnabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label>Texto de la frase</Label>
                      <Input
                        value={form.bgPhrase}
                        onChange={e => updateField("bgPhrase", e.target.value)}
                        placeholder="Ej: Luxury Real Estate"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Opacidad</Label>
                        <span className="text-xs text-muted-foreground">{Math.round(form.bgPhraseOpacity * 100)}%</span>
                      </div>
                      <Slider value={[form.bgPhraseOpacity]} min={0.3} max={1} step={0.05} onValueChange={v => updateField("bgPhraseOpacity", v[0])} />
                      <p className="text-xs text-muted-foreground">Valor recomendado: 80–95%</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-border space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Estadísticas destacadas</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Aparecen debajo de los botones en escritorio, en una cuadrícula de 2 columnas.</p>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="statsEnabled">Mostrar estadísticas</Label>
                  <Switch id="statsEnabled" checked={form.statsEnabled} onCheckedChange={v => updateField("statsEnabled", v)} />
                </div>
                {form.statsEnabled && (
                  <div className="space-y-3">
                    {form.stats.map((stat, i) => (
                      <div key={i} className="p-4 rounded-xl border border-border bg-card/30 space-y-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stat {i + 1}</span>
                          <Switch
                            checked={stat.enabled}
                            onCheckedChange={v => {
                              const updated = form.stats.map((s, idx) => idx === i ? { ...s, enabled: v } : s);
                              updateField("stats", updated);
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Ícono</Label>
                            <IconPicker
                              value={stat.icon}
                              onChange={v => {
                                const updated = form.stats.map((s, idx) => idx === i ? { ...s, icon: v } : s);
                                updateField("stats", updated);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Número / valor</Label>
                            <Input
                              value={stat.value}
                              onChange={e => {
                                const updated = form.stats.map((s, idx) => idx === i ? { ...s, value: e.target.value } : s);
                                updateField("stats", updated);
                              }}
                              placeholder="150+"
                              className="text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Descripción</Label>
                            <Input
                              value={stat.label}
                              onChange={e => {
                                const updated = form.stats.map((s, idx) => idx === i ? { ...s, label: e.target.value } : s);
                                updateField("stats", updated);
                              }}
                              placeholder="Clientes"
                              className="text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 border-primary/20 text-muted-foreground hover:text-foreground"
                        onClick={() => updateField("stats", [...form.stats, { icon: "star", value: "", label: "Nueva estadística", enabled: true }])}
                      >
                        + Agregar estadística
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-destructive/30 text-destructive/70 hover:text-destructive hover:border-destructive/60 hover:bg-destructive/5"
                        onClick={() => updateField("stats", [
                          { icon: "mappin", value: "", label: "Miami, FL", enabled: true },
                          { icon: "home", value: "150+", label: "Propiedades Vendidas", enabled: true },
                          { icon: "star", value: "10+", label: "Años de Experiencia", enabled: true },
                          { icon: "users", value: "500+", label: "Clientes Satisfechos", enabled: true },
                        ])}
                      >
                        Reiniciar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full gap-2">
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>

        {/* Live Preview Sidebar */}
        <div className="sticky top-6">
          <Card className="border-primary/20 bg-background overflow-hidden relative">
            <div className="absolute inset-0 z-0">
               {form.backgroundUrl ? (
                 <>
                   <div 
                     className="absolute inset-0 scale-105"
                     style={{
                       backgroundImage: `url(${form.backgroundUrl})`,
                       backgroundSize: `${(form.bgZoom || 1) * 100}%`,
                       backgroundPosition: form.bgPosition || "center",
                       filter: `blur(${form.bgBlur || 0}px)`
                     }}
                   />
                   <div className="absolute inset-0 bg-black" style={{ opacity: form.bgOverlay ?? 0.7 }} />
                 </>
               ) : (
                 <div className="absolute inset-0 bg-gradient-to-b from-[#0a0806] to-background" />
               )}
            </div>
            
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[480px] text-center relative z-10 scale-[0.8] origin-top">
              <h3 className="text-[10px] font-mono text-muted-foreground mb-8 uppercase tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Live Preview</h3>
              
              <div className="flex flex-col items-center mb-2">
                <span className="text-4xl font-serif font-light" style={{ color: form.firstNameColor, letterSpacing: form.nameLetterSpacing, fontFamily: "'Playfair Display', serif" }}>
                  {form.firstName}
                </span>
                <span className="text-4xl font-serif font-medium" style={{ color: form.lastNameColor, letterSpacing: form.nameLetterSpacing, fontFamily: "'Playfair Display', serif" }}>
                  {form.lastName}
                </span>
              </div>
              
              <p className="text-[10px] font-sans uppercase mb-4 tracking-[0.4em]" style={{ color: form.subtitleColor, fontFamily: "'Montserrat', sans-serif" }}>
                {form.subtitleText}
              </p>

              {form.decoratorEnabled && (
                <div className="flex flex-row items-center gap-2 mb-4 w-full max-w-[120px]">
                  <div className="flex-1 h-px bg-primary opacity-50" />
                  <DecoratorIcon className="w-3 h-3" style={{ color: form.decoratorColor }} />
                  <div className="flex-1 h-px bg-primary opacity-50" />
                </div>
              )}

              <div className="flex flex-col items-center gap-1 mt-2">
                <p className="font-sans text-[12px] opacity-80 text-center" style={{ color: form.tagline1Color }}>
                  {form.tagline1}
                </p>
                <p className="text-lg font-semibold text-center leading-snug" style={{ color: form.tagline2Color, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
                  {form.tagline2}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
