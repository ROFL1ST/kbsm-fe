import blogSkincareRoutine from "@/assets/blog-skincare-routine.jpg";
import blogIngredients from "@/assets/blog-ingredients.jpg";
import blogGlowTutorial from "@/assets/blog-glow-tutorial.jpg";
import blogSpfGuide from "@/assets/blog-spf-guide.jpg";
import blogAntiAging from "@/assets/blog-anti-aging.jpg";
import blogSensitiveSkin from "@/assets/blog-sensitive-skin.jpg";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

export type BlogCategory =
  | "Skincare Tips"
  | "Ingredients"
  | "Lifestyle"
  | "Tutorial";

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: BlogCategory;
  author: string;
  authorAvatar: string;
  authorBio: string;
  date: string;
  readTime: number; // in minutes
  tags: string[];
  featured?: boolean;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Skincare Tips",
  "Ingredients",
  "Lifestyle",
  "Tutorial",
];

export const POSTS_PER_PAGE = 6;

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "morning-skincare-routine-untuk-kulit-glowing",
    title: "Morning Skincare Routine untuk Kulit Glowing Sepanjang Hari",
    excerpt:
      "Temukan urutan perawatan pagi hari yang tepat untuk mendapatkan kulit cerah, sehat, dan glowing dari pagi hingga malam. 5 langkah sederhana yang terbukti efektif.",
    content: `
      <p>Memiliki kulit glowing bukan sekadar impian — dengan rutinitas pagi yang tepat, siapapun bisa mendapatkannya. Kunci utamanya adalah konsistensi dan urutan pengaplikasian produk yang benar.</p>

      <h2>Mengapa Rutinitas Pagi Itu Penting?</h2>
      <p>Di malam hari, kulit beregenerasi dan memperbaiki dirinya sendiri. Di pagi hari, tugas kita adalah melindungi hasil kerja keras kulit tersebut dari paparan sinar UV, polusi, dan stres oksidatif.</p>

      <h2>5 Langkah Morning Skincare Routine</h2>
      
      <h3>1. Double Cleanse (Opsional di Pagi)</h3>
      <p>Jika kamu memakai skincare malam atau berkeringat saat tidur, bersihkan wajah dengan gentle cleanser. Gunakan air hangat suam-suam kuku — air terlalu panas akan merusak skin barrier.</p>

      <h3>2. Toner/Essence</h3>
      <p>Toner membantu menyeimbangkan pH kulit dan mempersiapkannya menyerap produk selanjutnya. Pilih yang mengandung hyaluronic acid atau niacinamide untuk tambahan hidrasi.</p>

      <h3>3. Serum Vitamin C</h3>
      <p>Ini adalah game-changer di pagi hari! Vitamin C adalah antioksidan kuat yang melindungi kulit dari radikal bebas, mencerahkan, dan membantu produksi kolagen. Aplikasikan setelah toner.</p>

      <h3>4. Moisturizer</h3>
      <p>Kunci mengunci semua kebaikan yang sudah kamu aplikasikan. Pilih moisturizer sesuai jenis kulitmu — gel untuk kulit berminyak, krim untuk kulit kering.</p>

      <h3>5. Sunscreen — Wajib!</h3>
      <p>Ini adalah langkah yang TIDAK BOLEH dilewatkan. Gunakan SPF minimal 30, lebih baik SPF 50+. Sunscreen adalah anti-aging terbaik yang ada.</p>

      <h2>Tips Tambahan</h2>
      <p>Tunggu 1-2 menit setelah setiap produk agar terserap sempurna. Jangan lupa area leher dan tangan juga membutuhkan perawatan yang sama!</p>
    `,
    image: blogSkincareRoutine,
    category: "Skincare Tips",
    author: "Dr. Amelia Sari",
    authorAvatar: testimonial1,
    authorBio: "Dermatologis bersertifikat dengan 10+ tahun pengalaman di bidang kecantikan kulit.",
    date: "2026-04-20",
    readTime: 5,
    tags: ["Morning Routine", "Skincare", "Vitamin C", "SPF", "Glowing Skin"],
    featured: true,
  },
  {
    id: 2,
    slug: "bahan-alami-terbaik-untuk-skincare",
    title: "10 Bahan Alami Terbaik dalam Skincare yang Terbukti Efektif",
    excerpt:
      "Dari rose hip oil hingga niacinamide — kenali bahan-bahan aktif alami yang benar-benar memberikan hasil nyata untuk kulitmu.",
    content: `
      <p>Dunia skincare penuh dengan klaim-klaim yang bombastis. Tapi ada beberapa bahan aktif yang sudah terbukti secara ilmiah memberikan manfaat nyata bagi kulit.</p>

      <h2>Bahan-Bahan yang Wajib Kamu Tahu</h2>

      <h3>1. Hyaluronic Acid</h3>
      <p>Molekul ajaib yang mampu menahan 1000x beratnya dalam air. Memberikan hidrasi mendalam yang membuat kulit terlihat plumpy dan kenyal.</p>

      <h3>2. Niacinamide (Vitamin B3)</h3>
      <p>All-rounder terbaik! Mencerahkan, mengecilkan pori, mengontrol minyak, dan memperkuat skin barrier. Cocok untuk semua jenis kulit.</p>

      <h3>3. Retinol</h3>
      <p>Gold standard anti-aging. Mempercepat regenerasi sel, mengurangi kerutan, dan mencerahkan kulit. Gunakan di malam hari dan selalu diikuti sunscreen di pagi hari.</p>

      <h3>4. Rose Hip Oil</h3>
      <p>Kaya vitamin C alami dan asam lemak esensial. Membantu memudarkan bekas luka, mencerahkan, dan menutrisi kulit secara intensif.</p>

      <h3>5. Centella Asiatica (Cica)</h3>
      <p>Bahan herbal yang menenangkan peradangan, mempercepat penyembuhan, dan memperkuat skin barrier. Sangat cocok untuk kulit sensitif dan berjerawat.</p>
    `,
    image: blogIngredients,
    category: "Ingredients",
    author: "Rara Kinasih",
    authorAvatar: testimonial2,
    authorBio: "Beauty formulator dan skincare enthusiast yang fokus pada bahan-bahan alami berkualitas.",
    date: "2026-04-15",
    readTime: 7,
    tags: ["Ingredients", "Natural Skincare", "Hyaluronic Acid", "Niacinamide", "Retinol"],
    featured: true,
  },
  {
    id: 3,
    slug: "cara-mendapatkan-glass-skin",
    title: "Cara Mendapatkan Glass Skin: Tutorial Lengkap Step-by-Step",
    excerpt:
      "Glass skin — kulit yang sangat halus, cerah, dan seolah-olah bercahaya dari dalam. Ini bukan sekadar tren, ini adalah pencapaian skincare tertinggi.",
    content: `
      <p>Glass skin adalah kondisi kulit yang sangat terhidrasi, bebas pori-pori besar, dan memancarkan cahaya alami. Asal tren ini dari K-beauty, namun siapapun bisa mencapainya.</p>

      <h2>Apa itu Glass Skin?</h2>
      <p>Bayangkan kulit yang seperti kaca — reflektif, halus, dan transparan. Ini bukan tentang makeup, melainkan kondisi kulit itu sendiri yang sangat sehat dan terhidrasi.</p>

      <h2>Langkah Mencapai Glass Skin</h2>

      <h3>Step 1: Double Cleanse</h3>
      <p>Bersihkan wajah dengan oil cleanser terlebih dahulu untuk melarutkan makeup dan sunscreen, dilanjutkan gentle foam cleanser untuk membersihkan secara menyeluruh.</p>

      <h3>Step 2: Exfoliate (2-3x Seminggu)</h3>
      <p>Eksfoliasi membuang sel kulit mati yang membuat kulit tampak kusam. Gunakan chemical exfoliant (AHA/BHA) untuk hasil yang lebih merata dan aman.</p>

      <h3>Step 3: Toner Layering</h3>
      <p>Teknik "7 Skin Method" — aplikasikan toner ringan dalam beberapa lapisan tipis untuk memberikan hidrasi mendalam.</p>

      <h3>Step 4: Essence + Serum</h3>
      <p>Essence mempersiapkan kulit, serum memberikan konsentrasi bahan aktif yang tinggi. Pilih yang mengandung hyaluronic acid, galactomyces, atau snail mucin.</p>

      <h3>Step 5: Sheet Mask</h3>
      <p>Gunakan 2-3x seminggu untuk boost hidrasi ekstra. Biarkan 15-20 menit, jangan dibilas.</p>
    `,
    image: blogGlowTutorial,
    category: "Tutorial",
    author: "Dr. Amelia Sari",
    authorAvatar: testimonial1,
    authorBio: "Dermatologis bersertifikat dengan 10+ tahun pengalaman di bidang kecantikan kulit.",
    date: "2026-04-10",
    readTime: 8,
    tags: ["Glass Skin", "K-Beauty", "Tutorial", "Hydration", "Glow"],
  },
  {
    id: 4,
    slug: "panduan-lengkap-sunscreen-untuk-pemula",
    title: "Panduan Lengkap Sunscreen untuk Pemula: Semua yang Perlu Kamu Tahu",
    excerpt:
      "SPF, PA+++, mineral vs chemical — semua istilah sunscreen yang membingungkan dijelaskan dalam bahasa yang mudah dipahami. Plus rekomendasi terbaik!",
    content: `
      <p>Sunscreen adalah investasi terbaik untuk kulit jangka panjang. 80% tanda penuaan dini disebabkan oleh paparan sinar UV — bukan usia!</p>

      <h2>Memahami SPF dan PA</h2>
      
      <h3>SPF (Sun Protection Factor)</h3>
      <p>SPF mengukur perlindungan terhadap UVB — sinar yang menyebabkan kulit terbakar dan kanker kulit. SPF 30 memblokir 97% UVB, SPF 50 memblokir 98%.</p>

      <h3>PA (Protection Grade of UVA)</h3>
      <p>PA mengukur perlindungan terhadap UVA — sinar yang menembus lebih dalam dan menyebabkan penuaan. Semakin banyak tanda +, semakin tinggi perlindungannya.</p>

      <h2>Mineral vs Chemical Sunscreen</h2>
      
      <h3>Mineral Sunscreen</h3>
      <p>Mengandung zinc oxide atau titanium dioxide. Bekerja dengan cara memantulkan sinar UV. Lebih aman untuk kulit sensitif, tapi bisa meninggalkan white cast.</p>

      <h3>Chemical Sunscreen</h3>
      <p>Menyerap sinar UV dan mengubahnya menjadi panas. Lebih ringan dan tidak meninggalkan white cast, tapi perlu waktu 15-20 menit sebelum efektif.</p>

      <h2>Tips Penggunaan yang Benar</h2>
      <p>Gunakan 1/4 sendok teh untuk wajah dan leher. Aplikasikan 15-20 menit sebelum keluar. Reapply setiap 2 jam atau setelah berkeringat.</p>
    `,
    image: blogSpfGuide,
    category: "Skincare Tips",
    author: "Rara Kinasih",
    authorAvatar: testimonial2,
    authorBio: "Beauty formulator dan skincare enthusiast yang fokus pada bahan-bahan alami berkualitas.",
    date: "2026-04-05",
    readTime: 6,
    tags: ["Sunscreen", "SPF", "UV Protection", "Anti-Aging", "Daily Skincare"],
  },
  {
    id: 5,
    slug: "rahasia-kulit-awet-muda-di-usia-30an",
    title: "Rahasia Kulit Awet Muda di Usia 30-an: Anti-Aging yang Benar",
    excerpt:
      "Mulai dari usia 25, kolagen kita berkurang 1% setiap tahun. Inilah strategi perawatan anti-aging yang proven secara ilmiah untuk menjaga kulit tetap muda.",
    content: `
      <p>Penuaan adalah proses alami yang tidak bisa dihindari — tapi bisa diperlambat! Kuncinya adalah memulai perawatan anti-aging sedini mungkin.</p>

      <h2>Memahami Proses Penuaan Kulit</h2>
      <p>Penuaan kulit dibagi dua: intrinsik (genetik, tidak bisa diubah) dan ekstrinsik (lingkungan, bisa dikendalikan). 80% penuaan terlihat adalah ekstrinsik.</p>

      <h2>Bahan Anti-Aging yang Terbukti</h2>

      <h3>Retinoids (Vitamin A)</h3>
      <p>Gold standard anti-aging. Meningkatkan produksi kolagen, mempercepat pergantian sel, dan mengurangi hiperpigmentasi. Mulai dari konsentrasi rendah (0.025% retinol) dan tingkatkan perlahan.</p>

      <h3>Peptides</h3>
      <p>Sinyal protein yang memberitahu kulit untuk memproduksi lebih banyak kolagen. Lebih lembut dari retinol, cocok untuk kulit sensitif.</p>

      <h3>Antioxidants</h3>
      <p>Vitamin C, E, dan resveratrol melindungi kulit dari kerusakan radikal bebas yang mempercepat penuaan.</p>

      <h2>Lifestyle Factors</h2>
      <p>Tidur cukup (7-9 jam), minum air yang cukup, konsumsi antioksidan dari makanan, kelola stres, dan tentu saja — sunscreen setiap hari!</p>
    `,
    image: blogAntiAging,
    category: "Skincare Tips",
    author: "Dr. Amelia Sari",
    authorAvatar: testimonial1,
    authorBio: "Dermatologis bersertifikat dengan 10+ tahun pengalaman di bidang kecantikan kulit.",
    date: "2026-03-28",
    readTime: 9,
    tags: ["Anti-Aging", "Retinol", "Collagen", "Mature Skin", "Peptides"],
  },
  {
    id: 6,
    slug: "skincare-untuk-kulit-sensitif",
    title: "Skincare untuk Kulit Sensitif: Panduan Memilih Produk yang Aman",
    excerpt:
      "Kulit sensitif mudah iritasi, kemerahan, dan bereaksi terhadap bahan tertentu. Pelajari cara merawat dan memilih produk yang tepat agar kulit tetap sehat.",
    content: `
      <p>Kulit sensitif adalah kondisi yang lebih umum dari yang kamu kira. Sekitar 50% orang memiliki kulit yang reaktif terhadap setidaknya beberapa jenis produk.</p>

      <h2>Ciri-Ciri Kulit Sensitif</h2>
      <p>Mudah kemerahan, rasa gatal atau perih setelah penggunaan produk, kulit terasa kencang, reaksi terhadap perubahan cuaca atau suhu.</p>

      <h2>Bahan yang Harus Dihindari</h2>
      <ul>
        <li>Fragrance (parfum sintetis)</li>
        <li>Alcohol denat (alkohol keras)</li>
        <li>Essential oils dalam konsentrasi tinggi</li>
        <li>Exfoliant fisik yang kasar</li>
        <li>Sulfates (SLS, SLES)</li>
      </ul>

      <h2>Bahan yang Direkomendasikan</h2>

      <h3>Centella Asiatica</h3>
      <p>Menenangkan peradangan dan memperkuat skin barrier. Aman untuk kulit sensitif bahkan yang sedang iritasi.</p>

      <h3>Ceramides</h3>
      <p>Lipid alami yang memperbaiki dan memperkuat skin barrier yang rusak.</p>

      <h3>Aloe Vera</h3>
      <p>Menenangkan, menghidrasi, dan anti-inflamasi. Salah satu bahan paling aman untuk kulit sensitif.</p>

      <h2>Tips Patch Test</h2>
      <p>Selalu lakukan patch test sebelum mencoba produk baru! Oleskan sedikit di area belakang telinga atau lengan bawah, tunggu 24-48 jam.</p>
    `,
    image: blogSensitiveSkin,
    category: "Skincare Tips",
    author: "Putri Wulandari",
    authorAvatar: testimonial3,
    authorBio: "Beauty writer dan skincare consultant dengan spesialisasi kulit sensitif dan bermasalah.",
    date: "2026-03-20",
    readTime: 6,
    tags: ["Sensitive Skin", "Skincare", "Ceramides", "Cica", "Fragrance-Free"],
  },
  {
    id: 7,
    slug: "manfaat-niacinamide-untuk-semua-jenis-kulit",
    title: "Niacinamide: Bahan Ajaib yang Cocok untuk Semua Jenis Kulit",
    excerpt:
      "Niacinamide atau Vitamin B3 adalah bahan aktif yang paling serbaguna dalam dunia skincare. Temukan semua manfaatnya dan cara penggunaannya yang tepat.",
    content: `
      <p>Jika ada satu bahan skincare yang bisa kamu tambahkan ke rutinitas apapun, itu adalah niacinamide. Bahan ini memiliki manfaat yang luar biasa luas dan sangat well-tolerated.</p>

      <h2>Apa itu Niacinamide?</h2>
      <p>Niacinamide adalah bentuk aktif dari Vitamin B3. Berbeda dengan niacin biasa, niacinamide tidak menyebabkan flushing (kemerahan) pada kulit.</p>

      <h2>Manfaat Niacinamide</h2>

      <h3>Mengontrol Produksi Minyak</h3>
      <p>Niacinamide 2-4% terbukti mengurangi produksi sebum, membuat kulit berminyak lebih matte dan terkontrol.</p>

      <h3>Mencerahkan dan Meratakan Warna Kulit</h3>
      <p>Menghambat transfer melanin ke permukaan kulit, memudarkan dark spots dan hiperpigmentasi secara bertahap.</p>

      <h3>Mengecilkan Tampilan Pori</h3>
      <p>Dengan mengontrol minyak dan memperkuat skin barrier, pori-pori tampak lebih kecil dan kulit lebih halus.</p>

      <h3>Memperkuat Skin Barrier</h3>
      <p>Meningkatkan produksi ceramide dan protein pelindung lainnya, membuat skin barrier lebih kuat dan resilient.</p>

      <h2>Cara Menggunakan</h2>
      <p>Gunakan konsentrasi 2-5% untuk pemula, bisa ditingkatkan hingga 10% untuk kulit yang sudah terbiasa. Aplikasikan setelah toner, sebelum moisturizer.</p>
    `,
    image: blogIngredients,
    category: "Ingredients",
    author: "Rara Kinasih",
    authorAvatar: testimonial2,
    authorBio: "Beauty formulator dan skincare enthusiast yang fokus pada bahan-bahan alami berkualitas.",
    date: "2026-03-15",
    readTime: 5,
    tags: ["Niacinamide", "Vitamin B3", "Ingredients", "Pores", "Brightening"],
  },
  {
    id: 8,
    slug: "self-care-ritual-untuk-kesehatan-kulit",
    title: "Self-Care Ritual: Hubungan antara Gaya Hidup dan Kesehatan Kulit",
    excerpt:
      "Skincare bukan hanya tentang produk yang kamu oleskan — pola tidur, stres, dan nutrisi memainkan peran besar dalam kesehatan kulitmu.",
    content: `
      <p>Kulit adalah cermin dari kesehatan tubuh secara keseluruhan. Tidak ada serum atau krim yang bisa mengimbangi gaya hidup yang tidak sehat.</p>

      <h2>Tidur: The Original Anti-Aging Treatment</h2>
      <p>Saat tidur, tubuh memproduksi growth hormone yang memicu perbaikan dan regenerasi sel. Kurang tidur meningkatkan kortisol yang merusak kolagen dan memperburuk kondisi kulit.</p>

      <h2>Nutrisi untuk Kulit</h2>

      <h3>Antioksidan dari Makanan</h3>
      <p>Berry, dark chocolate, green tea, dan sayuran berwarna cerah kaya antioksidan yang melawan kerusakan radikal bebas dari dalam.</p>

      <h3>Omega-3 Fatty Acids</h3>
      <p>Salmon, sarden, walnuts, dan biji chia membantu menjaga skin barrier dan mengurangi peradangan.</p>

      <h3>Vitamin C dari Makanan</h3>
      <p>Jeruk, kiwi, paprika merah — mendukung produksi kolagen dari dalam tubuh.</p>

      <h2>Manajemen Stres</h2>
      <p>Stres kronis meningkatkan kortisol yang memicu produksi minyak berlebih, melemahkan skin barrier, dan memperlambat penyembuhan luka. Meditasi, yoga, dan olahraga rutin sangat membantu.</p>

      <h2>Hidrasi</h2>
      <p>Minum 8 gelas air sehari membantu menjaga kelembapan kulit dari dalam. Kombinasikan dengan moisturizer untuk hasil optimal.</p>
    `,
    image: blogSkincareRoutine,
    category: "Lifestyle",
    author: "Putri Wulandari",
    authorAvatar: testimonial3,
    authorBio: "Beauty writer dan skincare consultant dengan spesialisasi kulit sensitif dan bermasalah.",
    date: "2026-03-08",
    readTime: 7,
    tags: ["Self-Care", "Lifestyle", "Nutrition", "Sleep", "Wellness"],
  },
  {
    id: 9,
    slug: "tutorial-perawatan-kulit-malam-hari",
    title: "Tutorial Perawatan Kulit Malam Hari: Maksimalkan Waktu Tidurmu",
    excerpt:
      "Malam hari adalah waktu emas untuk kulit beregenerasi. Pelajari rutinitas malam yang tepat untuk bangun dengan kulit lebih cerah dan segar setiap hari.",
    content: `
      <p>Saat kamu tidur, kulitmu bekerja keras untuk memperbaiki dirinya. Dengan rutinitas malam yang tepat, kamu bisa memaksimalkan proses regenerasi alami ini.</p>

      <h2>Mengapa Malam Hari Istimewa untuk Skincare?</h2>
      <p>Di malam hari, kulit lebih permeabel — menyerap produk hingga 2x lebih baik dibanding siang hari. Tidak ada paparan UV, sehingga bahan seperti retinol dan AHA lebih aman digunakan.</p>

      <h2>Night Skincare Routine Step-by-Step</h2>

      <h3>Step 1: Oil Cleanser / Balm</h3>
      <p>Larutkan makeup, sunscreen, dan kotoran dengan oil cleanser. Pijat lembut selama 60 detik, bilas dengan air hangat.</p>

      <h3>Step 2: Water-Based Cleanser</h3>
      <p>Second cleanse untuk membersihkan sisa kotoran dan minyak yang tidak terangkat oleh oil cleanser.</p>

      <h3>Step 3: Exfoliant (2-3x Seminggu)</h3>
      <p>AHA (glycolic/lactic acid) untuk eksfoliasi permukaan, BHA (salicylic acid) untuk membersihkan pori. Jangan gunakan bersamaan dengan retinol.</p>

      <h3>Step 4: Toner/Essence</h3>
      <p>Seimbangkan pH dan berikan hidrasi pertama.</p>

      <h3>Step 5: Treatment Serum</h3>
      <p>Ini adalah waktu untuk retinol, bakuchiol, atau peptide serum. Aplikasikan di kulit yang masih sedikit lembap.</p>

      <h3>Step 6: Eye Cream</h3>
      <p>Area mata memiliki kulit yang paling tipis dan membutuhkan perawatan khusus.</p>

      <h3>Step 7: Moisturizer / Sleeping Mask</h3>
      <p>Kunci semua produk sebelumnya dengan moisturizer kaya atau sleeping mask 2-3x seminggu untuk hidrasi ekstra.</p>
    `,
    image: blogGlowTutorial,
    category: "Tutorial",
    author: "Dr. Amelia Sari",
    authorAvatar: testimonial1,
    authorBio: "Dermatologis bersertifikat dengan 10+ tahun pengalaman di bidang kecantikan kulit.",
    date: "2026-03-01",
    readTime: 8,
    tags: ["Night Routine", "Tutorial", "Retinol", "Double Cleanse", "Sleeping Mask"],
  },
];

export const getPostBySlug = (slug: string): BlogPost | undefined =>
  blogPosts.find((p) => p.slug === slug);

export const getRelatedPosts = (
  currentPost: BlogPost,
  limit = 3
): BlogPost[] =>
  blogPosts
    .filter((p) => p.id !== currentPost.id && p.category === currentPost.category)
    .slice(0, limit);

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
