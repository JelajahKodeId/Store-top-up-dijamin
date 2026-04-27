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
    HelpCircle as Help,
    UserCircle,
    Copy,
    RefreshCw,
    Clock,
    Music2,
    QrCode,
    Tag,
    Hash,
    Pencil,
    FileText,
    ClipboardList,
    Ticket,
    BadgeCheck,
    ListChecks,
    ReceiptText,
    Layers,
    Download,
    Star,
    Smartphone,
    Apple,
    MessageCircle,
    Send,
    Megaphone,
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
    qr: QrCode,
    bank: CreditCard,
    globe: Globe,
    vouchers: Banknote,

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
    facebook: Share2,
    instagram: Camera,
    twitter: Share2,
    tiktok: Music2,
    youtube: Play,
    shield: Shield,

    // Profile
    profile: UserCircle,

    // Others
    lock: Lock,
    arrowRight: ArrowRight,

    // Guest Expansion Additions
    zap: Zap,
    speed: Zap,          // Alias
    activity: Activity,
    boxes: Boxes,
    help: Help,

    // Order & Utility
    copy: Copy,
    refresh: RefreshCw,
    clock: Clock,

    // Form & Content — untuk menggantikan overuse zap
    tag: Tag,              // voucher, label
    hash: Hash,            // field angka/number
    pencil: Pencil,        // field teks, textarea
    fileText: FileText,    // dokumen, detail
    clipboard: ClipboardList, // data produk, form
    ticket: Ticket,        // voucher/promo
    badge: BadgeCheck,     // verifikasi
    listChecks: ListChecks, // summary/konfirmasi
    receipt: ReceiptText,  // ringkasan pembayaran
    layers: Layers,        // paket/tier
    download: Download,    // unduh / undangan Telegram, dll.
    star: Star,              // rating (hindari karakter unicode bintang)
    android: Smartphone,
    ios: Apple,
    whatsapp: MessageCircle,
    telegram: Send,
    speaker: Megaphone,
};

/**
 * Icon Component — Helper to render icons from the registry
 */
export default function Icon({ name, size = 18, className = '', ...props }) {
    const IconComponent = AppIcons[name] || HelpCircle;
    return <IconComponent size={size} className={className} {...props} />;
}
