# LeadFlow — Öğrenme Notları

Bu dosya, proje üzerinde öğrendiklerimizi kısa ve sade şekilde hatırlamak için var. Yeni adımlarda güncellenecek.

## 1. Ne yapıyoruz?

Kampanyaları ve müşteri adaylarını takip eden bir uygulama hazırlıyoruz. Müşteri adayı, ürünle ilgilenen ama henüz satın almamış kişi demek.

Önce görünen ekranları (frontend) örnek verilerle yapacağız. Sonra verileri işleyen ve kaydeden tarafı (backend) hazırlayıp ikisini bağlayacağız. Amacımız her adımı anlayarak öğrenmek.

## 2. Şimdiye kadar yaptıklarımız

- Bilgisayardaki projenin GitHub adresini mevcut `Pasaselena/interra-lead-flow` deposuna bağladık. Yeni bir GitHub deposu açmadık.
- Frontend için `feature/frontend-setup` adlı çalışma dalına geçtik.
- Senin `LeadFlow FrontEnd` klasörüne React 18, TypeScript ve Vite başlangıç dosyalarını kurduk.
- React ekranları oluşturmamızı sağlar. TypeScript kodda bazı hataları erkenden yakalamaya yardımcı olur. Vite projeyi yerelde çalıştırır ve yayınlanabilecek dosyalara dönüştürür.
- Kurulumla gelen örnek ekranı sadeleştirdik. `App.tsx` içinde bir başlık ve açıklama gösteriyoruz.
- Kurulumdan sonra ve başlığı sadeleştirdiğimizde derleme kontrolü başarılı oldu. İlk kurulumda kod kontrolü de geçti.
- `README.md` dosyasına çalıştırma adımlarını, `.gitignore` dosyasına Git'in yok sayacağı dosyaları yazdık.

İlk kurulumdan sonra lead yönetimi ekranını ekledik: özet kartları, arama ve filtreler, tablo, yeni lead formu ve detay alanı hazır. Backend bağlantısı henüz yok; örnek kayıtlar kullanılıyor ve değişiklikler sayfa yenilendiğinde sıfırlanıyor.

## 3. Hangi dosya neden var?

Frontend klasörünün içindeki önemli dosyalar:

| Dosya / klasör | Görevi |
| --- | --- |
| `index.html` | Uygulamanın yerleştiği temel web sayfası. |
| `src/main.tsx` | React'i başlatır ve `App` bileşenini sayfaya bağlar. |
| `src/App.tsx` | Lead verisini, filtreleri ve ekran parçalarının bir araya gelişini yönetir. |
| `src/App.css` | Kartların, tablonun, formların ve mobil yerleşimin görünüm kuralları. |
| `src/index.css` | Uygulamanın genel yazı tipi, sayfa zemini ve satır aralığı. |
| `package.json` | Kullanılan paketleri ve çalıştırma komutlarını listeler. |
| `package-lock.json` | Kurulan paketlerin kesin sürümlerini kaydeder; GitHub'a eklenir. |
| `node_modules` | İndirilen hazır paketler; elle düzenlenmez ve GitHub'a eklenmez. |
| `src/assets`, `public` | Resim ve logo gibi dosyaların konulabildiği alanlar. |
| `dist` | Derleme sonucunda oluşur; elle düzenlenmez ve GitHub'a eklenmez. |

Proje ana klasöründe `README.md` kurulum rehberidir. `.gitignore`, Git'in yok sayacağı dosyaları belirtir. Gizli `.git` klasörü Git geçmişini ve dal bilgilerini tutar; elle düzenlemeyiz.

Uygulamanın açılış sırası: **index.html → main.tsx → App.tsx**.

## 4. İlk ekran kodumuz (önceki adım)

```tsx
import './App.css'

function App() {
  return (
    <main className="dashboard">
      <h1>Interra LeadFlow- genel bakış</h1>
      <p>Kampanyalarını ve müşteri adaylarını buradan takip edebilirsin.</p>
    </main>
  )
}

export default App
```

- `import './App.css'`: Görünüm dosyasını dahil eder.
- `function App()`: App adında bir ekran parçası oluşturur. React'te buna **bileşen** denir.
- `return (...)`: Bileşenin ekranda göstereceği yapıyı döndürür. Birden fazla satır için parantez kullandık.
- `<main>`: Sayfanın ana içerik alanıdır; başlık ve paragrafı birlikte kapsar.
- `<h1>`: Ana başlıktır.
- `<p>`: Açıklama paragrafıdır.
- `</p>` gibi `/` içeren etiketler ilgili alanı kapatır.
- `export default App`: Başka dosyaların bu bileşeni alıp kullanabilmesini sağlar. Bizde `main.tsx` kullanır.

Bu HTML'e benzeyen yazıma **JSX** denir. Şimdilik etiketlerin arasındaki metni değiştirerek ekrandaki yazıyı değiştirebiliriz. CSS ise renk, boyut ve boşlukları belirler.

## 5. Uygulamayı nasıl açıyoruz?

Terminal proje ana klasöründeyken:

```bash
cd "LeadFlow FrontEnd"
npm run dev
```

- `cd`: Başka klasöre geçer. Klasör adında boşluk olduğu için tırnak kullandık. Zaten frontend klasöründeysen bu adımı tekrarlama.
- `npm run dev`: Geliştirme uygulamasını başlatır. Terminalde çıkan adresi tarayıcıda aç; genellikle `http://localhost:5173/` olur.
- Uygulama çalışırken dosyayı kaydedince tarayıcıdaki görünüm genellikle otomatik güncellenir.
- Durdurmak için çalıştığı terminalde `Control + C` kullanılır.
- `pwd`: Terminalin hangi klasörde olduğunu gösterir.

**Karşılaştığımız hata:** Ana klasörde `npm run dev` çalıştırınca `ENOENT` ve “package.json bulunamadı” hatası aldık. Çünkü dosya frontend klasöründeydi. Çözüm, önce o klasöre geçmekti. Editörde bir dosyanın açık olması terminalin bulunduğu klasörü değiştirmez.

Frontend klasöründe `npm run build` kodun derlenmesini, `npm run lint` bazı kod sorunlarının kontrolünü sağlar. Bu kontroller ekranın her davranışını test etmiş olmaz.

## 6. Git ve GitHub: öğrendiğimiz ayrım

- **Git:** Bilgisayarındaki proje geçmişini tutar.
- **GitHub:** Bu geçmişi ve dosyaları çevrim içi paylaşabileceğin yerdir.
- **Dal (branch):** Ayrı bir değişiklik geçmişidir. Yeni bir klasör veya geçici dosya alanı oluşturmaz; aynı frontend klasöründe çalışırsın.
- **Commit:** Seçtiğin değişiklikleri yerel geçmişe kaydeder. Dosyayı normal kaydetmekle aynı şey değildir.
- **Push:** Yerel commit'leri GitHub'a gönderir.
- **Merge:** Bir daldaki değişiklikleri diğer dala birleştirir.

`main` kontrol edilmiş çalışmaların ana dalı, `feature/frontend-setup` ise şu an çalıştığımız daldır. Commit edilmemiş değişiklikler henüz bir dalın geçmişine kaydolmuş değildir; dal değiştirmeden önce durumlarını kontrol ederiz.

| Komut | Anlamı |
| --- | --- |
| `git status` | Bulunduğun dalı ve dosya değişikliklerini gösterir. |
| `git branch` | Dalları listeler; `*` mevcut dalı gösterir. |
| `git switch -c feature/frontend-setup` | Yeni dal açar ve ona geçer. Bizde bu dal zaten var; tekrar çalıştırmak gerekmez. |
| `git remote -v` | GitHub bağlantı adresini gösterir. |

Bağlantıyı düzeltirken kullandığımız komut:

```bash
git remote set-url origin https://github.com/Pasaselena/interra-lead-flow.git
```

`origin` uzak deponun kısa adıdır. Bu komut sadece adresi ayarlar; dosya yüklemez. Bağlantıyı tek başına terminale yapıştırmak komut çalıştırmaz.

## 7. İlk CSS adımı: renk ve boşluk

Kurulumdan kalan CSS kurallarını sadeleştirdik. Bu adımda üç uygulama dosyası değişti:

- `App.tsx`: Ana içerik etiketine `className="dashboard"` ekledik. Bu, CSS'in bu alanı seçebilmesi için verdiğimiz isimdir.
- `App.css`: Dashboard'un iç boşluğunu, başlık ve açıklamanın görünümünü yazdık.
- `index.css`: Sayfa zeminini açık gri, genel yazı tipini Arial yaptık; tarayıcının varsayılan dış boşluğunu kaldırdık.

```css
.dashboard {
  padding: 32px;
}

.dashboard h1 {
  margin: 0 0 12px;
  color: #007f89;
  font-size: 32px;
}
```

- `.dashboard`: `dashboard` sınıfı verilen alanı seçer. CSS'te sınıf adının başına nokta yazılır, `className` içinde nokta yazılmaz.
- `.dashboard h1`: Bu alanın içindeki `h1` başlığını seçer.
- `padding`: Alanın iç kenarı ile içeriği arasındaki boşluktur. `32px`, dört yöne 32 piksel boşluk verir.
- `margin`: Bir öğenin dışındaki boşluktur. `0 0 12px`, üstte 0, sağ ve solda 0, altta 12 piksel demektir.
- `color`: Yazı rengi. `#007f89`, açık zeminde daha okunaklı olması için seçtiğimiz koyu turkuazdır; roadmap'teki `#00ADBB` renginin daha koyu bir tonudur.
- `font-size`: Yazı boyutu. `px`, burada kullandığımız CSS piksel birimidir.
- `background-color`: Arka plan rengi.
- `font-family: Arial, sans-serif`: Arial yazı tipini, bulunamazsa tarayıcının tırnaksız yazı tipini kullanır.
- `line-height: 1.5`: Satır yüksekliğini yazı boyutunun 1,5 katı yapar.

CSS kuralları `seçici { özellik: değer; }` biçiminde yazılır. Bu derste temel CSS öğreniyoruz; henüz Tailwind kurulmadı.

**Deneme:** `App.css` içindeki `padding: 32px` değerini `48px` yapıp kaydet. İçeriğin kenarlardan uzaklaştığını gözlemle; sonra istersen 32'ye geri getir.

## 8. Lead ekranı: neyi nerede değiştireceğim?

Tüm yollar `LeadFlow FrontEnd` klasörüne göredir.

| İstenen değişiklik | Dosya | Bakılacak yer |
| --- | --- | --- |
| Sayfa başlığını veya açıklamasını değiştir | `src/App.tsx` | `page-header` alanı |
| Kart başlığını veya sayımını değiştir | `src/App.tsx` | `stats` dizisi |
| Arama ve filtreleme kuralını değiştir | `src/App.tsx` | `visibleLeads` |
| Tabloya sütun ekle | `src/components/LeadTable.tsx` | `thead` başlıkları ve `tbody` hücreleri |
| Yeni lead formuna alan ekle | `src/components/LeadForm.tsx` | `draft` başlangıcı ve form etiketleri |
| Detay ekranını değiştir | `src/components/LeadDetail.tsx` | Form alanları ve `submit` |
| Durum seçeneklerini değiştir | `src/data/leads.ts` | `statuses` dizisi; form ve filtreler bunu paylaşır |
| Örnek firmaları değiştir | `src/data/leads.ts` | `initialLeads` dizisi |
| Lead'e yeni veri alanı ekle | `src/data/leads.ts` | `Lead` tipi; ardından örnek kayıtlar ve form |
| Kart boşluğunu veya mobil görünümü değiştir | `src/App.css` | `.stats`, `.panel`, `@media` |
| Genel yazı tipi veya düğme rengini değiştir | `src/index.css` | `:root` veya `button` |

`main.tsx` uygulamayı başlatmaya devam ediyor. Ekran geliştirirken genellikle orayı değiştirmeyeceğiz.

## 9. Yeni kavramlar: state, props ve olaylar

- **State:** Ekranın hafızası. `useState` ile oluşturulur. `leads`, mevcut kayıtları tutar; `setLeads` yeni listeyi verir ve React ekranı günceller.
- **Props:** Üst bileşenden alt bileşene gönderilen bilgiler. `LeadTable` içindeki `leads` prop'u, App'in filtrelediği listedir.
- **Olay:** Kullanıcının tıklaması veya yazması. `onClick` tıklamayı, `onChange` alan değişimini, `onSubmit` form gönderimini karşılar.
- **Type:** Verinin yapısı. `Lead`, her kaydın alanlarını tanımlar. `LeadDraft`, henüz id verilmemiş kayıttır.
- **filter:** Koşula uyan kayıtları seçer; asıl listeyi değiştirmez.
- **map:** Her elemandan yeni bir sonuç üretir. Listeyi ekranda göstermek ve tek bir kaydı güncellemek için kullandık.

### Yeni lead kaydettiğinde ne olur?

1. `LeadForm.tsx` içinde yazdığın değerler `draft` state'ine gider.
2. Kaydet düğmesi formun `submit` fonksiyonunu çalıştırır. `preventDefault()`, tarayıcının sayfayı yenilemesini engeller.
3. Form, `onSave(draft)` ile bilgiyi App'e iletir. App bu prop'a `addLead` fonksiyonunu vermiştir.
4. `App.tsx` içindeki `addLead`, benzersiz id ekler ve `setLeads` ile yeni listeyi kaydeder.
5. React ekranı tekrar oluşturur. Tablo ve kartlar yeni listeyi gösterir.

Bu yüzden verinin ortak sahibi App'tir. Tablo ve kartlar ayrı ayrı kayıt tutarsa birbirinden kopabilirler.

### Detay ve takip mantığı

Firma adına veya satıra tıklanınca App'teki `selectedId` değişir, ilgili `LeadDetail` gösterilir. Firma düğmesi klavyeyle de açılabilir. Durum, tarih ve not düzenlemeleri Kaydet ile uygulanır; Kapat kaydetmeden kapatır.

Takip bekleyen kartı, takip tarihi bugün veya daha eski olan açık kayıtları sayar. Kazanıldı ve Kaybedildi durumları takip hesabına girmez. Tarihsiz kayıtlar sayılmaz. Arama filtreleri yalnızca tabloyu etkiler; kartlar tüm kayıtların özetidir.

## 10. Kendin deneyerek kontrol et

Frontend klasöründe `npm run dev` çalıştırıp terminalin verdiği adresi aç.

1. Firma veya kişi adı ara; durum ve sorumlu filtrelerini birlikte dene. Temizle ile tüm kayıtları geri getir.
2. Yeni Lead ile firma ve kişi alanlarını doldurup kaydet. Tabloya ve toplam karta eklendiğini gör.
3. Firma adına bas; durumu Kazanıldı yapıp kaydet. Kazanılanlar kartını kontrol et.
4. Açık bir kaydın takip tarihini dün yap: geciken sayısının artmasını kontrol et.
5. Sonuç vermeyen bir arama yap; boş liste açıklamasını gör.
6. Pencereyi daralt; kartlar iki sütuna, form tek sütuna geçer. Tablo kendi alanında yatay kayar.
7. Sayfayı yenile: örnek verilere dönmesi bu sürümde beklenen davranıştır.

Derleme ve lint kontrolü tarayıcıdaki bu denemelerin yerine geçmez.

## 11. İlk küçük alıştırman

`App.tsx` içindeki “Lead Yönetimi” metnini “Müşteri Adaylarım” yap ve kaydet. Ardından `App.css` içindeki `.page-header h1` kuralının `font-size` değerini değiştir. İlk dosya **ne gösterildiğini**, ikinci dosya **nasıl göründüğünü** belirler.

Sonraki derste `useState` ve `addLead` fonksiyonunu bu çalışan ekran üzerinden satır satır inceleyebiliriz.

## 12. Interra renklerini tek yerden yönetmek

`src/index.css` içindeki `:root` alanına CSS değişkenleri ekledik. Proje notlarındaki ana renk `#00ADBB`; koyu turkuaz ve nötr renkler okunabilir bir arayüz oluşturmak için seçildi.

```css
--color-brand: #00adbb;
--color-brand-dark: #00717a;
--color-brand-soft: #e5f7f8;
```

`var(--color-brand)`, “bu değişkenin rengini kullan” demektir. Ana düğmeler, kartların üst çizgisi ve detay kenarlığı bu rengi kullanır. Parlak turkuaz düğmelerde okunabilirlik için koyu yazı; beyaz zemindeki turkuaz metinlerde koyu ton kullanılır.

Renk değiştirmek için bileşenlerin `.tsx` dosyalarına gitmene gerek yok. `index.css` içindeki değişkeni değiştirmen yeterli; `App.css` bu değişkenleri kullanır. `--color-danger`, geciken takiplerin uyarı rengidir.
