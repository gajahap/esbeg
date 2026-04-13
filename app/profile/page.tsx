  'use client';
  import React,{ useState, useEffect} from 'react';
  import { User, MapPin, Package, Settings, LogOut, ChevronRight, Bell, ShoppingCart , Trash2, EllipsisVertical } from 'lucide-react';
  import axiosInstance from '@/lib/axios';
  import { useAuth } from '@/context/AuthContext';
  import { Button } from '@/components/ui/button';
  import { Badge } from '@/components/ui/badge';
  import { AddAddressModal } from '@/components/AddAddressModal';
  import { EditAddressModal } from '@/components/EditAddressModal';
  import { useGlobal } from "@/context/GlobalContext"; // Asumsi formatCurrency ada di sini
  import { toast } from "sonner";
  import { useRouter } from "next/navigation";
  import { ChevronLeft } from "lucide-react";
  import Link from "next/link";

  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

  interface Profile {
      user_oid: string;
      full_name: string;
      username: string;
      email:string;
      phone: number;
      avatar_url: string;
      role: string;
      status: string
  }

  interface Address {
      address_id: string;
      address_line: string;
      user_oid: string;
      name: string;
      phone: string;
      province: string;
      city: string;
      subdistrict: string;
      postal_code: string;
      address: string;
      label:string;
      district: string;
      is_default: boolean;
      receiver_name: string;
  }

  const ProfilePage = () => {
      const [profile, setProfile] = useState<Profile | null>(null);
      const [address, setAddress] = useState<Address[]>([]);
      const [isLoading, setIsLoading] = React.useState(true);
      const { logout, updateUser } = useAuth();
      const { confirm } = useGlobal();
      const [isEditModalOpen, setIsEditModalOpen] = useState(false);
      const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);    
      const [isSaving, setIsSaving] = useState(false);
      const [editForm, setEditForm] = useState({
          full_name: '',
          username: '',
          phone: ''
      });
      const getProfile = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/profile');
            setProfile(response.data);
            
            // Tambahkan baris ini:
            setEditForm({
                full_name: response.data.full_name || '',
                username: response.data.username || '',
                phone: response.data.phone || ''
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
      };
    
      const handleUpdateProfile = async () => {
        const phoneNumber = editForm.phone?.toString().trim();
    
        // 1. Validasi Tidak Boleh Kosong
        if (!phoneNumber) {
            return toast.error("Nomor telepon tidak boleh kosong", { position: "top-center" });
        }
    
        // 2. Validasi Minimal 10 Digit
        if (phoneNumber.length < 10) {
            return toast.error("Nomor telepon minimal 10 digit", { position: "top-center" });
        }
    
        // 3. Validasi Maksimal (Opsional, umumya 13-14 digit)
        if (phoneNumber.length > 14) {
            return toast.error("Nomor telepon terlalu panjang", { position: "top-center" });
        }
    
        try {
            setIsSaving(true);
            const response = await axiosInstance.put('/profile', editForm);
            toast.success("Profil berhasil diperbarui", { position: "top-center" });
            const newUpdateUser = response.data.user;
            updateUser(newUpdateUser);
            
            getProfile(); 
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Gagal memperbarui profil");
        } finally {
            setIsSaving(false);
        }
      };
      
      //address
      const getAddress = async () => {
          try {
              const response = await axiosInstance.get('/addresses');
              setAddress(response.data.data);
              
          } catch (error) {
              console.error(error);
          }
      }

      const handleDeleteAddress = async (item: Address) => {
        confirm({
          title: `Konfirmasi Hapus`,
          description: (
              <>
                Apakah Anda yakin ingin menghapus <strong>{item.label}</strong> dari daftar alamat?
              </>
          ),
          onConfirm: async () => {
            try {
              await axiosInstance.delete(`/addresses/${item.address_id}`);
              toast.success("Berhasil Hapus Alamat", { position: "top-center",className: "mt-15" })
              getAddress();
            } catch (error) {
              console.error(error);
            }
          }
        });
      }

      const makeDefaultAddress = async (item: Address) => {
        try {
          await axiosInstance.put(`/addresses/${item.address_id}/set-default`);
          toast.success("Berhasil Ubah Alamat Utama", { position: "top-center",className: "mt-15" })
          getAddress();
        } catch (error) {
          console.error(error);
        }
      }
      
      useEffect(() => {
          getProfile();
          getAddress();
      },[]);

      const handleLogout = async () => {
          try {
              await logout();
          } catch (error) {
              console.error(error);
          }
      }

      const handleEditClick = (item: Address) => {
        setSelectedAddress(item);
        setIsEditModalOpen(true);
      };

      const router = useRouter();

      if (isLoading) return <ProfileSkeleton />;

      return (
          <div className="min-h-screen bg-neutral-50 dark:bg-[#121212] transition-colors duration-300 pb-10">
              {/* Header / Cover - Black in Light, Deep neutral in Dark */}
              <div className="h-40 bg-neutral-100 dark:bg-neutral-900 w-full border-b dark:border-neutral-800"></div>

              <div className="max-w-5xl mx-auto px-4 -mt-20">
                  <Button variant="ghost" className="rounded-full gap-2" onClick={() => router.back()}>
                      <ChevronLeft className="w-4 h-4" /> Kembali
                  </Button>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  
                  {/* SIDEBAR */}
                  <div className="lg:col-span-1 space-y-4">
                      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border dark:border-neutral-800 p-6 text-center">
                      <div className="relative w-28 h-28 mx-auto mb-4">
                          <img 
                          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                          alt="Avatar" 
                          className="rounded-full border-4 border-white dark:border-neutral-700 shadow-sm bg-neutral-100 dark:bg-neutral-800"
                          />
                          <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white dark:border-[#1e1e1e]"></div>
                      </div>
                      <h2 className="font-bold text-xl text-neutral-900 dark:text-white">{profile?.full_name}</h2>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{profile?.email}</p>
                      
                      <nav className="space-y-1 text-left">
                          <Link href="/cart"><SidebarItem icon={<ShoppingCart size={18}/>} label="Keranjang Saya"/></Link>
                          <Link href="/orders"><SidebarItem icon={<Package size={18}/>} label="Pesanan" /></Link>
                          <div className="my-3 border-t dark:border-neutral-800" />
                          <button  onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                          <LogOut size={18}/> Keluar
                          </button>
                      </nav>
                      </div>
                  </div>

                  {/* MAIN CONTENT */}
                  <div className="lg:col-span-3 space-y-6">
                      
                      {/* Form Pengaturan */}
                      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border dark:border-neutral-800 p-8">
                      <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                          <Settings size={20} className="text-neutral-400" /> Informasi Pribadi
                          </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputGroup label="Nama Lengkap" name="full_name" value={editForm.full_name} onChange={handleInputChange} />
                          <InputGroup label="Username" name="username" value={editForm.username} onChange={handleInputChange} />
                          <InputGroup label="Email" value={profile?.email} disabled />
                          <InputGroup label="Nomor Telepon" name="phone" value={editForm.phone} onChange={handleInputChange} />
                      </div>

                      <button 
                          onClick={handleUpdateProfile}
                          disabled={isSaving}
                          className="mt-8 bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold hover:opacity-80 transition-all active:scale-95 text-sm disabled:opacity-50"
                      >
                          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                      </div>

                      {/* Section Alamat & Pesanan (Grid) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Alamat Pengiriman */}
                      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border dark:border-neutral-800 p-6">
                          <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold dark:text-white">Alamat Pengiriman</h3>
                          <AddAddressModal onSuccess={getAddress}/>
                          {/* Letakkan ini di bawah ProfilePage sebelum penutup tag div utama */}
                          {selectedAddress && (
                            <EditAddressModal 
                              open={isEditModalOpen} 
                              setOpen={setIsEditModalOpen} 
                              addressData={selectedAddress} 
                              onSuccess={getAddress} 
                            />
                          )}
                          </div>
                          {address && address.length > 0 ? (
                          address.map((item) => (
                              <div key={item.address_id}
                                className={`p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl border-2 ${item.is_default ? "border-black dark:border-white" : "border-transparent"} relative mb-2`}
                              >
                              <AddressMenu item={item} onDelete={handleDeleteAddress}  onMakeDefault={makeDefaultAddress} onEdit={handleEditClick}/>
                              {item.is_default && (
                                <div className="absolute top-0 left-2 p-1">
                                  <Badge
                                          className="bg-emerald-300 text-white dark:bg-green-400/20 dark:text-white text-[10px] uppercase tracking-tighter"
                                      >
                                      Di Gunakan
                                  </Badge>
                                </div>
                              )}
                              <p className="font-bold text-sm dark:text-white mb-1 mt-6">{item.label}</p>
                              <div className="flex flex-wrap items-center gap-2 my-1">
                                {/* Nama & Phone Container */}
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-xs text-neutral-900 dark:text-white">
                                    {item.receiver_name}
                                  </p>
                                  
                                  {/* Dot Separator */}
                                  <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                  
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                                    {item.phone}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pr-16">
                                  {item.address_line}, {item.subdistrict}, {item.district}, {item.city}, {item.province}, {item.postal_code}
                              </p>
                              </div>
                          ))
                          ) : (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">Anda belum memiliki alamat pengiriman.</p>
                          )}
                          
                      </div>

                      {/* Notifikasi / Status */}
                      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border dark:border-neutral-800 p-6 flex flex-col justify-center">
                          <div className="flex items-center gap-4">
                          <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl">
                              <Bell size={24} />
                          </div>
                          <div>
                              <h4 className="font-bold dark:text-white text-sm">1 Pesanan Sedang Dikirim</h4>
                              <p className="text-xs text-neutral-500">Cek status paketmu sekarang</p>
                              <button className="mt-2 text-xs font-bold flex items-center gap-1 dark:text-white">
                              Lacak Paket <ChevronRight size={14} />
                              </button>
                          </div>
                          </div>
                      </div>

                      </div>
                  </div>
                  </div>
              </div>
          </div>
      );
  };

  // --- Sub-components untuk kerapihan kode ---

  const SidebarItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
    <button className={`w-full flex items-center gap-3 p-3 text-sm font-medium rounded-xl transition-all ${
      active 
        ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' 
        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
    }`}>
      {icon} {label}
    </button>
  );

  const InputGroup = ({ label, name, value, onChange, disabled = false, type = "text" }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{label}</label>
      <input 
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        disabled={disabled}
        className={`w-full p-3 rounded-xl border dark:border-neutral-700 bg-transparent dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all ${
          disabled ? 'bg-neutral-100 dark:bg-gray-800/50 cursor-not-allowed text-gray-400' : ''
        }`}
        required
      />
    </div>
  );

  const AddressMenu = ({ 
    item, 
    onDelete, 
    onMakeDefault,
    onEdit // Tambahkan prop baru
  }: { 
    item: Address; 
    onDelete: (item: Address) => void;
    onMakeDefault: (item: Address) => void;
    onEdit: (item: Address) => void; // Update interface
  }) => {
    return (
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full outline-none">
              <EllipsisVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl p-1">
            <DropdownMenuItem 
              className="cursor-pointer text-sm font-medium flex items-center gap-2"
              onClick={() => onEdit(item)} // Panggil fungsi edit
            >
              <Settings size={14} /> Edit Alamat
            </DropdownMenuItem>
            
            {!item.is_default && (
              <DropdownMenuItem 
                className="cursor-pointer text-sm font-medium flex items-center gap-2"
                onClick={() => onMakeDefault(item)}
              >
                <MapPin size={14} /> Jadikan Utama
              </DropdownMenuItem>
            )}

            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

            <DropdownMenuItem 
              className="cursor-pointer text-sm font-medium text-red-500 focus:text-red-500 flex items-center gap-2"
              onClick={() => onDelete(item)}
            >
              <Trash2 size={14} /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };
  const ProfileSkeleton = () => (
      <div className="min-h-screen bg-neutral-50 dark:bg-[#121212] pb-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-40 bg-neutral-200 dark:bg-neutral-800 w-full"></div>
    
        <div className="max-w-5xl mx-auto px-4 -mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border dark:border-neutral-800">
                <div className="w-28 h-28 mx-auto mb-4 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-700 mx-auto mb-2 rounded"></div>
                <div className="h-4 w-40 bg-neutral-100 dark:bg-neutral-800 mx-auto mb-6 rounded"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-full"></div>
                  ))}
                </div>
              </div>
            </div>
    
            {/* Content Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-8 border dark:border-neutral-800">
                <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-700 mb-8 rounded"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-20 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
                      <div className="h-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border dark:border-neutral-800"></div>
                    </div>
                  ))}
                </div>
                <div className="h-12 w-40 bg-neutral-200 dark:bg-neutral-700 mt-8 rounded-xl"></div>
              </div>
    
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-32 bg-white dark:bg-[#1e1e1e] rounded-2xl border dark:border-neutral-800 p-6"></div>
                <div className="h-32 bg-white dark:bg-[#1e1e1e] rounded-2xl border dark:border-neutral-800 p-6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  export default ProfilePage;