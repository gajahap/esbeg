"use client";

import { Button } from "@/components/ui/button";
import React, { useState, useEffect,useRef  } from "react";
import axiosInstance from '@/lib/axios';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CartModal } from "@/components/CartModal"; 
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, PlusIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"
import Loading from "@/components/Loading";
import Image from 'next/image';
// --- INTERFACE ---
interface Product {
  product_id: number;
  name: string;
  price: number;
  tag: string | null;
  image: string;
  variants: string[]
  primary_image?: {
    image_url: string;
  };
  slug: string;
}

interface Brand {
  brand_id: number;
  name: string;
  image_background: string;
  image_logo: string;
}

const BANNERS = [
  {
    title: "Muslim Style Collection 2026", 
    subtitle: "Cerah berseri di hari lebaran.",
    image: "http://192.168.200.6:3000/assets/c1.png",
    button: "Belanja Sekarang",
  },
  {
    title: "Urban Streetwear",
    subtitle: "Ekspresikan dirimu dengan gaya jalanan yang berani.",
    image: "https://image.uniqlo.com/UQ/CMS/video/jp/2026/HOME/GL_Aseets/Campaign/Jeans/Jeans_street_w_pc_2-1-movie_1.mp4",
    button: "Lihat Koleksi"
  },
  {
    title: "Premium Quality",
    subtitle: "Bahan terbaik untuk kenyamanan maksimal Anda.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070",
    button: "Eksplorasi"
  }
];

interface Thumbnail {
  title: string;
  type: string;
  file_url: string;
  button: string;
  subtitle: string;
  description: string;  
}

// const CATALOG: Record<string, Product[]> = {
//   women: [
//     { id: 1, name: "Amira Silk Abaya", price: "549.000", tag: "New", image: "https://losyana.shop/cdn/shop/files/6B800C08-98A0-48DD-B1C7-BCF4070DBC2F.jpg?v=1766407817&width=3021", variants: ['White', 'Cream','Mocca'] },
//     { id: 2, name: "Premium Pashmina Ceruty", price: "85.000", tag: "Best Seller", image: "https://dauky.co.id/cdn/shop/files/INSTANTPASHMINATEXTURE-TOBACCOBROWNA.jpg?v=1722325714&width=1200", variants: ['White', 'Cream','Mocca'] },
//     { id: 3, name: "Zahra Prayer Set", price: "325.000", tag: null, image: "https://lozy.id/cdn/shop/files/9_86a07f96-4495-4daf-9b28-2d7c1b0dd83e_800x.jpg?v=1686969776", variants: ['White', 'Cream','Mocca'] },
//   ],
//   men: [
//     { id: 4, name: "Koko Kurta Minimalist", price: "275.000", tag: "Sale", image: "https://matahari.com/cdn/shop/files/32393214_1_1.jpg?v=1741921057&width=360", variants: ['White', 'Cream','Mocca'] },
//     { id: 5, name: "Premium Linen Sirwal", price: "210.000", tag: null, image: "https://dynamic.zacdn.com/a7pZ0KBZNN2Z9DUHRvSPmi_m54g=/filters:quality(70):format(webp)/https://static-id.zacdn.com/p/jobb-9500-7532204-1.jpg",variants: ['White', 'Cream','Mocca'] },
//     { id: 6, name: "Sarung Bintang Gajah", price: "80.000", tag: null, image: "https://img.lazcdn.com/g/p/250c952a3df4f45a1d14110b84ead35b.jpg_720x720q80.jpg", variants: ['White', 'Cream','Mocca'] },
//   ]
// };



export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<"women" | "men">("women");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [data,setData] = useState<Product[]>([]);
  const [brands,setBrands] = useState<Brand[]>([]);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Default true
  const scrollContainerRef = useRef(null);
  const esbegRef = useRef<HTMLDivElement | null>(null);


  
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
  
      // Memanggil semua API secara paralel agar lebih cepat
      const [productRes, brandRes, thumbnailRes] = await Promise.all([
        axiosInstance.get('/product'),
        axiosInstance.get('/brand'),
        axiosInstance.get('/thumbnail') 
      ]);
  
      setData(productRes.data);
      setBrands(brandRes.data.data);
      setThumbnails(thumbnailRes.data.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Jalankan HANYA sekali saat komponen mount
  useEffect(() => {
    fetchInitialData();
  }, []);

    const formatCurrency = (number:number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(number);
    };
  

    // Efek untuk scroll otomatis ke ESBEG di Mobile saat load
    useEffect(() => {
      if (!isLoading && esbegRef.current && window.innerWidth < 768) {
        esbegRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }, [isLoading, brands]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* --- HERO CAROUSEL --- */}
      <section className="w-full">
        <Carousel opts={{ loop: true }} className="w-full h-screen">
          <CarouselContent>
            {thumbnails.map((banner, index) => (
              <CarouselItem key={index} className="relative w-full h-screen">
                <div className="absolute inset-0 bg-black/10 z-10" />
                {banner.type === "video" ? (
                  <video src={banner.file_url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <img src={banner.file_url} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="relative z-20 container mx-auto h-full flex flex-col items-left justify-center text-left text-white px-6">
                  <motion.h1 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
                    {banner.title}
                  </motion.h1>
                  <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl font-light">
                    {banner.description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, originX: 0 }}
                    whileInView={{ opacity: 1, scale: 1, originX: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-start"
                  >
                    {banner.button && (
                      <Link href="/products">
                        <Button size="lg" className="rounded-full px-8 bg-white text-black hover:bg-white/90">
                          {banner.button}
                        </Button>
                      </Link>
                    )}
                  </motion.div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Tambahkan ini untuk memunculkan tombol navigasi */}
          <div className="hidden md:block">
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 border-none text-white" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 border-none text-white" />
          </div>
        </Carousel>
      </section>

      <section className="container mx-auto mt-10 px-6">
        <div className="relative flex items-center">
          {/* Garis Kiri */}
          <div className="grow border-t border-neutral-200 dark:border-neutral-800"></div>
          
          {/* Teks di Tengah */}
          <span className="shrink mx-4 text-xs uppercase tracking-[0.3em] text-neutral-400 font-bold">
            Shop by our brands family
          </span>
          
          {/* Garis Kanan */}
          <div className="grow border-t border-neutral-200 dark:border-neutral-800"></div>
        </div>
      </section>




      <section className="container mx-auto py-12 md:py-24 px-4 md:px-6 overflow-hidden">
        {/* Header Section */}
        <div className="mb-10 md:mb-16 space-y-2 text-center">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
            Explore <span className="font-bold">Brand Kami</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Temukan produk terbaik dari brand partners kami.
          </p>
        </div>

        {/* Container: Carousel Mobile & Focus Grid Desktop */}
        <div 
          ref={scrollContainerRef}
          className="
            flex items-center gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-10
            md:overflow-visible md:justify-center md:gap-4 md:h-125 md:pb-0 pt-4
          "
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[80%] md:min-w-0 md:flex-1 h-100 md:h-full overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>
            ))
          ) : (() => {
            if (!brands || brands.length === 0) return null;

            const otherBrands = brands.filter(b => b.name.toLowerCase() !== 'esbeg');
            const esbegBrand = brands.find(b => b.name.toLowerCase() === 'esbeg');
            
            let sortedBrands = [...brands];
            if (esbegBrand) {
              const middleIndex = Math.floor(otherBrands.length / 2);
              sortedBrands = [
                ...otherBrands.slice(0, middleIndex),
                esbegBrand,
                ...otherBrands.slice(middleIndex)
              ];
            }

            const centerIndex = Math.floor(sortedBrands.length / 2);

            return sortedBrands.map((brand, index) => {
              const isCenter = index === centerIndex;
              const isNearCenter = index === centerIndex - 1 || index === centerIndex + 1;
              const isEdge = !isCenter && !isNearCenter;

              return (
                <div
                  key={brand.brand_id}
                  ref={isCenter ? esbegRef : null} // Berikan Ref pada ESBEG
                  className={`
                    /* Mobile: Card Size */
                    min-w-[70%] sm:min-w-[65%] snap-center h-105 scroll-mx-10
                    
                    /* Desktop: Ukuran Proporsional */
                    md:min-w-0 relative transition-all duration-700 ease-in-out overflow-hidden bg-neutral-900 shadow-xl group
                    
                    /* Spotlight Style (Mobile & Desktop) */
                    ${isCenter 
                      ? 'scale-105 z-30 shadow-2xl md:flex-[1.5] md:h-full' 
                      : 'scale-95 md:flex-1 md:h-[70%] z-10'
                    }
                    
                    /* Near Center (Desktop Only) */
                    ${isNearCenter ? 'md:flex-[1.2] md:h-[85%] md:z-20 ' : ''}
                    
                    /* Hover Effect (Desktop Only) */
                    md:hover:h-full! md:hover:scale-100! md:hover:z-40 md:hover:flex-[1.8]
                  `}
                >
                  {/* 1. Background Image */}
                  {brand.image_background ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/storage/${brand.image_background}`}
                      className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-700"
                      alt={brand.name}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-neutral-800 to-black" />
                  )}

                  {/* 2. Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-80" />

                  {/* 3. Content: Logo & Name */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <img
                      src={brand.image_logo ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/storage/${brand.image_logo}` : "/placeholder.jpg"}
                      className={`
                        max-h-[35%] w-auto max-w-[60%] object-contain transition-all duration-500 drop-shadow-2xl
                        ${isCenter ? 'scale-125' : 'scale-100'}
                        group-hover:scale-110
                      `}
                      alt="Logo"
                    />
                    
                    <div className={`
                      mt-8 transition-all duration-500
                      ${isCenter ? 'opacity-100' : 'opacity-100 translate-y-4 group-hover:translate-y-0'}
                    `}>
                      <p className="text-white text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] whitespace-nowrap">
                        {brand.name}
                      </p>
                      <div className="h-px w-12 bg-primary mx-auto mt-3" />
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </section>

      {/* --- SECTION KATALOG --- */}
      <section className="container mx-auto py-24 px-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary" />
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary">
                Best Sellers
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter  leading-none">
              Top <span className="font-light text-muted-foreground">Products</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Koleksi terkurasi dengan kualitas terbaik yang menjadi favorit pelanggan kami.
            </p>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              // Skeleton tetap sama...
              Array.from({ length: 5 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="space-y-4">
                  <div className="relative aspect-3/4 overflow-hidden rounded-sm">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))
            ) : (
              data && data.map((product) => (
                <motion.div
                  key={`${activeCategory}-${product.slug}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="group"
                >
                  {/* IMAGE CONTAINER */}
                  <div className="relative aspect-3/4 overflow-hidden rounded-sm bg-[#f5f5f5] mb-4">
                    {product.tag && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-black shadow-sm">
                          {product.tag}
                        </span>
                      </div>
                    )}
                    
                    <Link href={`/product/${product.slug}`}>
                      <Image 
                          src={`${process.env.NEXT_PUBLIC_STORAGE_URL}${product?.primary_image?.image_url}`}
                          alt={product.name}
                          fill // Mengisi kontainer aspect-3/4
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                          priority={false} // Tetap lazy load kecuali untuk produk paling atas
                          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                          placeholder="blur" // Opsional: Butuh blurDataURL
                          blurDataURL="data:image/png;base64,..." // Base64 gambar sangat kecil
                        />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                    </Link>

                    {/* QUICK ADD BUTTON (DESKTOP ONLY) */}
                    <div className="hidden lg:block absolute bottom-4 inset-x-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-in-out">
                      <Button 
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedProduct(product);
                        }}
                        className="w-full bg-white text-black hover:bg-black hover:text-white transition-colors duration-300 rounded-none h-12 text-[10px] font-bold uppercase tracking-[0.2em] border-none shadow-xl"
                      >
                        Quick Add +
                      </Button>
                    </div>
                  </div>

                  {/* PRODUCT INFO */}
                  <div className="space-y-2 px-1">
                    <Link href={`/product/${product.slug}`} className="block group/text">
                      <h3 className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold group-hover/text:text-primary transition-colors truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="font-bold text-sm tracking-tight text-foreground">
                          {formatCurrency(product.price)}
                        </p>
                        <div className="h-1 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>

                    {/* BUTTON BELI (MOBILE ONLY) */}
                    <div className="lg:hidden pt-2">
                      <Button 
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedProduct(product);
                        }}
                        className="w-full bg-black text-white dark:bg-neutral-800 dark:text-white active:bg-neutral-800 h-10 text-[10px] font-bold uppercase tracking-[0.2em] border-none"
                      >
                        Beli
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* VIEW ALL BUTTON */}
        <div className="mt-20 flex justify-center">
          <Link href="/product">
            <Button 
              variant="ghost" 
              className="group flex flex-col items-center gap-2 hover:bg-transparent"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Lihat Semua</span>
              <div className="h-0.5 w-8 bg-border group-hover:w-20 group-hover:bg-primary transition-all duration-500" />
            </Button>
          </Link>
        </div>
      </section>

      
      <CartModal 
        product={selectedProduct as any} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
}