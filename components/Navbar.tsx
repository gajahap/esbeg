"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { User, ShoppingCart, Search, Package, X } from "lucide-react"; // Tambah ikon X
import { useAuth } from "@/context/AuthContext";
import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "./ui/input"; // Pastikan kamu punya komponen Input shadcn

const Navbar = () => {
    const { user } = useAuth();
    const { cartLength, fetchCartLength, lastAddedTimestamp } = useCartStore();
    
    // State untuk Search Mode
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    
    const isInitialMount = useRef(true);
    const [isSucking, setIsSucking] = useState(false);
    const [cartPos, setCartPos] = useState({ x: 0, y: 0 });
    const cartBtnRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchCartLength();
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (lastAddedTimestamp && cartBtnRef.current) {
            const rect = cartBtnRef.current.getBoundingClientRect();
            setCartPos({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            });

            setIsSucking(true);
            const timer = setTimeout(() => setIsSucking(false), 800);
            return () => clearTimeout(timer);
        }
    }, [lastAddedTimestamp]);

    return (
        <nav className="bg-background/60 backdrop-blur sticky top-0 z-50 border-b border-border/40">
            {/* Animasi Sucking Dot */}
            <AnimatePresence>
                {isSucking && (
                    <motion.div
                        className="fixed w-15 h-15 bg-primary rounded-full z-100 pointer-events-none shadow-lg shadow-primary/50"
                        initial={{ x: "50vw", y: "50vh", scale: 1.5, opacity: 0 }}
                        animate={{ 
                            x: cartPos.x - 10, 
                            y: cartPos.y - 10, 
                            scale: 0.1, 
                            opacity: [0, 1, 1, 0] 
                        }}
                        transition={{ duration: 0.7, ease: [0.6, 0.05, 0.19, 0.91] }}
                    />
                )}
            </AnimatePresence>

            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                {/* LOGO */}
                <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-foreground shrink-0">
                    <img src="/assets/logo hitam.png" className="h-5 dark:hidden" alt="Logo" />
                    <img src="/assets/logo putih.png" className="h-5 hidden dark:block" alt="Logo" />
                </Link>

                {/* AREA TENGAH: Navigasi atau Search Input */}
                <div className="flex-1 flex justify-center px-4 max-w-2xl">
                    <AnimatePresence mode="wait">
                        {!isSearchOpen ? (
                            <motion.div 
                                key="nav-links"
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-medium text-foreground/70"
                            >
                                <Link href="/" className="hover:text-primary transition-colors">New Arrivals</Link>
                                <Link href="/product" className="hover:text-primary transition-colors">Product</Link>
                                <Link href="/about" className="hover:text-primary transition-colors">Our Story</Link>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="search-input"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full flex items-center gap-2"
                            >
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        autoFocus
                                        placeholder="Cari produk impianmu..." 
                                        className="w-full pl-10 rounded-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                                    />
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setIsSearchOpen(false)}
                                    className="rounded-full shrink-0"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-2 shrink-0">
                    {!isSearchOpen && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsSearchOpen(true)}
                            className="rounded-full text-foreground/70 hover:text-foreground transition-all"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    )}

                    {user && (
                        <Link href={"/orders"}>
                            <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex text-foreground/70 hover:text-foreground">
                                <Package className="h-5 w-5" />
                            </Button>
                        </Link>
                    )}
                    
                    <ModeToggle />
                    
                    <Link href={user ? "/profile" : "/login"}>
                        <Button variant="ghost" className="rounded-full text-foreground/70 hover:text-foreground flex items-center gap-3 px-4">
                            <User className="h-5 w-5 shrink-0" />
                            <span className="hidden lg:inline text-sm font-medium max-w-30 truncate">
                                {user?.username || 'Masuk'}
                            </span>
                        </Button>
                    </Link>

                    <Link href="/cart">
                        <div ref={cartBtnRef} className="relative">
                            <motion.div
                                animate={isSucking ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.3, delay: 0.5 }}
                            >
                                <Button variant="default" className="rounded-full px-5 gap-2 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                                    <ShoppingCart className="h-4 w-4" />
                                    <div className="relative h-4 w-4 flex items-center justify-center">
                                        <AnimatePresence mode="popLayout">
                                            <motion.span
                                                key={cartLength}
                                                initial={{ y: -20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: 20, opacity: 0 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                                className="text-xs font-bold leading-none absolute"
                                            >
                                                {cartLength || 0}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>

                                    <AnimatePresence>
                                        {isSucking && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: [0, 1, 0] }}
                                                transition={{ duration: 0.4, delay: 0.6 }}
                                                className="absolute inset-0 bg-white/30 pointer-events-none"
                                            />
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </motion.div>
                        </div>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;