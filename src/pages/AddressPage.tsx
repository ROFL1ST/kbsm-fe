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

import {
  type UserAddress,
  DUMMY_PROVINCES,
  DUMMY_CITIES,
  DUMMY_DISTRICTS,
  DUMMY_SUBDISTRICTS,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/data/addressData";

/* ─── Zod Schema ─── */
const addressSchema = z.object({
  address_label: z.string().min(2, "Label alamat minimal 2 karakter (cth: Rumah, Kantor)"),
  receiver_name: z.string().min(2, "Nama penerima minimal 2 karakter"),
  phone_number: z.string().min(9, "Nomor telepon tidak valid"),
  address: z.string().min(10, "Alamat lengkap minimal 10 karakter"),
  province_id: z.string().min(1, "Pilih provinsi"),
  city_id: z.string().min(1, "Pilih kota/kabupaten"),
  district_id: z.string().min(1, "Pilih kecamatan"),
  subdistrict_id: z.string().min(1, "Pilih kelurahan"),
  postal_code: z.string().min(5, "Kode pos tidak valid"),
  is_default: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddressPage() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [mounted, setMounted] = useState(false);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  useEffect(() => {
    setAddresses(getAddresses());
    setMounted(true);
    document.title = "Daftar Alamat — Kasta Beauté";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address_label: "",
      receiver_name: "",
      phone_number: "",
      address: "",
      province_id: "",
      city_id: "",
      district_id: "",
      subdistrict_id: "",
      postal_code: "",
      is_default: false,
    },
  });

  const watchProvince = form.watch("province_id");
  const watchCity = form.watch("city_id");
  const watchDistrict = form.watch("district_id");
  const watchSubdistrict = form.watch("subdistrict_id");

  // Cascading dropdown logic
  const availableCities = watchProvince ? DUMMY_CITIES[Number(watchProvince)] || [] : [];
  const availableDistricts = watchCity ? DUMMY_DISTRICTS[Number(watchCity)] || [] : [];
  const availableSubdistricts = watchDistrict ? DUMMY_SUBDISTRICTS[Number(watchDistrict)] || [] : [];

  // Auto-fill postal code when subdistrict is selected
  useEffect(() => {
    if (watchSubdistrict) {
      const sub = availableSubdistricts.find((s) => s.id === Number(watchSubdistrict));
      if (sub) {
        form.setValue("postal_code", sub.zip);
      }
    }
  }, [watchSubdistrict, availableSubdistricts, form]);

  const handleOpenAdd = () => {
    setEditingId(null);
    form.reset({
      address_label: "",
      receiver_name: "",
      phone_number: "",
      address: "",
      province_id: "",
      city_id: "",
      district_id: "",
      subdistrict_id: "",
      postal_code: "",
      is_default: addresses.length === 0,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (address: UserAddress) => {
    setEditingId(address.id);
    form.reset({
      address_label: address.address_label || "",
      receiver_name: address.receiver_name,
      phone_number: address.phone_number,
      address: address.address,
      province_id: String(address.province_id),
      city_id: String(address.city_id),
      district_id: String(address.district_id),
      subdistrict_id: String(address.subdistrict_id),
      postal_code: address.postal_code,
      is_default: address.is_default,
    });
    setIsFormOpen(true);
  };

  const onSubmit = (data: AddressFormValues) => {
    const province_name = DUMMY_PROVINCES.find((p) => p.id === Number(data.province_id))?.name || "";
    const city_name = DUMMY_CITIES[Number(data.province_id)]?.find((c) => c.id === Number(data.city_id))?.name || "";
    const district_name = DUMMY_DISTRICTS[Number(data.city_id)]?.find((d) => d.id === Number(data.district_id))?.name || "";
    const subdistrict_name = DUMMY_SUBDISTRICTS[Number(data.district_id)]?.find((s) => s.id === Number(data.subdistrict_id))?.name || "";

    const addressData: Omit<UserAddress, "id"> = {
      user_id: "user-1",
      address_label: data.address_label,
      receiver_name: data.receiver_name,
      phone_number: data.phone_number,
      address: data.address,
      province_id: Number(data.province_id),
      province_name,
      city_id: Number(data.city_id),
      city_name,
      district_id: Number(data.district_id),
      district_name,
      subdistrict_id: Number(data.subdistrict_id),
      subdistrict_name,
      postal_code: data.postal_code,
      is_default: data.is_default,
    };

    if (editingId) {
      updateAddress(editingId, addressData);
      toast.success("Alamat berhasil diperbarui!");
    } else {
      addAddress(addressData);
      toast.success("Alamat baru berhasil ditambahkan!");
    }

    setAddresses(getAddresses());
    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (addressToDelete) {
      deleteAddress(addressToDelete);
      setAddresses(getAddresses());
      toast.success("Alamat berhasil dihapus");
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSetDefault = (id: number) => {
    setDefaultAddress(id);
    setAddresses(getAddresses());
    toast.success("Alamat utama berhasil diubah");
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
                      {address.address_label && (
                        <Badge variant="secondary" className="bg-secondary/50 hover:bg-secondary/50 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                          {address.address_label}
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
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setAddressToDelete(address.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {!address.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-xs h-8 text-primary hover:bg-primary/10"
                        onClick={() => handleSetDefault(address.id)}
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
                          <DropdownMenuItem onClick={() => handleSetDefault(address.id)}>
                            <Home className="h-4 w-4 mr-2 text-primary" />
                            Jadikan Utama
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleOpenEdit(address)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Alamat
                        </DropdownMenuItem>
                        {!address.is_default && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setAddressToDelete(address.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus Alamat
                            </DropdownMenuItem>
                          </>
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
        <DialogContent className="sm:max-w-[600px] p-0 rounded-3xl overflow-hidden border-border/50">
          <div className="p-6 md:p-8 space-y-6">
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
                  name="address_label"
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
                        <Select onValueChange={(v) => { field.onChange(v); form.setValue("city_id", ""); }} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Pilih Provinsi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DUMMY_PROVINCES.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
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
                            {availableCities.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
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
                        <Select onValueChange={(v) => { field.onChange(v); form.setValue("subdistrict_id", ""); }} value={field.value} disabled={!watchCity}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Pilih Kecamatan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableDistricts.map((d) => (
                              <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subdistrict_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kelurahan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchDistrict}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Pilih Kelurahan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableSubdistricts.map((s) => (
                              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
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
                    onClick={() => setIsFormOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="flex-1 rounded-full h-11 shadow-md">
                    Simpan Alamat
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ────────────────────────────────────────────────────────
          DELETE CONFIRMATION DIALOG
      ──────────────────────────────────────────────────────── */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Hapus Alamat?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus alamat ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Hapus Alamat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
