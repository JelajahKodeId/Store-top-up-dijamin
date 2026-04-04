import {
    LayoutDashboard,
    Gamepad2,
    Package,
    ShoppingCart,
    CreditCard,
    Image as ImageIcon,
    Users,
    LogOut,
    ChevronRight,
    ChevronLeft,
    X,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    Bell,
    Search,
    Globe,
    Banknote,
    Zap,
    ArrowRight,
    Filter,
    Wallet,
    Home,
    AlertCircle,
    CheckCircle2,
    Info,
    XCircle,
    Loader2,
    Mail,
    Lock,
    Settings,
    Edit,
    Trash2,
    Plus,
    Eye,
    ChevronDown,
    MapPin,
    Phone,
    Share2,
    Camera,
    Play,
    Shield,
    HelpCircle,
    Key,
    Save,
    CheckSquare,
    Activity,
    Boxes,
    HelpCircle as Help
} from 'lucide-react';

/**
 * AppIcons — Centralized icon registry
 * Memudahkan penggantian icon di seluruh aplikasi dari satu tempat.
 * Catatan: Beberapa icon brand dialihkan ke icon generic karena batasan library.
 */
export const AppIcons = {
    // Navigasi & Sidebar
    dashboard: LayoutDashboard,
    categories: Gamepad2,
    products: Package,
    orders: ShoppingCart,
    payments: CreditCard,
    banners: ImageIcon,
    users: Users,
    logout: LogOut,
    settings: Settings,

    // UI Elements
    chevronRight: ChevronRight,
    chevronLeft: ChevronLeft,
    chevronDown: ChevronDown,
    close: X,
    menu: Menu,
    sidebarClose: PanelLeftClose,
    sidebarOpen: PanelLeftOpen,
    notification: Bell,
    search: Search,
    filter: Filter,
    plus: Plus,
    edit: Edit,
    delete: Trash2,
    view: Eye,
    save: Save,
    key: Key,
    check: CheckSquare,
    back: ChevronLeft,

    // Stats & Business
    revenue: Banknote,
    sales: ShoppingCart,
    success: Zap,
    wallet: Wallet,
    globe: Globe,

    // Feedback
    info: Info,
    success_circle: CheckCircle2,
    warning: AlertCircle,
    error: XCircle,
    loading: Loader2,

    // Social & Contact (Generic Fallbacks)
    home: Home,
    mail: Mail,
    phone: Phone,
    location: MapPin,
    facebook: Share2,    // Fallback
    instagram: Camera,   // Fallback
    twitter: Share2,     // Fallback
    youtube: Play,       // Fallback
    shield: Shield,

    // Others
    lock: Lock,
    arrowRight: ArrowRight,

    // Guest Expansion Additions
    zap: Zap,
    speed: Zap,          // Alias
    activity: Activity,
    boxes: Boxes,
    help: Help,
};

/**
 * Icon Component — Helper to render icons from the registry
 */
export default function Icon({ name, size = 18, className = '', ...props }) {
    const IconComponent = AppIcons[name] || HelpCircle;
    return <IconComponent size={size} className={className} {...props} />;
}
