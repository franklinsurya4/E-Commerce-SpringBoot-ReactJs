package com.aishop.config;

import com.aishop.model.Product;
import com.aishop.model.User;
import com.aishop.repository.ProductRepository;
import com.aishop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .fullName("Admin User").email("admin@aishop.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN).build());
            userRepository.save(User.builder()
                    .fullName("Demo Customer").email("demo@aishop.com")
                    .password(passwordEncoder.encode("demo123")).build());
            log.info("Seeded admin & demo users");
        }

        if (productRepository.count() == 0) {
            List<Product> products = new ArrayList<>();

            // ═══════════════════════════════════════════
            // ELECTRONICS (20 products)
            // ═══════════════════════════════════════════
            products.add(Product.builder().name("Wireless Noise-Canceling Headphones").description("Premium over-ear headphones with adaptive noise cancellation. 40-hour battery life, memory foam cushions, and Hi-Res audio certified. Foldable design with carrying case.")
                    .price(new BigDecimal("249.99")).originalPrice(new BigDecimal("349.99")).imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600")
                    .category("Electronics").brand("SoundCore").stock(32).rating(4.8).reviewCount(256).tags(List.of("audio","wireless","premium")).featured(true).build());

            products.add(Product.builder().name("Mechanical Keyboard 75%").description("Hot-swappable mechanical keyboard with RGB backlighting. Gateron Brown switches, PBT keycaps, USB-C connection, wireless via Bluetooth 5.2.")
                    .price(new BigDecimal("129.99")).originalPrice(new BigDecimal("159.99")).imageUrl("https://images.unsplash.com/photo-1595225476474-87563907a212?w=600")
                    .category("Electronics").brand("KeyCraft").stock(28).rating(4.6).reviewCount(167).tags(List.of("keyboard","gaming","mechanical")).featured(true).build());

            products.add(Product.builder().name("Smart Fitness Watch").description("Advanced fitness tracker with AMOLED display, SpO2 monitor, GPS, heart rate tracking, sleep analysis, and 14-day battery life.")
                    .price(new BigDecimal("199.99")).originalPrice(new BigDecimal("279.99")).imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600")
                    .category("Electronics").brand("FitPro").stock(42).rating(4.4).reviewCount(312).tags(List.of("fitness","smartwatch","health")).featured(true).build());

            products.add(Product.builder().name("Portable Bluetooth Speaker").description("Waterproof IPX7 speaker with 360° sound. 24-hour playtime, USB-C fast charging. Pairs two speakers for stereo mode.")
                    .price(new BigDecimal("69.99")).originalPrice(new BigDecimal("89.99")).imageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600")
                    .category("Electronics").brand("SoundCore").stock(80).rating(4.3).reviewCount(224).tags(List.of("speaker","bluetooth","portable")).featured(false).build());

            products.add(Product.builder().name("4K Webcam with Ring Light").description("Ultra HD webcam with built-in ring light, auto-focus, and noise-canceling dual microphones. Perfect for streaming and video calls.")
                    .price(new BigDecimal("89.99")).originalPrice(new BigDecimal("119.99")).imageUrl("https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600")
                    .category("Electronics").brand("StreamPro").stock(55).rating(4.5).reviewCount(142).tags(List.of("webcam","streaming","work")).featured(false).build());

            products.add(Product.builder().name("USB-C Docking Station").description("13-in-1 USB-C hub with dual HDMI 4K, Ethernet, SD/microSD, 100W pass-through charging. Aluminum body with thermal vents.")
                    .price(new BigDecimal("79.99")).originalPrice(new BigDecimal("109.99")).imageUrl("https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600")
                    .category("Electronics").brand("TechHub").stock(44).rating(4.4).reviewCount(98).tags(List.of("usb-c","hub","productivity")).featured(false).build());

            products.add(Product.builder().name("Portable Power Bank 20000mAh").description("Slim power bank with 20000mAh capacity, 65W USB-C PD fast charging. Charges laptops and phones simultaneously. LED display.")
                    .price(new BigDecimal("49.99")).originalPrice(new BigDecimal("69.99")).imageUrl("https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600")
                    .category("Electronics").brand("ChargePro").stock(100).rating(4.5).reviewCount(276).tags(List.of("powerbank","charging","travel")).featured(false).build());

            products.add(Product.builder().name("Wireless Charging Pad").description("15W fast wireless charger compatible with all Qi devices. Tempered glass surface, LED indicator, foreign object detection.")
                    .price(new BigDecimal("29.99")).imageUrl("https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=600")
                    .category("Electronics").brand("ChargePro").stock(150).rating(4.2).reviewCount(187).tags(List.of("wireless","charging","qi")).featured(false).build());

            products.add(Product.builder().name("Smart LED Light Strip 5m").description("WiFi-enabled RGB light strip with music sync, voice control via Alexa/Google. 16 million colors, schedule timer, cuttable design.")
                    .price(new BigDecimal("24.99")).originalPrice(new BigDecimal("39.99")).imageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600")
                    .category("Electronics").brand("Lumière").stock(200).rating(4.3).reviewCount(445).tags(List.of("led","smart-home","rgb")).featured(false).build());

            products.add(Product.builder().name("Gaming Mouse Wireless").description("Ultra-lightweight wireless gaming mouse at 58g. 25K DPI sensor, 70-hour battery, PTFE feet, 5 programmable buttons.")
                    .price(new BigDecimal("59.99")).originalPrice(new BigDecimal("79.99")).imageUrl("https://images.unsplash.com/photo-1527814050087-3793815479db?w=600")
                    .category("Electronics").brand("KeyCraft").stock(65).rating(4.6).reviewCount(198).tags(List.of("mouse","gaming","wireless")).featured(false).build());

            products.add(Product.builder().name("Noise-Canceling Earbuds").description("Compact ANC earbuds with 6mm drivers, IPX5 water resistance, 28-hour battery life with case. Touch controls and multi-point connection.")
                    .price(new BigDecimal("99.99")).originalPrice(new BigDecimal("139.99")).imageUrl("https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600")
                    .category("Electronics").brand("SoundCore").stock(75).rating(4.4).reviewCount(156).tags(List.of("earbuds","anc","compact")).featured(false).build());

            products.add(Product.builder().name("Tablet Stand Adjustable").description("Aluminum tablet and laptop stand with 360° rotation. Foldable, adjustable height and angle. Holds devices 4-13 inches.")
                    .price(new BigDecimal("34.99")).imageUrl("https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600")
                    .category("Electronics").brand("ErgoLift").stock(90).rating(4.5).reviewCount(88).tags(List.of("stand","tablet","ergonomic")).featured(false).build());

            products.add(Product.builder().name("Mini Projector 1080P").description("Portable mini projector with native 1080P resolution. WiFi and Bluetooth, built-in speaker, 200-inch display, keystone correction.")
                    .price(new BigDecimal("159.99")).originalPrice(new BigDecimal("219.99")).imageUrl("https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=600")
                    .category("Electronics").brand("ViewMax").stock(25).rating(4.2).reviewCount(134).tags(List.of("projector","portable","entertainment")).featured(false).build());

            products.add(Product.builder().name("Mechanical Numpad").description("Wireless mechanical numpad with hot-swappable switches. Aluminum frame, RGB backlighting, compatible with Mac and Windows.")
                    .price(new BigDecimal("44.99")).imageUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600")
                    .category("Electronics").brand("KeyCraft").stock(40).rating(4.3).reviewCount(56).tags(List.of("numpad","mechanical","wireless")).featured(false).build());

            products.add(Product.builder().name("Smart Plug WiFi 4-Pack").description("WiFi smart plugs with energy monitoring. Voice control via Alexa/Google, schedule timer, away mode. No hub required.")
                    .price(new BigDecimal("29.99")).originalPrice(new BigDecimal("44.99")).imageUrl("https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600")
                    .category("Electronics").brand("SmartLife").stock(180).rating(4.4).reviewCount(567).tags(List.of("smart-plug","wifi","automation")).featured(false).build());

            products.add(Product.builder().name("E-Reader 7 inch").description("Glare-free 7-inch e-ink display with adjustable warm light. 32GB storage, waterproof IPX8, weeks of battery life.")
                    .price(new BigDecimal("139.99")).originalPrice(new BigDecimal("169.99")).imageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600")
                    .category("Electronics").brand("ReadView").stock(35).rating(4.7).reviewCount(223).tags(List.of("ereader","reading","e-ink")).featured(false).build());

            products.add(Product.builder().name("Dash Cam 4K").description("4K front dash camera with night vision, GPS logging, parking mode, 170° wide angle, loop recording, and WiFi app control.")
                    .price(new BigDecimal("89.99")).originalPrice(new BigDecimal("129.99")).imageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600")
                    .category("Electronics").brand("DriveSafe").stock(50).rating(4.5).reviewCount(189).tags(List.of("dashcam","car","safety")).featured(false).build());

            products.add(Product.builder().name("Streaming Microphone USB").description("Cardioid condenser microphone with built-in pop filter, gain knob, mute button, and zero-latency monitoring. Plug and play USB-C.")
                    .price(new BigDecimal("69.99")).originalPrice(new BigDecimal("99.99")).imageUrl("https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600")
                    .category("Electronics").brand("StreamPro").stock(48).rating(4.6).reviewCount(167).tags(List.of("microphone","streaming","podcast")).featured(false).build());

            products.add(Product.builder().name("Digital Photo Frame 10 inch").description("WiFi digital photo frame with touchscreen. Share photos via app from anywhere. 16GB internal storage, auto-rotate, slideshow.")
                    .price(new BigDecimal("79.99")).imageUrl("https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600")
                    .category("Electronics").brand("FrameView").stock(30).rating(4.3).reviewCount(78).tags(List.of("photo-frame","wifi","digital")).featured(false).build());

            // ═══════════════════════════════════════════
            // CLOTHING (15 products)
            // ═══════════════════════════════════════════
            products.add(Product.builder().name("Organic Cotton Hoodie").description("Ultra-soft organic cotton fleece hoodie. Relaxed fit with kangaroo pocket. Available in 8 colors. Machine washable, pre-shrunk.")
                    .price(new BigDecimal("68.00")).originalPrice(new BigDecimal("85.00")).imageUrl("https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600")
                    .category("Clothing").brand("EcoWear").stock(120).rating(4.5).reviewCount(89).tags(List.of("organic","casual","cotton")).featured(true).build());

            products.add(Product.builder().name("Wool Beanie").description("Merino wool beanie knitted in Scotland. Naturally moisture-wicking and odor-resistant. One size fits most. Unisex design.")
                    .price(new BigDecimal("34.99")).imageUrl("https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600")
                    .category("Clothing").brand("Highland").stock(200).rating(4.4).reviewCount(67).tags(List.of("wool","winter","accessories")).featured(false).build());

            products.add(Product.builder().name("Slim Fit Chino Pants").description("Stretch cotton chinos with a modern slim fit. Wrinkle-resistant fabric, hidden flex waistband. Available in 6 colors.")
                    .price(new BigDecimal("59.99")).originalPrice(new BigDecimal("79.99")).imageUrl("https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600")
                    .category("Clothing").brand("ModernFit").stock(85).rating(4.4).reviewCount(134).tags(List.of("pants","slim-fit","casual")).featured(false).build());

            products.add(Product.builder().name("Linen Button-Down Shirt").description("100% European linen shirt with mother-of-pearl buttons. Breathable, naturally wrinkled texture. Regular fit, pre-washed.")
                    .price(new BigDecimal("74.99")).imageUrl("https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600")
                    .category("Clothing").brand("LinenHouse").stock(60).rating(4.6).reviewCount(78).tags(List.of("linen","summer","shirt")).featured(false).build());

            products.add(Product.builder().name("Denim Jacket Classic").description("Heavyweight 14oz denim jacket with brass buttons. Sherpa-lined collar, two chest pockets, adjustable waist tabs. Indigo wash.")
                    .price(new BigDecimal("119.99")).originalPrice(new BigDecimal("149.99")).imageUrl("https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600")
                    .category("Clothing").brand("Heritage").stock(40).rating(4.7).reviewCount(92).tags(List.of("denim","jacket","classic")).featured(true).build());

            products.add(Product.builder().name("Performance T-Shirt").description("Moisture-wicking athletic tee with four-way stretch. Anti-odor technology, flatlock seams, reflective logo. 6 colors.")
                    .price(new BigDecimal("32.99")).imageUrl("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600")
                    .category("Clothing").brand("StrideMax").stock(150).rating(4.3).reviewCount(201).tags(List.of("athletic","gym","moisture-wicking")).featured(false).build());

            products.add(Product.builder().name("Cashmere Scarf").description("Pure cashmere scarf from Mongolia. Incredibly soft and warm. 180cm x 30cm with fringed ends. Comes in a gift box.")
                    .price(new BigDecimal("89.99")).imageUrl("https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600")
                    .category("Clothing").brand("Highland").stock(35).rating(4.8).reviewCount(45).tags(List.of("cashmere","luxury","winter")).featured(false).build());

            products.add(Product.builder().name("Waterproof Rain Jacket").description("Lightweight, packable rain jacket with sealed seams. Adjustable hood, pit zips for ventilation. Fits in its own pocket.")
                    .price(new BigDecimal("95.00")).originalPrice(new BigDecimal("130.00")).imageUrl("https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600")
                    .category("Clothing").brand("TrailGuard").stock(55).rating(4.5).reviewCount(123).tags(List.of("rain","waterproof","outdoor")).featured(false).build());

            products.add(Product.builder().name("Cotton Crew Socks 6-Pack").description("Premium combed cotton socks with reinforced heel and toe. Arch support, seamless toe closure. Fits sizes 6-12.")
                    .price(new BigDecimal("24.99")).imageUrl("https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600")
                    .category("Clothing").brand("EcoWear").stock(300).rating(4.3).reviewCount(456).tags(List.of("socks","cotton","essentials")).featured(false).build());

            products.add(Product.builder().name("Fleece Zip Vest").description("Midweight fleece vest with zip pockets. Perfect layering piece for outdoor activities. Anti-pilling fabric, stand collar.")
                    .price(new BigDecimal("54.99")).originalPrice(new BigDecimal("69.99")).imageUrl("https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=600")
                    .category("Clothing").brand("TrailGuard").stock(70).rating(4.4).reviewCount(67).tags(List.of("fleece","vest","outdoor")).featured(false).build());

            products.add(Product.builder().name("Graphic Print Tee").description("Artist collaboration graphic tee on 100% organic cotton. Oversized fit, ribbed crew neck, printed with eco-friendly water-based inks.")
                    .price(new BigDecimal("38.00")).imageUrl("https://images.unsplash.com/photo-1503341504253-dff4f94032fc?w=600")
                    .category("Clothing").brand("EcoWear").stock(90).rating(4.2).reviewCount(55).tags(List.of("graphic","tee","organic")).featured(false).build());

            products.add(Product.builder().name("Cargo Jogger Pants").description("Relaxed-fit cargo joggers with stretch waistband, six pockets, and tapered leg. Ripstop cotton blend, adjustable cuffs.")
                    .price(new BigDecimal("64.99")).originalPrice(new BigDecimal("84.99")).imageUrl("https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600")
                    .category("Clothing").brand("ModernFit").stock(75).rating(4.5).reviewCount(88).tags(List.of("joggers","cargo","casual")).featured(false).build());

            products.add(Product.builder().name("Puffer Jacket Lightweight").description("Packable down puffer jacket weighing only 350g. 700-fill duck down, water-resistant shell, chin guard. Stuffs into chest pocket.")
                    .price(new BigDecimal("139.99")).originalPrice(new BigDecimal("189.99")).imageUrl("https://images.unsplash.com/photo-1544923246-77307dd270b5?w=600")
                    .category("Clothing").brand("TrailGuard").stock(45).rating(4.6).reviewCount(134).tags(List.of("puffer","down","lightweight")).featured(false).build());

            products.add(Product.builder().name("Oxford Button-Down Shirt").description("Classic Oxford cloth button-down in brushed cotton. Soft collar, back pleat, locker loop. Business casual essential.")
                    .price(new BigDecimal("58.00")).imageUrl("https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600")
                    .category("Clothing").brand("ModernFit").stock(65).rating(4.5).reviewCount(99).tags(List.of("oxford","shirt","classic")).featured(false).build());

            products.add(Product.builder().name("Swim Trunks Quick-Dry").description("Quick-dry swim trunks with mesh liner and elastic waist. Side pockets with drainage grommets. UPF 50+ fabric, 7-inch inseam.")
                    .price(new BigDecimal("38.99")).imageUrl("https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600")
                    .category("Clothing").brand("StrideMax").stock(110).rating(4.2).reviewCount(76).tags(List.of("swim","quick-dry","summer")).featured(false).build());

            // ═══════════════════════════════════════════
            // FOOTWEAR (10 products)
            // ═══════════════════════════════════════════
            products.add(Product.builder().name("Ultralight Running Shoes").description("Carbon-plate running shoes weighing just 198g. Responsive ZoomX foam, engineered mesh upper, reflective details for night runs.")
                    .price(new BigDecimal("159.99")).originalPrice(new BigDecimal("199.99")).imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600")
                    .category("Footwear").brand("StrideMax").stock(38).rating(4.5).reviewCount(178).tags(List.of("running","lightweight","sport")).featured(true).build());

            products.add(Product.builder().name("Leather Chelsea Boots").description("Full-grain leather Chelsea boots with Goodyear welt construction. Leather sole with rubber heel cap. Pull tabs for easy wear.")
                    .price(new BigDecimal("189.99")).originalPrice(new BigDecimal("249.99")).imageUrl("https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600")
                    .category("Footwear").brand("Heritage").stock(25).rating(4.7).reviewCount(67).tags(List.of("boots","leather","classic")).featured(false).build());

            products.add(Product.builder().name("Canvas Sneakers Low-Top").description("Classic canvas sneakers with vulcanized rubber sole. Cushioned insole, metal eyelets, cotton laces. 12 color options.")
                    .price(new BigDecimal("49.99")).imageUrl("https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600")
                    .category("Footwear").brand("StreetKick").stock(200).rating(4.3).reviewCount(345).tags(List.of("sneakers","canvas","casual")).featured(false).build());

            products.add(Product.builder().name("Trail Hiking Boots").description("Waterproof hiking boots with Vibram outsole. Ankle support, EVA midsole cushioning, gusseted tongue. Built for tough terrain.")
                    .price(new BigDecimal("149.99")).originalPrice(new BigDecimal("189.99")).imageUrl("https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600")
                    .category("Footwear").brand("TrailGuard").stock(30).rating(4.6).reviewCount(89).tags(List.of("hiking","waterproof","outdoor")).featured(false).build());

            products.add(Product.builder().name("Leather Loafers").description("Handcrafted leather penny loafers with Blake-stitched construction. Leather-lined interior, cushioned insole, stacked leather heel.")
                    .price(new BigDecimal("129.99")).imageUrl("https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600")
                    .category("Footwear").brand("Heritage").stock(35).rating(4.5).reviewCount(56).tags(List.of("loafers","leather","formal")).featured(false).build());

            products.add(Product.builder().name("Slip-On Comfort Shoes").description("Memory foam slip-on shoes with knit upper. Lightweight EVA sole, removable insole, machine washable. Walk-all-day comfort.")
                    .price(new BigDecimal("59.99")).originalPrice(new BigDecimal("79.99")).imageUrl("https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600")
                    .category("Footwear").brand("ComfortStep").stock(80).rating(4.4).reviewCount(234).tags(List.of("comfort","slip-on","everyday")).featured(false).build());

            products.add(Product.builder().name("Sports Sandals").description("Adjustable sport sandals with arch support. Quick-dry webbing straps, EVA footbed, rubber outsole. Water-friendly design.")
                    .price(new BigDecimal("44.99")).imageUrl("https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600")
                    .category("Footwear").brand("StrideMax").stock(95).rating(4.2).reviewCount(145).tags(List.of("sandals","sport","summer")).featured(false).build());

            products.add(Product.builder().name("High-Top Basketball Shoes").description("Performance basketball shoes with zoom air cushioning, herringbone traction pattern, padded collar. Ankle lockdown system.")
                    .price(new BigDecimal("134.99")).originalPrice(new BigDecimal("174.99")).imageUrl("https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600")
                    .category("Footwear").brand("StrideMax").stock(40).rating(4.5).reviewCount(112).tags(List.of("basketball","high-top","performance")).featured(false).build());

            products.add(Product.builder().name("Suede Desert Boots").description("Classic suede desert boots with crepe rubber sole. Unlined construction for breathability. Two-eyelet lacing. British heritage design.")
                    .price(new BigDecimal("109.99")).imageUrl("https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600")
                    .category("Footwear").brand("Heritage").stock(30).rating(4.6).reviewCount(45).tags(List.of("suede","boots","desert")).featured(false).build());

            products.add(Product.builder().name("Minimalist White Sneakers").description("Clean white leather sneakers with minimal branding. Margom rubber sole, hand-finished in Italy. Premium full-grain leather.")
                    .price(new BigDecimal("175.00")).imageUrl("https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600")
                    .category("Footwear").brand("ModernFit").stock(20).rating(4.8).reviewCount(78).tags(List.of("sneakers","white","minimalist")).featured(false).build());

            // ═══════════════════════════════════════════
            // BAGS & ACCESSORIES (10 products)
            // ═══════════════════════════════════════════
            products.add(Product.builder().name("Leather Weekender Bag").description("Full-grain leather weekender with YKK zippers. Interior laptop sleeve, shoe compartment, and brass hardware. Ages beautifully.")
                    .price(new BigDecimal("189.00")).originalPrice(new BigDecimal("249.00")).imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600")
                    .category("Bags").brand("Heritage").stock(18).rating(4.7).reviewCount(74).tags(List.of("leather","travel","premium")).featured(true).build());

            products.add(Product.builder().name("Canvas Backpack").description("Waxed canvas backpack with leather trim. Padded 15-inch laptop compartment, water-resistant finish. 25L capacity with hidden pockets.")
                    .price(new BigDecimal("98.00")).originalPrice(new BigDecimal("128.00")).imageUrl("https://images.unsplash.com/photo-1581605405669-fcdf81165b31?w=600")
                    .category("Bags").brand("Heritage").stock(35).rating(4.6).reviewCount(88).tags(List.of("backpack","canvas","everyday")).featured(false).build());

            products.add(Product.builder().name("Crossbody Sling Bag").description("Compact crossbody sling bag with anti-theft zippers. Water-resistant nylon, padded tablet pocket, adjustable strap. 5L capacity.")
                    .price(new BigDecimal("39.99")).imageUrl("https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600")
                    .category("Bags").brand("UrbanCarry").stock(100).rating(4.3).reviewCount(156).tags(List.of("crossbody","sling","compact")).featured(false).build());

            products.add(Product.builder().name("Leather Bifold Wallet").description("Slim leather bifold wallet with RFID blocking. 8 card slots, 2 bill compartments, ID window. Comes in gift box packaging.")
                    .price(new BigDecimal("44.99")).imageUrl("https://images.unsplash.com/photo-1627123424574-724758594e93?w=600")
                    .category("Bags").brand("Heritage").stock(120).rating(4.5).reviewCount(234).tags(List.of("wallet","leather","rfid")).featured(false).build());

            products.add(Product.builder().name("Laptop Messenger Bag").description("Professional messenger bag with padded laptop compartment up to 15.6 inches. Organizer panel, trolley strap, adjustable shoulder pad.")
                    .price(new BigDecimal("79.99")).originalPrice(new BigDecimal("109.99")).imageUrl("https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600")
                    .category("Bags").brand("UrbanCarry").stock(45).rating(4.4).reviewCount(98).tags(List.of("messenger","laptop","professional")).featured(false).build());

            products.add(Product.builder().name("Travel Toiletry Bag").description("Water-resistant dopp kit with hanging hook. Multiple compartments, mesh pockets, quality YKK zippers. Folds flat for storage.")
                    .price(new BigDecimal("28.99")).imageUrl("https://images.unsplash.com/photo-1556756544-ad72f50f7b72?w=600")
                    .category("Bags").brand("Heritage").stock(80).rating(4.3).reviewCount(67).tags(List.of("toiletry","travel","organizer")).featured(false).build());

            products.add(Product.builder().name("Sunglasses Polarized").description("Polarized UV400 sunglasses with acetate frame. Anti-glare coating, spring hinges, scratch-resistant lenses. Includes hard case.")
                    .price(new BigDecimal("69.99")).originalPrice(new BigDecimal("99.99")).imageUrl("https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600")
                    .category("Bags").brand("ShadeView").stock(65).rating(4.5).reviewCount(189).tags(List.of("sunglasses","polarized","uv")).featured(false).build());

            products.add(Product.builder().name("Minimalist Watch").description("Swiss quartz movement watch with sapphire crystal glass. 40mm case, genuine leather strap, 5ATM water resistance. Slim profile.")
                    .price(new BigDecimal("149.99")).originalPrice(new BigDecimal("199.99")).imageUrl("https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600")
                    .category("Bags").brand("TimeKeeper").stock(25).rating(4.7).reviewCount(112).tags(List.of("watch","minimalist","leather")).featured(false).build());

            products.add(Product.builder().name("Leather Belt").description("Full-grain leather belt with brushed nickel buckle. 35mm width, feathered edges, available in black and brown. Handmade.")
                    .price(new BigDecimal("54.99")).imageUrl("https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600")
                    .category("Bags").brand("Heritage").stock(90).rating(4.4).reviewCount(78).tags(List.of("belt","leather","essential")).featured(false).build());

            products.add(Product.builder().name("Tote Bag Canvas").description("Heavy-duty canvas tote bag with leather handles. Interior zip pocket, magnetic snap closure. 18x14x5 inches. Daily workhorse.")
                    .price(new BigDecimal("42.00")).imageUrl("https://images.unsplash.com/photo-1544816155-12df9643f363?w=600")
                    .category("Bags").brand("EcoWear").stock(70).rating(4.3).reviewCount(45).tags(List.of("tote","canvas","everyday")).featured(false).build());

            // ═══════════════════════════════════════════
            // HOME & LIVING (15 products)
            // ═══════════════════════════════════════════
            products.add(Product.builder().name("Minimal Desk Lamp").description("Sleek aluminum desk lamp with adjustable arm and warm LED light. Touch-sensitive dimmer with 5 brightness levels. USB-C charging port.")
                    .price(new BigDecimal("79.99")).originalPrice(new BigDecimal("99.99")).imageUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600")
                    .category("Home").brand("Lumière").stock(45).rating(4.7).reviewCount(128).tags(List.of("desk","office","led")).featured(true).build());

            products.add(Product.builder().name("Linen Throw Blanket").description("Stonewashed French linen throw. Naturally temperature-regulating, hypoallergenic. 60x80 inches. Gets softer with each wash.")
                    .price(new BigDecimal("89.00")).imageUrl("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600")
                    .category("Home").brand("LinenHouse").stock(55).rating(4.6).reviewCount(41).tags(List.of("linen","home","cozy")).featured(false).build());

            products.add(Product.builder().name("Aromatherapy Diffuser").description("Ultrasonic essential oil diffuser with wood grain finish. 7 LED colors, auto shut-off, whisper-quiet operation. 300ml tank.")
                    .price(new BigDecimal("39.99")).imageUrl("https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600")
                    .category("Home").brand("ZenAir").stock(70).rating(4.5).reviewCount(195).tags(List.of("diffuser","aromatherapy","relaxation")).featured(false).build());

            products.add(Product.builder().name("Bamboo Standing Desk").description("Height-adjustable standing desk with bamboo top. Dual motor, 4 memory presets, cable management tray. 60x30 inch surface.")
                    .price(new BigDecimal("449.99")).originalPrice(new BigDecimal("599.99")).imageUrl("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600")
                    .category("Home").brand("ErgoLift").stock(15).rating(4.8).reviewCount(95).tags(List.of("desk","ergonomic","bamboo")).featured(false).build());

            products.add(Product.builder().name("Scented Candle Set (3-Pack)").description("Hand-poured soy wax candles with cotton wicks. Scents: Lavender Fields, Cedarwood, and Vanilla Bean. 45-hour burn time each.")
                    .price(new BigDecimal("34.99")).imageUrl("https://images.unsplash.com/photo-1602607711890-b05cf959e006?w=600")
                    .category("Home").brand("ZenAir").stock(130).rating(4.6).reviewCount(267).tags(List.of("candles","soy","scented")).featured(false).build());

            products.add(Product.builder().name("Ceramic Planter Set").description("Set of 3 minimalist ceramic planters with bamboo saucers. Drainage holes, matte finish. Sizes: 4, 6, and 8 inches.")
                    .price(new BigDecimal("44.99")).imageUrl("https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600")
                    .category("Home").brand("GreenHome").stock(60).rating(4.4).reviewCount(89).tags(List.of("planter","ceramic","decor")).featured(false).build());

            products.add(Product.builder().name("Wall Clock Minimalist").description("Silent sweep wall clock with wood frame and glass face. 12-inch diameter, quartz movement, no ticking noise. Battery operated.")
                    .price(new BigDecimal("42.99")).imageUrl("https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600")
                    .category("Home").brand("Lumière").stock(50).rating(4.3).reviewCount(56).tags(List.of("clock","minimalist","wall")).featured(false).build());

            products.add(Product.builder().name("Cotton Bath Towel Set").description("Turkish cotton bath towels, set of 4. 600 GSM, highly absorbent, quick-dry. Oeko-Tex certified, available in 10 colors.")
                    .price(new BigDecimal("49.99")).originalPrice(new BigDecimal("69.99")).imageUrl("https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600")
                    .category("Home").brand("LinenHouse").stock(75).rating(4.5).reviewCount(178).tags(List.of("towels","cotton","bath")).featured(false).build());

            products.add(Product.builder().name("Bookshelf Floating Set").description("Set of 3 floating shelves in walnut veneer. Invisible mounting hardware, holds up to 20 lbs each. Sizes: 24, 18, and 12 inches.")
                    .price(new BigDecimal("59.99")).imageUrl("https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600")
                    .category("Home").brand("GreenHome").stock(35).rating(4.4).reviewCount(67).tags(List.of("shelves","floating","wood")).featured(false).build());

            products.add(Product.builder().name("Velvet Throw Pillows (2-Pack)").description("Luxury velvet throw pillows with hidden zipper. Hypoallergenic polyester fill, machine washable covers. 18x18 inches.")
                    .price(new BigDecimal("32.99")).imageUrl("https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600")
                    .category("Home").brand("LinenHouse").stock(100).rating(4.3).reviewCount(145).tags(List.of("pillows","velvet","decor")).featured(false).build());

            products.add(Product.builder().name("Desk Organizer Wood").description("Handcrafted walnut desk organizer with phone stand, pen holder, card slot, and cable management. Felt-lined compartments.")
                    .price(new BigDecimal("39.99")).imageUrl("https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=600")
                    .category("Home").brand("ErgoLift").stock(55).rating(4.5).reviewCount(89).tags(List.of("organizer","desk","wood")).featured(false).build());

            products.add(Product.builder().name("Indoor Herb Garden Kit").description("Self-watering indoor herb garden with LED grow light. Includes basil, cilantro, and parsley seed pods. Automatic 16-hour light cycle.")
                    .price(new BigDecimal("69.99")).originalPrice(new BigDecimal("89.99")).imageUrl("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600")
                    .category("Home").brand("GreenHome").stock(40).rating(4.6).reviewCount(134).tags(List.of("herbs","garden","indoor")).featured(false).build());

            products.add(Product.builder().name("Weighted Blanket 15 lbs").description("Glass bead weighted blanket with cooling bamboo duvet cover. 60x80 inches, 7-layer design, OEKO-TEX certified.")
                    .price(new BigDecimal("79.99")).originalPrice(new BigDecimal("109.99")).imageUrl("https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600")
                    .category("Home").brand("LinenHouse").stock(30).rating(4.7).reviewCount(212).tags(List.of("weighted","blanket","sleep")).featured(false).build());

            products.add(Product.builder().name("Essential Oil Set 8-Pack").description("Pure therapeutic-grade essential oils: Lavender, Peppermint, Eucalyptus, Tea Tree, Orange, Lemon, Rosemary, Frankincense. 10ml each.")
                    .price(new BigDecimal("29.99")).imageUrl("https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600")
                    .category("Home").brand("ZenAir").stock(150).rating(4.4).reviewCount(345).tags(List.of("essential-oils","aromatherapy","natural")).featured(false).build());

            products.add(Product.builder().name("Smart Thermostat").description("WiFi smart thermostat with learning algorithms. Energy-saving scheduling, geofencing, Alexa/Google compatible. Color touchscreen.")
                    .price(new BigDecimal("149.99")).originalPrice(new BigDecimal("199.99")).imageUrl("https://images.unsplash.com/photo-1558002038-1055907df827?w=600")
                    .category("Home").brand("SmartLife").stock(25).rating(4.6).reviewCount(178).tags(List.of("thermostat","smart-home","energy")).featured(false).build());

            // ═══════════════════════════════════════════
            // KITCHEN (10 products)
            // ═══════════════════════════════════════════
            products.add(Product.builder().name("Ceramic Pour-Over Coffee Set").description("Handcrafted ceramic dripper with double-wall glass carafe. Includes 100 unbleached paper filters and a walnut wood stand.")
                    .price(new BigDecimal("54.99")).imageUrl("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600")
                    .category("Kitchen").brand("BrewCraft").stock(65).rating(4.9).reviewCount(203).tags(List.of("coffee","ceramic","handmade")).featured(true).build());

            products.add(Product.builder().name("Japanese Chef Knife 8 inch").description("Hand-forged VG-10 steel blade with Damascus pattern. Pakka wood handle, 67 layers. Comes with magnetic sheath and care guide.")
                    .price(new BigDecimal("134.99")).imageUrl("https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600")
                    .category("Kitchen").brand("Kai Seki").stock(22).rating(4.9).reviewCount(156).tags(List.of("knife","japanese","cooking")).featured(false).build());

            products.add(Product.builder().name("Cast Iron Skillet 12 inch").description("Pre-seasoned cast iron skillet with helper handle. Works on all cooktops including induction. Oven safe to 500°F. Lifetime warranty.")
                    .price(new BigDecimal("44.99")).imageUrl("https://images.unsplash.com/photo-1585515320310-259814833e62?w=600")
                    .category("Kitchen").brand("IronForge").stock(50).rating(4.8).reviewCount(312).tags(List.of("cast-iron","skillet","cooking")).featured(false).build());

            products.add(Product.builder().name("Electric Kettle Gooseneck").description("Temperature-controlled gooseneck kettle for pour-over coffee. 6 presets, hold mode, built-in timer. Stainless steel, 1L capacity.")
                    .price(new BigDecimal("79.99")).originalPrice(new BigDecimal("99.99")).imageUrl("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600")
                    .category("Kitchen").brand("BrewCraft").stock(40).rating(4.7).reviewCount(178).tags(List.of("kettle","coffee","gooseneck")).featured(false).build());

            products.add(Product.builder().name("Bamboo Cutting Board Set").description("Set of 3 bamboo cutting boards with juice grooves. Anti-microbial, knife-friendly surface. Sizes: large, medium, and small.")
                    .price(new BigDecimal("29.99")).imageUrl("https://images.unsplash.com/photo-1606914501449-5a96b6ce24ca?w=600")
                    .category("Kitchen").brand("GreenHome").stock(85).rating(4.4).reviewCount(134).tags(List.of("cutting-board","bamboo","kitchen")).featured(false).build());

            products.add(Product.builder().name("French Press Coffee Maker").description("Double-wall insulated French press with 4-level filtration. Borosilicate glass carafe, stainless steel frame, 34oz capacity.")
                    .price(new BigDecimal("34.99")).imageUrl("https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600")
                    .category("Kitchen").brand("BrewCraft").stock(70).rating(4.5).reviewCount(267).tags(List.of("french-press","coffee","glass")).featured(false).build());

            products.add(Product.builder().name("Stainless Steel Mixing Bowls").description("Set of 5 nesting mixing bowls with airtight lids. Non-slip silicone base, measurement markings. Dishwasher safe.")
                    .price(new BigDecimal("39.99")).imageUrl("https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600")
                    .category("Kitchen").brand("IronForge").stock(60).rating(4.5).reviewCount(89).tags(List.of("bowls","stainless","baking")).featured(false).build());

            products.add(Product.builder().name("Silicone Utensil Set 12-Piece").description("Heat-resistant silicone cooking utensils with acacia wood handles. Non-scratch, BPA-free, dishwasher safe. Includes storage holder.")
                    .price(new BigDecimal("32.99")).imageUrl("https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=600")
                    .category("Kitchen").brand("GreenHome").stock(95).rating(4.4).reviewCount(178).tags(List.of("utensils","silicone","cooking")).featured(false).build());

            products.add(Product.builder().name("Insulated Water Bottle 32oz").description("Triple-insulated stainless steel water bottle. Keeps cold 24h, hot 12h. Wide mouth, leak-proof lid, powder-coated finish.")
                    .price(new BigDecimal("29.99")).imageUrl("https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600")
                    .category("Kitchen").brand("HydroFlow").stock(180).rating(4.6).reviewCount(456).tags(List.of("bottle","insulated","hydration")).featured(false).build());

            products.add(Product.builder().name("Espresso Machine Compact").description("15-bar compact espresso machine with milk frother. Thermoblock heating in 30 seconds, removable water tank. Makes single or double shots.")
                    .price(new BigDecimal("199.99")).originalPrice(new BigDecimal("279.99")).imageUrl("https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600")
                    .category("Kitchen").brand("BrewCraft").stock(20).rating(4.7).reviewCount(134).tags(List.of("espresso","machine","coffee")).featured(false).build());

            // ═══════════════════════════════════════════
            // HEALTH & FITNESS (10 products)
            // ═══════════════════════════════════════════
            products.add(Product.builder().name("Plant-Based Protein Powder").description("Organic pea and rice protein blend, 25g per serving. No artificial sweeteners. Chocolate flavor. 30 servings per container.")
                    .price(new BigDecimal("42.99")).imageUrl("https://images.unsplash.com/photo-1593095948071-474c5cc2c4d8?w=600")
                    .category("Health").brand("GreenFuel").stock(90).rating(4.2).reviewCount(143).tags(List.of("protein","vegan","fitness")).featured(false).build());

            products.add(Product.builder().name("Yoga Mat Premium 6mm").description("Non-slip yoga mat with alignment lines. Eco-friendly TPE material, 72x26 inches. Includes carrying strap. Available in 5 colors.")
                    .price(new BigDecimal("49.99")).imageUrl("https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600")
                    .category("Health").brand("ZenFit").stock(75).rating(4.6).reviewCount(234).tags(List.of("yoga","mat","fitness")).featured(false).build());

            products.add(Product.builder().name("Resistance Bands Set").description("Set of 5 fabric resistance bands with varying levels. Non-roll design, includes mesh carry bag and exercise guide. Latex-free.")
                    .price(new BigDecimal("24.99")).imageUrl("https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600")
                    .category("Health").brand("ZenFit").stock(150).rating(4.4).reviewCount(312).tags(List.of("resistance","bands","workout")).featured(false).build());

            products.add(Product.builder().name("Foam Roller High-Density").description("High-density EVA foam roller for deep tissue massage. 18-inch length, textured surface for trigger point therapy. Lightweight.")
                    .price(new BigDecimal("22.99")).imageUrl("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600")
                    .category("Health").brand("ZenFit").stock(100).rating(4.3).reviewCount(178).tags(List.of("foam-roller","recovery","massage")).featured(false).build());

            products.add(Product.builder().name("Jump Rope Speed").description("Adjustable speed jump rope with ball bearings. Tangle-free steel cable with PVC coating, memory foam handles. 10 feet adjustable.")
                    .price(new BigDecimal("14.99")).imageUrl("https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600")
                    .category("Health").brand("StrideMax").stock(200).rating(4.2).reviewCount(267).tags(List.of("jump-rope","cardio","fitness")).featured(false).build());

            products.add(Product.builder().name("Adjustable Dumbbell Set").description("Adjustable dumbbells from 5-25 lbs per hand. Quick-change weight system, compact design replaces 10 dumbbells. Rubberized grip.")
                    .price(new BigDecimal("249.99")).originalPrice(new BigDecimal("349.99")).imageUrl("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600")
                    .category("Health").brand("IronForge").stock(20).rating(4.7).reviewCount(89).tags(List.of("dumbbells","adjustable","strength")).featured(false).build());

            products.add(Product.builder().name("Massage Gun Percussion").description("Deep tissue percussion massage gun with 6 heads and 30 speed levels. Quiet brushless motor, 6-hour battery, travel case included.")
                    .price(new BigDecimal("99.99")).originalPrice(new BigDecimal("149.99")).imageUrl("https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600")
                    .category("Health").brand("ZenFit").stock(35).rating(4.5).reviewCount(178).tags(List.of("massage","percussion","recovery")).featured(false).build());

            products.add(Product.builder().name("Gym Bag Duffle").description("Water-resistant gym duffle with separate shoe compartment, wet pocket, and multiple organizer pockets. 40L capacity, padded strap.")
                    .price(new BigDecimal("44.99")).imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600")
                    .category("Health").brand("UrbanCarry").stock(65).rating(4.4).reviewCount(123).tags(List.of("gym-bag","duffle","fitness")).featured(false).build());

            products.add(Product.builder().name("Multivitamin Daily").description("Whole-food based daily multivitamin with probiotics. 60 tablets, non-GMO, gluten-free. Contains vitamins A, C, D, E, K, B-complex.")
                    .price(new BigDecimal("28.99")).imageUrl("https://images.unsplash.com/photo-1584308666544-ad72f50f7b72?w=600")
                    .category("Health").brand("GreenFuel").stock(180).rating(4.3).reviewCount(345).tags(List.of("vitamins","supplements","daily")).featured(false).build());

            products.add(Product.builder().name("Smart Body Scale").description("WiFi body composition scale measuring weight, BMI, body fat, muscle mass, and more. Syncs with Apple Health and Google Fit.")
                    .price(new BigDecimal("39.99")).originalPrice(new BigDecimal("59.99")).imageUrl("https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600")
                    .category("Health").brand("FitPro").stock(50).rating(4.4).reviewCount(189).tags(List.of("scale","smart","body-composition")).featured(false).build());

            // ═══════════════════════════════════════════
            // BOOKS & STATIONERY (10 products)
            // ═══════════════════════════════════════════
            products.add(Product.builder().name("Leather Bound Journal").description("Genuine leather journal with 240 pages of acid-free paper. Lay-flat binding, ribbon bookmark, back pocket. 5.5x8.5 inches.")
                    .price(new BigDecimal("32.99")).imageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600")
                    .category("Books").brand("PaperCraft").stock(80).rating(4.7).reviewCount(167).tags(List.of("journal","leather","writing")).featured(false).build());

            products.add(Product.builder().name("Fountain Pen Set").description("Brass fountain pen with Schmidt converter and 3 ink cartridges. Fine nib, weighted barrel, includes velvet pouch. Gift ready.")
                    .price(new BigDecimal("44.99")).imageUrl("https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600")
                    .category("Books").brand("PaperCraft").stock(45).rating(4.6).reviewCount(78).tags(List.of("fountain-pen","writing","gift")).featured(false).build());

            products.add(Product.builder().name("Sketchbook A4 Hardcover").description("160-page hardcover sketchbook with 120gsm acid-free paper. Lay-flat binding, elastic closure, inner pocket. For all dry media.")
                    .price(new BigDecimal("18.99")).imageUrl("https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600")
                    .category("Books").brand("PaperCraft").stock(120).rating(4.4).reviewCount(89).tags(List.of("sketchbook","art","drawing")).featured(false).build());

            products.add(Product.builder().name("Desk Notepad Set").description("Set of 3 notepads: lined, dotted, and blank. 50 sheets each, tear-off pages, chipboard backing. 5.5x8.5 inches.")
                    .price(new BigDecimal("14.99")).imageUrl("https://images.unsplash.com/photo-1517842645767-c639042777db?w=600")
                    .category("Books").brand("PaperCraft").stock(200).rating(4.2).reviewCount(56).tags(List.of("notepad","desk","writing")).featured(false).build());

            products.add(Product.builder().name("Colored Pencils 72-Set").description("Professional grade colored pencils with soft core for smooth layering. Break-resistant leads, pre-sharpened, in tin storage case.")
                    .price(new BigDecimal("34.99")).imageUrl("https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600")
                    .category("Books").brand("ArtLine").stock(60).rating(4.5).reviewCount(134).tags(List.of("colored-pencils","art","drawing")).featured(false).build());

            // ═══════════════════════════════════════════
            // OUTDOOR & TRAVEL (5 products)
            // ═══════════════════════════════════════════
            products.add(Product.builder().name("Camping Hammock").description("Double camping hammock with tree straps. Parachute nylon, holds 500 lbs. Compact stuff sack included. 10x6.5 feet.")
                    .price(new BigDecimal("34.99")).imageUrl("https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600")
                    .category("Outdoor").brand("TrailGuard").stock(55).rating(4.5).reviewCount(234).tags(List.of("hammock","camping","outdoor")).featured(false).build());

            products.add(Product.builder().name("Insulated Cooler Bag").description("Leak-proof insulated cooler bag keeping items cold for 48 hours. 24-can capacity, shoulder strap, front pocket for utensils.")
                    .price(new BigDecimal("49.99")).imageUrl("https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600")
                    .category("Outdoor").brand("TrailGuard").stock(40).rating(4.4).reviewCount(89).tags(List.of("cooler","insulated","picnic")).featured(false).build());

            products.add(Product.builder().name("Headlamp Rechargeable").description("1000 lumens rechargeable headlamp with red light mode. IPX6 waterproof, motion sensor, adjustable beam. USB-C charging.")
                    .price(new BigDecimal("29.99")).imageUrl("https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600")
                    .category("Outdoor").brand("TrailGuard").stock(80).rating(4.5).reviewCount(156).tags(List.of("headlamp","camping","rechargeable")).featured(false).build());

            products.add(Product.builder().name("Travel Compression Cubes 6-Pack").description("Set of 6 compression packing cubes in various sizes. Water-resistant fabric, double zipper compression, mesh top for visibility.")
                    .price(new BigDecimal("27.99")).imageUrl("https://images.unsplash.com/photo-1553413077-190dd305871c?w=600")
                    .category("Outdoor").brand("UrbanCarry").stock(100).rating(4.3).reviewCount(267).tags(List.of("packing-cubes","travel","organization")).featured(false).build());

            products.add(Product.builder().name("Portable Camping Chair").description("Ultralight folding camp chair at 2 lbs. 300 lb capacity, breathable mesh back, cup holder. Packs into attached carry bag.")
                    .price(new BigDecimal("39.99")).originalPrice(new BigDecimal("54.99")).imageUrl("https://images.unsplash.com/photo-1532509774891-141d37f25ae9?w=600")
                    .category("Outdoor").brand("TrailGuard").stock(45).rating(4.4).reviewCount(145).tags(List.of("chair","camping","portable")).featured(false).build());

            productRepository.saveAll(products);
            log.info("Seeded {} products", products.size());
        }
    }
}