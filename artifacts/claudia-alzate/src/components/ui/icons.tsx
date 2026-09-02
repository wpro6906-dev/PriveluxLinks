import {
  Home, Link as LinkIcon, Globe, Phone, Mail, MapPin, Star, Key, Building2,
  ChevronRight, Linkedin, Twitter, Youtube, Award, TrendingUp, Briefcase,
  Heart, ThumbsUp, Calendar, Clock, User, Users, MessageCircle, DollarSign,
  Percent, Search, ShieldCheck, Zap, CheckCircle2,
} from "lucide-react";
import { SiWhatsapp, SiInstagram, SiFacebook, SiTiktok } from "react-icons/si";

export function getIconComponent(name: string) {
  const n = name.toLowerCase();
  switch (n) {
    case "instagram":     return SiInstagram;
    case "facebook":      return SiFacebook;
    case "whatsapp":      return SiWhatsapp;
    case "tiktok":        return SiTiktok;
    case "linkedin":      return Linkedin;
    case "twitter": case "x": return Twitter;
    case "youtube":       return Youtube;
    case "phone":         return Phone;
    case "mail": case "email": return Mail;
    case "mappin": case "location": return MapPin;
    case "star":          return Star;
    case "key":           return Key;
    case "building": case "building2": return Building2;
    case "home":          return Home;
    case "globe": case "website": return Globe;
    case "users":         return Users;
    case "user":          return User;
    case "award":         return Award;
    case "trendingup":    return TrendingUp;
    case "briefcase":     return Briefcase;
    case "heart":         return Heart;
    case "thumbsup":      return ThumbsUp;
    case "calendar":      return Calendar;
    case "clock":         return Clock;
    case "messagecircle": return MessageCircle;
    case "dollar": case "dollarsign": return DollarSign;
    case "percent":       return Percent;
    case "search":        return Search;
    case "shieldcheck":   return ShieldCheck;
    case "zap":           return Zap;
    case "checkcircle2":  return CheckCircle2;
    default:              return LinkIcon;
  }
}

export { ChevronRight };
