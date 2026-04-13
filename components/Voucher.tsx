"use client";

import { useState, useEffect } from "react";
import { Ticket, CheckCircle2, Circle, Percent, Gift, AlertCircle } from "lucide-react";
import { useGlobal } from "@/context/GlobalContext";

// Export interface agar bisa di-import di checkout page
export interface Voucher {
  voucher_id: number;
  code: string;
  name: string;
  description: string;
  discount_type: "percent" | "fixed";
  discount_value: string;
  min_order_amount: string;
  max_discount_amount: string;
  remaining_quota: number;
  remaining_user_quota: number;
  start_at: string;
  end_at: string;
}

interface VoucherSectionProps {
  data: Voucher[];
  onSelect: (voucher: Voucher | null) => void;
  errorMessage?: string | null; // Tambahkan ini di interface
}

export default function VoucherSection({ data, onSelect, errorMessage }: VoucherSectionProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { formatCurrency } = useGlobal();

  const handleSelect = (voucher: Voucher) => {
    const isSelected = selectedId === voucher.voucher_id;
    const newId = isSelected ? null : voucher.voucher_id;
    const newData = isSelected ? null : voucher;

    setSelectedId(newId);
    onSelect(newData);
  };

  useEffect(() => {
    if (errorMessage) {
      setSelectedId(null);
    }
  }, [errorMessage]);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-6 rounded-3xl space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Ticket className="w-5 h-5 text-neutral-500" />
        <h2 className="text-lg font-bold dark:text-white">Voucher Tersedia</h2>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-in slide-in-from-top-1">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      <div className="space-y-3  overflow-auto max-h-75">
        {data.length > 0 ? (
          data.map((voucher) => {
            const isSelected = selectedId === voucher.voucher_id;
            const isPercent = voucher.discount_type === "percent";

            return (
              <div
                key={voucher.voucher_id}
                onClick={() => handleSelect(voucher)}
                className={`
                  relative cursor-pointer flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                  ${isSelected 
                    ? "border-black dark:border-white bg-white dark:bg-neutral-800 shadow-md" 
                    : "border-transparent bg-white/50 dark:bg-neutral-800/40 hover:border-neutral-300 dark:hover:border-neutral-700"}
                `}
              >
                <div className={`p-3 rounded-xl ${isPercent ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                  {isPercent ? <Percent className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm dark:text-white line-clamp-1">{voucher.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-mono">
                      {voucher.code}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">{voucher.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[9px] text-orange-600 dark:text-orange-400 font-semibold uppercase">
                      {isPercent ? `Diskon ${parseFloat(voucher.discount_value)}%` : `Potongan ${formatCurrency(parseFloat(voucher.discount_value))}`}
                    </span>
                  </div>
                </div>

                {isSelected ? <CheckCircle2 className="w-5 h-5 text-black dark:text-white" /> : <Circle className="w-5 h-5 text-neutral-300 dark:text-neutral-700" />}
              </div>
            );
          })
        ) : (
          <p className="text-center text-sm text-neutral-500 py-4">Tidak ada voucher.</p>
        )}
      </div>
    </div>
  );
}