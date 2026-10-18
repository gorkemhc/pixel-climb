<div align="center">

# Pixel Climb

### Ultimate Arcade Remaster

Yukarı tırman, platformlara tutun ve yeni rekorunu kır. Pixel Climb; Canvas 2D üzerinde çalışan, piksel sanatından ilham alan bağımsız bir arcade platform oyunudur.

<p>
  <a href="https://gorkemhc.github.io/pixel-climb/">
    <img src="https://img.shields.io/badge/Canl%C4%B1%20Demo-Pixel%20Climb-111827?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Pixel Climb canlı demo">
  </a>
  <a href="https://github.com/gorkemhc/pixel-climb">
    <img src="https://img.shields.io/badge/GitHub-Kaynak%20Kod-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub kaynak kodu">
  </a>
</p>

</div>

---

## Canlı Demo

Oyunu tarayıcıda açın: **[Pixel Climb’i Oyna](https://gorkemhc.github.io/pixel-climb/)**. Bu adres, `gorkemhc/pixel-climb` deposu yayımlanıp ilk Pages dağıtımı tamamlandığında kullanılabilir olur.

GitHub Pages dağıtımı `main` dalına yapılan her güncellemede `.github/workflows/pages.yml` ile yayınlanır. İlk dağıtımın tamamlanması birkaç dakika sürebilir.

## Oyun Hakkında

Pixel Climb, oyuncunun hareketli ve farklı özelliklere sahip platformlar arasında yükseldiği dikey bir arcade oyunudur. Oyun alanı 16:9 masaüstü görünümünde ve dar ekranlar için portre düzeninde ölçeklenir. Skor, yükseklik ve harcanabilir altın birbirinden ayrı tutulur.

### Öne çıkanlar

- İvme, sürtünme, zıplama ve çift zıplama içeren Canvas tabanlı oynanış
- Hareketli, kırılabilir, buzlu, yaylı ve tehlikeli platformlar; düşmanlar ve güçlendirmeler
- Kodla çizilen piksel sanat karakteri, platformlar, simgeler ve katmanlı doğal arka plan
- Klavye ve dokunmatik kontroller, duraklatma ve isteğe bağlı tam ekran
- Kalıcı altın bakiyesi, kozmetik mağazası, skor ve yükseklik rekorları
- Web Audio ile üretilen müzik ve efektler; bağımsız ses kontrolleri
- Onaylı tam sıfırlama seçeneği ve ayrı rekor sıfırlama işlemi
- Harici oyun görseli, ses dosyası, font veya çalışma zamanı kütüphanesi gerektirmez

## Kontroller

| Eylem | Kontrol |
| --- | --- |
| Hareket | `A` / `D` veya `←` / `→` |
| Zıplama ve çift zıplama | `W`, `↑` veya `Space` |
| Duraklat / devam et | `P`, `Esc` veya ekrandaki duraklat düğmesi |
| Mobil hareket | Ekrandaki yön düğmelerine basılı tutun |

## Yerel Çalıştırma

Proje modül içermeyen statik HTML, CSS ve JavaScript dosyalarından oluşur. En güvenilir yerel kullanım için proje klasöründe bir HTTP sunucusu başlatın:

```bash
python -m http.server 8000
```

Sonra `http://localhost:8000` adresini açın. Alternatif olarak `index.html` dosyasını doğrudan açabilirsiniz; tarayıcı güvenlik ayarları bazı özellikleri sınırlayabilir.

Otomatik temel kontrolleri çalıştırmak için Node.js ile:

```bash
node tests/smoke-test.js
```

## Kayıtlar ve Mağaza

Oyun ilerlemesi ve ayarlar tarayıcının `localStorage` alanında saklanır. Koşu sırasında toplanan altınlar koşu sona erdiğinde bir kez bakiyeye eklenir; mağaza alışverişleri bu bakiyeden düşer. Sahip olunan kozmetikler ayrıca kuşanılır. “Oyunu Tamamen Sıfırla” onaylandıktan sonra Pixel Climb’e ait kayıtlar temizlenir. Tarayıcı depolamayı engellerse oyun o oturumda çalışır, ancak kalıcı kayıt tutulamaz.

## Proje Yapısı

```text
Pixel-Climb-Final/
├── index.html
├── css/                 # Ana ve responsive arayüz stilleri
├── js/                  # Oyun, dünya, oyuncu, platformlar, mağaza, ses ve kayıtlar
├── tests/               # Duman testi ve manuel kabul kontrol listesi
├── .github/workflows/   # GitHub Pages otomatik dağıtımı
└── LICENSE-THIRD-PARTY.md
```

## GitHub Pages Yayını

`.github/workflows/pages.yml` dosyası `main` dalına gönderilen değişiklikleri GitHub Pages'e dağıtır. İlk başarılı dağıtımın ardından demo `https://gorkemhc.github.io/pixel-climb/` adresinde açılır. Gerekirse depo ayarlarında **Settings → Pages → Build and deployment → GitHub Actions** kaynağını seçin.

## Diğer Projeler

- [Promptla](https://gorkemhc.github.io/promptla/)
- [PixelForge](https://gorkemhc.github.io/PixelForge/)
- [SnakeRush](https://gorkemhc.github.io/SnakeRush/)
- [GitHub profili](https://github.com/gorkemhc)

Kişisel LinkedIn profil URL'si kaynakta varsayılan olarak tanımlı değildir. Doğrulanmış adresinizi `js/config.js` içindeki `LINKEDIN_URL` alanına ekleyebilirsiniz.

## Lisans ve Sınırlamalar

Kaynak proje harici oyun asset'i veya kütüphane içermiyor. Başlangıçtaki kaynak HTML dosyasında lisans belirtilmediği için orijinal kodun yeniden dağıtım koşullarını yayın öncesi doğrulayın; üçüncü taraf notları [LICENSE-THIRD-PARTY.md](LICENSE-THIRD-PARTY.md) dosyasındadır. Oyun içi yükseklik fiziksel metre değil, oyun birimidir. Mobil cihazlarda ekran yönü ve performans tarayıcıya ve cihaza bağlıdır.
