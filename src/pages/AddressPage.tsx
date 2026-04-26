import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  Home,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";


import { getAuthUser } from "@/lib/auth";
import {
  type ApiAddress,
  type ApiProvince,
  type ApiCity,
  type ApiSubdistrict,
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getApiProvinces,
  getApiCities,
  getApiSubdistricts,
} from "@/lib/address";
/* ─── Zod Schema ─── */
const PROVINCE_POSTAL_PREFIX: Record<number, string[]> = {
  1: ["8"], // Bali
  2: ["3"], // Bangka Belitung
  3: ["1", "4"], // Banten
  4: ["3"], // Bengkulu
  5: ["5"], // DIY
  6: ["1"], // DKI Jakarta
  7: ["9"], // Gorontalo
  8: ["3"], // Jambi
  9: ["1", "4"], // Jawa Barat
  10: ["5"], // Jawa Tengah
  11: ["6"], // Jawa Timur
  12: ["7"], // Kalbar
  13: ["7"], // Kalsel
  14: ["7"], // Kalteng
  15: ["7"], // Kaltim
  16: ["7"], // Kaltara
  17: ["2"], // Kepri
  18: ["3"], // Lampung
  19: ["9"], // Maluku
  20: ["9"], // Malut
  21: ["2"], // Aceh
  22: ["8"], // NTB
  23: ["8"], // NTT
  24: ["9"], // Papua
  25: ["9"], // Papua Barat
  26: ["2"], // Riau
  27: ["9"], // Sulbar
  28: ["9"], // Sulsel
  29: ["9"], // Sulteng
  30: ["9"], // Sultra
  31: ["9"], // Sulut
  32: ["2"], // Sumbar
  33: ["3"], // Sumsel
  34: ["2"], // Sumut
};

const addressSchema = z.object({
  label: z.string().min(2, "Label alamat minimal 2 karakter (cth: Rumah, Kantor)"),
  receiver_name: z.string().min(2, "Nama penerima minimal 2 karakter"),
  phone_number: z.string().min(9, "Nomor telepon tidak valid"),
  address: z.string().min(10, "Alamat lengkap minimal 10 karakter"),
  province_id: z.string().min(1, "Pilih provinsi"),
  city_id: z.string().min(1, "Pilih kota/kabupaten"),
  district_id: z.string().min(1, "Pilih kecamatan"),
  subdistrict_name: z.string().min(2, "Isi nama kelurahan"),
  postal_code: z.string().length(5, "Kode pos harus 5 digit"),
  is_default: z.boolean().default(false),
}).superRefine((data, ctx) => {
  const provinceId = Number(data.province_id);
  const prefixes = PROVINCE_POSTAL_PREFIX[provinceId];
  if (prefixes && data.postal_code && data.postal_code.length > 0) {
    const firstDigit = data.postal_code.charAt(0);
    if (!prefixes.includes(firstDigit)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Kode pos untuk wilayah ini umumnya diawali angka ${prefixes.join(" atau ")}`,
        path: ["postal_code"],
      });
    }
  }
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddressPage() {
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [mounted, setMounted] = useState(false);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Alert State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<ApiAddress | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAddresses = async () => {
    try {
      const user = getAuthUser();
      if (user) {
        const data = await getUserAddresses(user.id);
        setAddresses(data);
      }
    } catch (err) {
      toast.error("Gagal memuat alamat");
    } finally {
      setMounted(true);
    }
  };

  useEffect(() => {
    fetchAddresses();
    document.title = "Daftar Alamat — Kasta Beauté";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Regional API State
  const [provinces, setProvinces] = useState<ApiProvince[]>([]);
  const [cities, setCities] = useState<ApiCity[]>([]);
  const [subdistricts, setSubdistricts] = useState<ApiSubdistrict[]>([]);

  // Form setup
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "",
      receiver_name: "",
      phone_number: "",
      address: "",
      province_id: "",
      city_id: "",
      district_id: "",
      subdistrict_name: "",
      postal_code: "",
      is_default: false,
    },
  });

  const watchProvince = form.watch("province_id");
  const watchCity = form.watch("city_id");

  // Fetch Provinces on Mount
  useEffect(() => {
    getApiProvinces().then(setProvinces).catch(console.error);
  }, []);

  // Fetch Cities when Province changes
  useEffect(() => {
    if (watchProvince) {
      getApiCities(watchProvince).then(setCities).catch(console.error);
    } else {
      setCities([]);
    }
  }, [watchProvince]);

  // Fetch Subdistricts (Kecamatan) when City changes
  useEffect(() => {
    if (watchCity) {
      getApiSubdistricts(watchCity).then(setSubdistricts).catch(console.error);
    } else {
      setSubdistricts([]);
    }
  }, [watchCity]);

  const handleOpenAdd = () => {
    setEditingId(null);
    form.reset({
      label: "",
      receiver_name: "",
      phone_number: "",
      address: "",
      province_id: "",
      city_id: "",
      district_id: "",
      subdistrict_name: "",
      postal_code: "",
      is_default: addresses.length === 0,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (address: ApiAddress) => {
    setEditingId(address.id);
    form.reset({
      label: address.label || "",
      receiver_name: address.receiver_name,
      phone_number: address.phone_number,
      address: address.address,
      province_id: String(address.province_id),
      city_id: String(address.city_id),
      district_id: String(address.district_id || ""),
      subdistrict_name: address.subdistrict_name || "",
      postal_code: address.postal_code || "",
      is_default: address.is_default,
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (data: AddressFormValues) => {
    const user = getAuthUser();
    if (!user) {
      toast.error("Sesi telah habis, silakan login kembali.");
      return;
    }

    setIsSubmitting(true);
    const province_name = provinces.find((p) => String(p.province_id) === String(data.province_id))?.province || "";
    const city_name = cities.find((c) => String(c.city_id) === String(data.city_id))?.city_name || "";
    const district_name = subdistricts.find((s) => String(s.subdistrict_id) === String(data.district_id))?.subdistrict_name || "";
    const subdistrict_name = data.subdistrict_name; // Kelurahan manual

    const addressData = {
      user_id: user.id,
      label: data.label,
      receiver_name: data.receiver_name,
      phone_number: data.phone_number,
      address: data.address,
      province_id: Number(data.province_id),
      province_name,
      city_id: Number(data.city_id),
      city_name,
      district_id: Number(data.district_id) || null,
      district_name,
      subdistrict_id: null, // As backend doesn't provide kelurahan ID
      subdistrict_name,
      postal_code: data.postal_code || null,
      is_default: data.is_default,
    };

    try {
      if (editingId) {
        await updateUserAddress({ ...addressData, id: editingId });
        toast.success("Alamat berhasil diperbarui!");
      } else {
        await createUserAddress(addressData);
        toast.success("Alamat baru berhasil ditambahkan!");
      }
      await fetchAddresses();
      setIsFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan alamat");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (address: ApiAddress) => {
    try {
      await updateUserAddress({ ...address, is_default: true });
      toast.success("Alamat utama berhasil diubah");
      await fetchAddresses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengatur alamat utama");
    }
  };

  const confirmDeleteAddress = (address: ApiAddress) => {
    setAddressToDelete(address);
    setIsDeleteDialogOpen(true);
  };

  const executeDeleteAddress = async () => {
    if (!addressToDelete) return;
    
    const user = getAuthUser();
    if (!user) return;

    setIsDeleting(true);
    try {
      await deleteUserAddress(user.id, addressToDelete.id);
      toast.success("Alamat berhasil dihapus");
      await fetchAddresses();
      setIsDeleteDialogOpen(false);
      setAddressToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus alamat");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <section className="flex-1 pt-32 pb-20 container max-w-4xl space-y-6">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-40 w-full rounded-3xl" />
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="flex-1 pt-32 pb-20">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="space-y-1 animate-fade-in">
              <Link 
                to="/profile" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 story-link font-medium w-fit"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Profil
              </Link>
              <h1 className="font-display text-3xl md:text-4xl text-foreground">
                Alamat Pengiriman
              </h1>
              <p className="text-muted-foreground text-sm">
                Kelola alamat pengiriman untuk pesanan Anda.
              </p>
            </div>
            <Button
              onClick={handleOpenAdd}
              className="rounded-full gap-2 px-6 shadow-sm bg-foreground hover:bg-primary transition-colors h-11 text-sm tracking-wide uppercase animate-fade-in delay-75"
            >
              <Plus className="h-4 w-4" />
              Tambah Alamat
            </Button>
          </div>

          {/* List Addresses */}
          {addresses.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center p-12 text-center animate-fade-up">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Belum Ada Alamat</h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                Anda belum menambahkan alamat pengiriman. Tambahkan alamat sekarang untuk mempermudah proses checkout.
              </p>
              <Button onClick={handleOpenAdd} variant="outline" className="rounded-full">
                Tambah Alamat Baru
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address, idx) => (
                <div
                  key={address.id}
                  className={cn(
                    "glass-card p-6 md:p-8 flex flex-col sm:flex-row gap-6 justify-between transition-all duration-300 animate-fade-up",
                    address.is_default && "border-primary/30 ring-1 ring-primary/10 bg-primary/[0.02]"
                  )}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{address.receiver_name}</h3>
                      {address.label && (
                        <Badge variant="secondary" className="bg-secondary/50 hover:bg-secondary/50 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                          {address.label}
                        </Badge>
                      )}
                      {address.is_default && (
                        <Badge className="bg-primary hover:bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Alamat Utama
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{address.phone_number}</p>
                      <p className="leading-relaxed">
                        {address.address}
                        <br />
                        {address.subdistrict_name}, {address.district_name}
                        <br />
                        {address.city_name}, {address.province_name} {address.postal_code}
                      </p>
                    </div>
                  </div>

                  {/* Actions Desktop */}
                  <div className="hidden sm:flex flex-col items-end gap-3 justify-start shrink-0">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(address)}
                        className="rounded-full text-xs h-8"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Button>
                      {!address.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => confirmDeleteAddress(address)}
                          className="rounded-full text-xs h-8 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Hapus
                        </Button>
                      )}
                    </div>
                    {!address.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-xs h-8 text-primary hover:bg-primary/10"
                        onClick={() => handleSetDefault(address)}
                      >
                        Jadikan Utama
                      </Button>
                    )}
                  </div>

                  {/* Actions Mobile */}
                  <div className="sm:hidden absolute top-6 right-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        {!address.is_default && (
                          <DropdownMenuItem onClick={() => handleSetDefault(address)}>
                            <Home className="h-4 w-4 mr-2 text-primary" />
                            Jadikan Utama
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleOpenEdit(address)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Alamat
                        </DropdownMenuItem>
                        {!address.is_default && (
                          <DropdownMenuItem onClick={() => confirmDeleteAddress(address)} className="text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus Alamat
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────
          FORM DIALOG (ADD / EDIT)
      ──────────────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[600px] p-0 rounded-3xl border-border/50 max-h-[85vh] overflow-y-auto">
          <div className="p-5 md:p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {editingId ? "Edit Alamat" : "Tambah Alamat Baru"}
              </DialogTitle>
              <DialogDescription>
                Pastikan alamat terisi dengan lengkap dan benar untuk mempermudah pengiriman.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label Alamat</FormLabel>
                      <FormControl>
                        <Input placeholder="Cth: Rumah, Kantor, Rumah Nenek..." className="h-11 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="receiver_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Penerima</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="h-11 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="081234567890" className="h-11 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="province_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provinsi</FormLabel>
                        <Select onValueChange={(v) => { field.onChange(v); form.setValue("city_id", ""); form.setValue("district_id", ""); }} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Pilih Provinsi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {provinces.map((p) => (
                              <SelectItem key={p.province_id} value={String(p.province_id)}>{p.province}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kota/Kabupaten</FormLabel>
                        <Select onValueChange={(v) => { field.onChange(v); form.setValue("district_id", ""); }} value={field.value} disabled={!watchProvince}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Pilih Kota/Kabupaten" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities.map((c) => (
                              <SelectItem key={c.city_id} value={String(c.city_id)}>{c.city_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="district_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kecamatan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchCity}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Pilih Kecamatan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subdistricts.map((d) => (
                              <SelectItem key={d.subdistrict_id} value={String(d.subdistrict_id)}>{d.subdistrict_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subdistrict_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kelurahan</FormLabel>
                        <FormControl>
                          <Input placeholder="Cth: Kelurahan Kuta" className="h-11 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Pos</FormLabel>
                        <FormControl>
                          <Input placeholder="12345" className="h-11 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama jalan, gedung, no rumah..." className="h-11 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_default"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-xl bg-accent/20">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={editingId ? addresses.find(a => a.id === editingId)?.is_default : addresses.length === 0}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Jadikan sebagai alamat utama
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Alamat ini akan otomatis dipilih saat Anda melakukan checkout.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4 border-t border-border mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-full h-11"
                    disabled={isSubmitting}
                    onClick={() => setIsFormOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-full h-11 shadow-md">
                    {isSubmitting ? "Menyimpan..." : "Simpan Alamat"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>



      <Footer />
      <WhatsAppFloat />

      {/* ────────────────────────────────────────────────────────
          DELETE CONFIRMATION ALERT DIALOG
      ──────────────────────────────────────────────────────── */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => !isDeleting && setIsDeleteDialogOpen(open)}>
        <AlertDialogContent className="rounded-3xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Hapus Alamat?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Alamat "{addressToDelete?.label}" akan dihapus secara permanen dari akun Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl">Batal</AlertDialogCancel>
            <Button
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={executeDeleteAddress}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
