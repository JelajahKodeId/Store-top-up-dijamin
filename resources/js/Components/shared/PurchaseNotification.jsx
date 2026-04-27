import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PurchaseNotification() {
    const [order, setOrder] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [lastId, setLastId] = useState(null);

    const fetchRecentOrder = async () => {
        try {
            const response = await axios.get(route('api.recent-order'));
            const data = response.data.order;

            // Jika ada order baru dan ID nya berbeda dengan yang terakhir ditampilkan
            if (data && data.id !== lastId) {
                setOrder(data);
                setLastId(data.id);
                setIsVisible(true);

                // Sembunyikan setelah 7 detik
                setTimeout(() => {
                    setIsVisible(false);
                }, 7000);
            }
        } catch (error) {
            // Silently fail to not disturb user
            // console.error('Recent order fetch error');
        }
    };

    useEffect(() => {
        // Ambil data pertama kali
        fetchRecentOrder();

        // Lakukan polling setiap 45 detik
        const interval = setInterval(fetchRecentOrder, 45000);
        return () => clearInterval(interval);
    }, [lastId]);

    if (!order) return null;

    return (
        <div 
            className={`fixed bottom-6 left-6 z-[9990] w-[calc(100%-3rem)] max-w-[320px] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
            }`}
        >
            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md border border-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] p-3 pr-5 rounded-2xl overflow-hidden group">
                {/* Product Image */}
                <div className="relative h-14 w-14 flex-none overflow-hidden rounded-xl bg-guest-elevated shadow-sm">
                    {order.product_image ? (
                        <img src={order.product_image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-store-accent/10">
                            <span className="text-xl opacity-50">🕹️</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col min-w-0 pr-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-guest-subtle leading-tight mb-1">
                        Seseorang baru saja membeli
                    </p>
                    <h4 className="text-[13px] font-bold text-guest-text truncate -mt-0.5 mb-1 leading-snug">
                        {order.product_name}
                    </h4>
                    <div className="flex items-center gap-1.5">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <p className="text-[9px] font-bold text-green-600 uppercase tracking-wider">
                            {order.time_ago}
                        </p>
                    </div>
                </div>

                {/* Vertical Accent Bar */}
                <div className="absolute left-0 top-0 h-full w-1 bg-store-accent"></div>
            </div>
        </div>
    );
}
