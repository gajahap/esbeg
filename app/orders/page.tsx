"use client";

import { useEffect, useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { 
  Package, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck,
  Loader2,
  AlertCircle,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {toast} from "sonner";
import { useCartStore } from "@/store/useCartStore";
// --- INTERFACES ---
interface Order {
  id: string;
  order_oid: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
  first_item_image: string;
  order_number: string;
  grand_total: number;
  items: ItemType[];
}

type ItemType = {
  variant: {
    product: {
      name: string;
    }
  }
};

export default function OrdersPage() {
  const { formatCurrency, confirm } = useGlobal();
  const router = useRouter();
  
  // --- STATES ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const {refreshCart} = useCartStore();
  const [ isProcessRepeatOrder, setIsProcessRepeatOrder ] = useState(false);

  // --- CONFIGURATION: STATUS UI ---
  const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending_payment: { 
      label: "Menunggu Pembayaran", 
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      icon: Clock
    },
    paid: { 
      label: "Sudah Dibayar", 
      color: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      icon: CheckCircle2
    },
    shipped: { 
      label: "Dalam Pengiriman", 
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      icon: Truck
    },
    expired: { 
      label: "Kedaluwarsa",  
      color: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500",
      icon: AlertCircle
    },
    canceled: { 
      label: "Dibatalkan", 
      color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      icon: XCircle
    }
  };

  const filterOptions = [
    { id: "all", label: "Semua" },
    { id: "pending_payment", label: "Belum Bayar" },
    { id: "paid", label: "Diproses" },
    { id: "shipped", label: "Dikirim" },
    { id: "canceled", label: "Batal" },
  ];

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/orders");
        // Sesuaikan dengan struktur data API Anda (biasanya data.data atau data.data.data)
        const result = response.data.data.data || response.data.data || [];
        setOrders(result);
      } catch (error) {
        console.error("Gagal mengambil daftar pesanan:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);
  
  const handleRepeatOrder = async (items: any[]) => {
    confirm({
      title: `Konfirmasi Repeat Order`,
      description: `Apakah Anda yakin ingin membeli lagi ${items.length}  item  ?`,
      onConfirm: async () => {
        try {
          const promises = items.map((item) =>
            axiosInstance.post('/cart/items', {
              product_id : item.variant.product_id,
              variant_id: item.variant_id,
              qty: item.qty || 1
            })
          );
      
          const responses = await Promise.all(promises);
          
          
          // Sesuaikan res.data.cart_item_id dengan struktur JSON dari API Anda
          const newItemIds = responses.map(res => res.data.item.cart_item_id);
          
          // Kirim ID ke store agar nanti di halaman Cart otomatis terceklis
          await refreshCart(newItemIds);
    
          toast.success("Berhasil dimasukan ke Keranjang", { position: "top-center", className: "mt-15" });
          
          router.push('/cart');
        } catch (err) {
          toast.error("Gagal dimasukan ke Keranjang", { position: "top-center", className: "mt-15" });
        }
      }
    });

  };

  // --- FILTER LOGIC ---
  const filteredOrders = activeFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === activeFilter);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] pb-20">
      
      {/* HEADER & FILTER SECTION */}
      <div className="bg-white dark:bg-[#141414] border-b dark:border-neutral-800 pt-24 pb-6 sticky top-0 z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex justify-between">
            <div>
              <h1 className="text-3xl font-bold -tracking-normal uppercase dark:text-white mb-6">Pesanan Saya</h1>
            
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setActiveFilter(option.id)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                      activeFilter === option.id
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="ghost" className="rounded-full gap-2" onClick={() => router.back()}>
              <ChevronLeft className="w-4 h-4" /> Kembali
            </Button>
          </div>


        </div>
      </div>

      <div className="container mx-auto px-6 mt-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {loading ? (
            /* LOADING STATE */
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-neutral-300 mb-4" />
              <p className="text-sm text-neutral-500 font-medium">Menyusun riwayat belanja...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            /* ORDER LIST */
            filteredOrders.map((order) => {
              const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
                label: order.status,
                color: "bg-neutral-100 text-neutral-500",
                icon: Package
              };
              const StatusIcon = statusConfig.icon;

              return (
                <div 
                  key={order.order_oid} 
                  className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all group"
                >
                  {/* Top Bar: Order Number & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl transition-colors">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">No. Order</p>
                        <p className="text-sm font-mono font-bold dark:text-white">{order.order_number}</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black tracking-wide transition-all ${statusConfig.color}`}>
                      <StatusIcon size={14} strokeWidth={3} />
                      {statusConfig.label.toUpperCase()}
                    </div>
                  </div>

                  {/* Info: Item & Date & Total */}
                  <div className="flex items-center gap-4 py-6 border-y border-neutral-50 dark:border-neutral-800/50">
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center text-neutral-400">
                       <Truck size={24} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm dark:text-white font-bold truncate">
                            {order.items?.length || 0} Produk Dipesan
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                            {new Intl.DateTimeFormat('id-ID', { 
                              dateStyle: 'medium', 
                              timeStyle: 'short' 
                            }).format(new Date(order.created_at))}
                        </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase mb-1">Total Bayar</p>
                      <p className="font-black text-xl dark:text-white tracking-tighter">
                        {formatCurrency(order.grand_total)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end gap-3">
                    {  order.status === "paid" && <Button 
                      variant="outline" 
                      className="rounded-full px-10  font-bold h-12 hover:scale-105 active:scale-95 transition-transform w-full sm:w-auto"
                      onClick={() => handleRepeatOrder(order.items)}
                    >
                      Beli lagi
                    </Button>}
                    <Link href={`/orders/${order.order_oid}/invoice`} className="w-full sm:w-auto">
                      <Button className="w-full rounded-full px-10 bg-black dark:bg-white text-white dark:text-black font-bold h-12 hover:scale-105 active:scale-95 transition-transform">
                        Detail Pesanan
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            /* EMPTY STATE */
            <div className="bg-white dark:bg-[#141414] rounded-[3rem] p-16 text-center border border-dashed border-neutral-200 dark:border-neutral-800">
              <div className="w-24 h-24 bg-neutral-50 dark:bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-neutral-300" />
              </div>
              <h3 className="text-2xl font-black dark:text-white mb-2">
                {activeFilter === "all" ? "Belum Ada Pesanan" : "Pesanan Tidak Ditemukan"}
              </h3>
              <p className="text-neutral-500 mb-10 max-w-xs mx-auto text-sm leading-relaxed">
                {activeFilter === "all" 
                  ? "Sepertinya keranjangmu masih butuh teman. Mari cari produk menarik hari ini!" 
                  : `Kami tidak menemukan pesanan dengan status "${filterOptions.find(f => f.id === activeFilter)?.label}".`}
              </p>
              <Link href="/product">
                <Button className="rounded-full px-12 h-14 bg-black dark:bg-white text-white dark:text-black font-black text-lg">
                  Mulai Belanja
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* CSS untuk menyembunyikan scrollbar pada filter tab */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}