'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { SearchIcon, ImageIcon, Check, ChevronsUpDown } from "lucide-react";
import axiosInstance from '@/lib/axios';
import { useGlobal } from '@/context/GlobalContext';
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Loading from '@/components/Loading';
import Image from 'next/image';

// --- Interfaces ---
interface Category {
  category_id: number;
  name: string;
}

interface Brand {
  brand_id: number;
  name: string;
}

interface Product {
  product_id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number;
  brand: {
    name: string;
    category: {
      name: string;
      category_id: number;
    }
  };
  primary_image?: {
    image_url: string;
  };
}

const CatalogPage = () => {
  // --- States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Filter & Sort States
  const [selectedBrand, setSelectedBrand] = useState("Semua");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [sortOrder, setSortOrder] = useState("default");
  
  // Popover States
  const [openBrand, setOpenBrand] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const { formatCurrency } = useGlobal();
  const baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL;

  // --- Fetch Data ---
  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        axiosInstance.get(`/product`),
        axiosInstance.get(`/brand`),
        axiosInstance.get(`/category`)
      ]);
      
      setProducts(productsRes.data || []);
      setBrands(brandsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error("Gagal memuat data katalog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- Logic Filtering & Sorting ---
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products
      .filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchBrand = selectedBrand === "Semua" || p.brand.name === selectedBrand;
        const matchCat = selectedCategory === "Semua" || p.brand.category.name === selectedCategory;
        return matchSearch && matchBrand && matchCat;
      })
      .sort((a, b) => {
        if (sortOrder === "low") return a.price - b.price;
        if (sortOrder === "high") return b.price - a.price;
        return 0;
      });
  }, [searchTerm, selectedBrand, selectedCategory, sortOrder, products]);

  // --- Reusable Filter Select Component ---
  const FilterSelect = ({ label, value, onSelect, items, placeholder, openState, setOpenState }: any) => (
    <div className="flex flex-col">
      <label className="text-[10px] uppercase font-bold text-neutral-400 mb-1 tracking-wider ml-1">{label}</label>
      <Popover open={openState} onOpenChange={setOpenState}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            role="combobox" 
            className="justify-between bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 font-semibold text-sm h-auto p-1 px-2 min-w-35 border-none focus:ring-0"
          >
            <span className="truncate">{value}</span>
            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-50 p-0 shadow-2xl border-neutral-200 dark:border-neutral-800 z-100" align="start">
          <Command>
            <CommandInput placeholder={`Cari ${label}...`} className="h-9" />
            <CommandList>
              <CommandEmpty>Tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {items.map((item: any) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onSelect(item.name)
                      setOpenState(false)
                    }}
                    className="cursor-pointer text-xs"
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === item.name ? "opacity-100" : "opacity-0")} />
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Product.</h1>
          <hr className="border-neutral-200 dark:border-neutral-800" />
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 border-b pb-8 border-neutral-100 dark:border-neutral-900">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/3">
            <InputGroup>
              <InputGroupInput placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value)} />
              <InputGroupAddon><SearchIcon /></InputGroupAddon>
            </InputGroup>
          </div>

          {/* Filters Selectors */}
          <div className="flex flex-wrap gap-8 w-full md:w-auto items-end">
            <FilterSelect 
              label="Brand"
              value={selectedBrand === "Semua" ? "Semua Brand" : selectedBrand}
              openState={openBrand}
              setOpenState={setOpenBrand}
              items={[{ id: 'all', name: 'Semua Brand' }, ...brands.map(b => ({ id: b.brand_id, name: b.name }))]}
              onSelect={(val: string) => setSelectedBrand(val === "Semua Brand" ? "Semua" : val)}
            />

            <FilterSelect 
              label="Kategori"
              value={selectedCategory === "Semua" ? "Semua Kategori" : selectedCategory}
              openState={openCategory}
              setOpenState={setOpenCategory}
              items={[{ id: 'all', name: 'Semua Kategori' }, ...categories.map(c => ({ id: c.category_id, name: c.name }))]}
              onSelect={(val: string) => setSelectedCategory(val === "Semua Kategori" ? "Semua" : val)}
            />

            <FilterSelect 
              label="Urutan"
              value={
                sortOrder === "default" ? "Terbaru" : 
                sortOrder === "low" ? "Harga Terendah" : "Harga Tertinggi"
              }
              openState={openSort}
              setOpenState={setOpenSort}
              items={[
                { id: 'default', name: 'Terbaru' },
                { id: 'low', name: 'Harga Terendah' },
                { id: 'high', name: 'Harga Tertinggi' }
              ]}
              onSelect={(val: string) => {
                if (val === "Terbaru") setSortOrder("default")
                if (val === "Harga Terendah") setSortOrder("low")
                if (val === "Harga Tertinggi") setSortOrder("high")
              }}
            />
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filteredProducts.map((p) => (
              <Link href={`/product/${p.slug}`} key={p.product_id} className="group">
                <div className="cursor-pointer">
                  <div className="relative aspect-3/4 overflow-hidden bg-neutral-100 dark:bg-neutral-900 rounded-xl mb-4 flex items-center justify-center">
                    {p.primary_image?.image_url ? (
                      <Image 
                        src={`${baseUrl}${p.primary_image.image_url}`} 
                        alt={p.name} 
                        fill // Mengisi kontainer parent (aspect-3/4)
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        // Tambahkan ini agar transisi loading lebih cantik
                        onLoadingComplete={(img) => img.classList.remove("opacity-0")}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-neutral-400">
                        <ImageIcon size={32} strokeWidth={1.5} /> 
                        <span className="text-[10px] font-bold uppercase mt-2">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 tracking-widest uppercase font-bold">
                      {p.brand.category.name}
                    </p>
                    <h3 className="text-sm font-bold tracking-wide uppercase leading-tight line-clamp-2 dark:text-white group-hover:underline">
                      [{p.brand.name}] {p.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {p.compare_at_price > p.price && (
                        <>
                          <p className="text-xs font-medium text-neutral-300 dark:text-neutral-600 line-through">
                            {formatCurrency(p.compare_at_price)}
                          </p>
                          <div className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black rounded-sm">
                            -{Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)}%
                          </div>
                        </>
                      )}
                      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        {formatCurrency(p.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-neutral-400 text-lg">Produk tidak ditemukan.</p>
            <button 
              onClick={() => {setSearchTerm(""); setSelectedBrand("Semua"); setSelectedCategory("Semua"); setSortOrder("default");}}
              className="mt-4 text-sm font-bold underline uppercase tracking-widest hover:text-red-600 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;