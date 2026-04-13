"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import axiosInstance from "@/lib/axios"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DataWilayah {
  kode: string;
  nama: string;
}

interface DataKodePos {
  kode: string;
  kodepos: string;
}

interface EditAddressModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  addressData: any; // Menerima data alamat dari page utama
  onSuccess?: () => void;
}

export function EditAddressModal({ open, setOpen, addressData, onSuccess }: EditAddressModalProps) {
  // State Popover
  const [openProv, setOpenProv] = useState(false)
  const [openKota, setOpenKota] = useState(false)
  const [openKec, setOpenKec] = useState(false)
  const [openKel, setOpenKel] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    address: "",
    province: "",
    city: "",
    district: "",
    village: "",
    postalCode: "",
    receiver_name: "",
    phone: ""
  })

  const [dataWilayah, setDataWilayah] = useState<DataWilayah[]>([]);
  const [dataKodePos, setDataKodePos] = useState<DataKodePos[]>([]);

  // 1. Sync data saat modal dibuka atau addressData berubah
  useEffect(() => {
    if (addressData && open) {
      setFormData({
        title: addressData.label || "",
        address: addressData.address_line || "",
        province: addressData.province || "",
        city: addressData.city || "",
        district: addressData.district || "",
        village: addressData.subdistrict || "",
        postalCode: addressData.postal_code || "",
        receiver_name: addressData.receiver_name || "",
        phone: addressData.phone || ""
      });
    }
  }, [addressData, open]);

  // 2. Load Data JSON (Sama seperti AddAddressModal)
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [resWilayah, resKodePos] = await Promise.all([
          fetch('/data/wilayah.json'),
          fetch('/data/kodepos_wilayah.json')
        ]);
        if (!resWilayah.ok || !resKodePos.ok) throw new Error("Gagal mengambil data");
        setDataWilayah(await resWilayah.json());
        setDataKodePos(await resKodePos.json());
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    }
    loadAllData();
  }, [])

  // 3. Logika Filtering (Identik dengan AddAddressModal)
  const listProvinsi = useMemo(() => dataWilayah.filter(item => !item.kode.includes('.')), [dataWilayah]);

  const listKota = useMemo(() => {
    const prov = listProvinsi.find(p => p.nama === formData.province);
    if (!prov) return [];
    return dataWilayah.filter(item => item.kode.startsWith(prov.kode + '.') && item.kode.split('.').length === 2);
  }, [formData.province, listProvinsi, dataWilayah]);

  const listKecamatan = useMemo(() => {
    const kota = listKota.find(k => k.nama === formData.city);
    if (!kota) return [];
    return dataWilayah.filter(item => item.kode.startsWith(kota.kode + '.') && item.kode.split('.').length === 3);
  }, [formData.city, listKota, dataWilayah]);

  const listKelurahan = useMemo(() => {
    const kec = listKecamatan.find(k => k.nama === formData.district);
    if (!kec) return [];
    return dataWilayah.filter(item => item.kode.startsWith(kec.kode + '.') && item.kode.split('.').length === 4);
  }, [formData.district, listKecamatan, dataWilayah]);

  const handleKelurahanSelect = (namaKelurahan: string) => {
    const selectedKel = listKelurahan.find(k => k.nama === namaKelurahan);
    if (selectedKel) {
      const foundPos = dataKodePos.find(kp => kp.kode === selectedKel.kode);
      setFormData(prev => ({ ...prev, village: namaKelurahan, postalCode: foundPos ? foundPos.kodepos : "" }));
    }
  };

  const handleSubmit = async () => {
    try {
      const finalData = {
        address_line: formData.address,
        province: formData.province,
        city: formData.city,
        district: formData.district,
        subdistrict: formData.village,
        postal_code: formData.postalCode,
        phone: formData.phone,
        label: formData.title,
        receiver_name: formData.receiver_name
      }
      // Menggunakan PUT dan ID dari addressData
      const res = await axiosInstance.put(`/addresses/${addressData.address_id}`, finalData);
      
      setOpen(false); 
      if (onSuccess) {
        onSuccess();
        toast.success("Berhasil Update Alamat", { position: "top-center", className: "mt-15" });
      }
    } catch (error: any) {
      console.error("Update Error:", error);
      toast.error("Gagal memperbarui alamat");
    }
  }

  // --- SUB-COMPONENT COMBOBOX (Identik) ---
  const WilayahSelect = ({ label, value, onSelect, items, placeholder, disabled, openState, setOpenState }: any) => (
    <div className="grid gap-2">
      <Label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{label}</Label>
      <Popover open={openState} onOpenChange={setOpenState}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" role="combobox" disabled={disabled}
            className={cn("w-full justify-between rounded-xl font-normal border-neutral-200 h-11", !value && "text-muted-foreground")}
          >
            <span className="truncate">{value || placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-70 p-0 shadow-lg border-neutral-200" align="start">
          <Command>
            <CommandInput placeholder={`Cari ${label}...`} className="h-10" />
            <CommandList className="max-h-62.5">
              <CommandEmpty>Data tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {items.map((item: DataWilayah) => (
                  <CommandItem
                    key={item.kode} value={item.nama}
                    onSelect={() => { onSelect(item.nama); setOpenState(false); }}
                    className="cursor-pointer"
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === item.nama ? "opacity-100" : "opacity-0")} />
                    {item.nama}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-162.5 rounded-2xl overflow-hidden p-0">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-bold text-2xl text-left">Edit Alamat</DialogTitle>
            <DialogDescription className="sr-only">Perbarui detail alamat pengiriman Anda.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Nama Alamat</Label>
              <Input 
                placeholder="Contoh: Rumah Utama" className="rounded-xl h-11"
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Nama Lengkap Penerima</Label>
              <Input 
                placeholder="Nama Penerima" className="rounded-xl h-11"
                value={formData.receiver_name} onChange={(e) => setFormData({...formData, receiver_name: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">No. Telepon</Label>
              <Input 
                type="tel" value={formData.phone} className="rounded-xl h-11"
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              <WilayahSelect 
                label="Provinsi" value={formData.province} items={listProvinsi} 
                openState={openProv} setOpenState={setOpenProv}
                onSelect={(val: string) => setFormData({...formData, province: val, city: "", district: "", village: "", postalCode: ""})}
              />
              <WilayahSelect 
                label="Kota / Kabupaten" value={formData.city} items={listKota} disabled={!formData.province}
                openState={openKota} setOpenState={setOpenKota}
                onSelect={(val: string) => setFormData({...formData, city: val, district: "", village: "", postalCode: ""})}
              />
              <WilayahSelect 
                label="Kecamatan" value={formData.district} items={listKecamatan} disabled={!formData.city}
                openState={openKec} setOpenState={setOpenKec}
                onSelect={(val: string) => setFormData({...formData, district: val, village: "", postalCode: ""})}
              />
              <WilayahSelect 
                label="Kelurahan / Desa" value={formData.village} items={listKelurahan} disabled={!formData.district}
                openState={openKel} setOpenState={setOpenKel}
                onSelect={handleKelurahanSelect}
              />
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Kode Pos</Label>
                <Input 
                  className="rounded-xl h-11 bg-neutral-50/50" value={formData.postalCode} readOnly
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Alamat Lengkap</Label>
              <Textarea 
                className="rounded-xl min-h-25 resize-none" maxLength={250}
                value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              <span className="text-xs text-neutral-400 mx-2">{formData.address.length}/250</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 p-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full font-bold">Batal</Button>
          <Button onClick={handleSubmit} className="flex-1 md:flex-none px-10 rounded-full bg-black text-white hover:bg-neutral-800 font-bold h-12">
            Update Alamat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}