import {
  ArrowLeft, ArrowRight, ArrowUp, BadgeCheck, BatteryCharging, BatteryFull, Bike, CalendarCheck, CalendarDays, Car, Check,
  ChevronDown, Circle, CircleDot, Clock, Cpu, Crosshair, Droplet, Droplets, Eye, FileText, Gauge, Gift, History,
  ListOrdered, MapPin, Menu, MessageCircle, Minus, Monitor, MousePointerClick, Navigation, Package, PaintBucket, Pause, Phone, Play,
  PlugZap, RefreshCcw, ScanSearch, Search, Settings, ShieldCheck, ShoppingCart, Siren, SlidersHorizontal, Smartphone,
  Sparkles, Star, Store, Tablet, Target, Thermometer, Timer, Truck, Wrench, X, Zap,
} from 'lucide-react'

// Chỉ nạp các icon thực sự dùng. Thêm icon mới: import ở trên và khai báo trong bảng này.
const icons = {
  ArrowLeft, ArrowRight, ArrowUp, BadgeCheck, BatteryCharging, BatteryFull, Bike, CalendarCheck, CalendarDays, Car, Check,
  ChevronDown, Circle, CircleDot, Clock, Cpu, Crosshair, Droplet, Droplets, Eye, FileText, Gauge, Gift, History,
  ListOrdered, MapPin, Menu, MessageCircle, Minus, Monitor, MousePointerClick, Navigation, Package, PaintBucket, Pause, Phone, Play,
  PlugZap, RefreshCcw, ScanSearch, Search, Settings, ShieldCheck, ShoppingCart, Siren, SlidersHorizontal, Smartphone,
  Sparkles, Star, Store, Tablet, Target, Thermometer, Timer, Truck, Wrench, X, Zap,
}

// Dùng tên icon dạng chuỗi trong dữ liệu mock (vd: icon: 'Wrench').
export default function Icon({ name, size = 20, strokeWidth = 2, ...rest }) {
  const Cmp = icons[name] || Circle
  return <Cmp size={size} strokeWidth={strokeWidth} aria-hidden="true" {...rest} />
}
