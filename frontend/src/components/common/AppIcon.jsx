import {
  Award,
  BarChart3,
  Check,
  Clock3,
  Gift,
  Home,
  ListChecks,
  LogOut,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
} from "lucide-react";

const icons = {
  badge: Award,
  chart: BarChart3,
  check: Check,
  child: UserRound,
  clock: Clock3,
  gift: Gift,
  home: Home,
  list: ListChecks,
  logout: LogOut,
  pin: MapPin,
  settings: SlidersHorizontal,
  shield: ShieldCheck,
  sparkle: Sparkles,
  target: Target,
  trophy: Award,
  users: UsersRound,
};

const AppIcon = ({ name, className = "w-5 h-5", strokeWidth = 2 }) => {
  const Icon = icons[name] || Target;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
};

export default AppIcon;
