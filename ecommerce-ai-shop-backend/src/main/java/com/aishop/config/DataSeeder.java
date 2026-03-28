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
            List<Product> products = List.of(
                Product.builder().name("Minimal Desk Lamp").description("Sleek aluminum desk lamp with adjustable arm and warm LED light. Touch-sensitive dimmer with 5 brightness levels. USB-C charging port built into the base.")
                    .price(new BigDecimal("79.99")).originalPrice(new BigDecimal("99.99")).imageUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600")
                    .category("Lighting").brand("Lumière").stock(45).rating(4.7).reviewCount(128).tags(List.of("desk","office","led")).featured(true).build(),

                Product.builder().name("Wireless Noise-Canceling Headphones").description("Premium over-ear headphones with adaptive noise cancellation. 40-hour battery life, memory foam cushions, and Hi-Res audio certified.")
                    .price(new BigDecimal("249.99")).originalPrice(new BigDecimal("349.99")).imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600")
                    .category("Electronics").brand("SoundCore").stock(32).rating(4.8).reviewCount(256).tags(List.of("audio","wireless","premium")).featured(true).build(),

                Product.builder().name("Organic Cotton Hoodie").description("Ultra-soft organic cotton fleece hoodie. Relaxed fit with kangaroo pocket. Available in 8 colors. Machine washable, pre-shrunk.")
                    .price(new BigDecimal("68.00")).originalPrice(new BigDecimal("85.00")).imageUrl("https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600")
                    .category("Clothing").brand("EcoWear").stock(120).rating(4.5).reviewCount(89).tags(List.of("organic","casual","cotton")).featured(true).build(),

                Product.builder().name("Mechanical Keyboard 75%").description("Hot-swappable mechanical keyboard with RGB backlighting. Gateron Brown switches, PBT keycaps, USB-C, wireless via Bluetooth 5.2.")
                    .price(new BigDecimal("129.99")).originalPrice(new BigDecimal("159.99")).imageUrl("https://images.unsplash.com/photo-1595225476474-87563907a212?w=600")
                    .category("Electronics").brand("KeyCraft").stock(28).rating(4.6).reviewCount(167).tags(List.of("keyboard","gaming","mechanical")).featured(true).build(),

                Product.builder().name("Ceramic Pour-Over Coffee Set").description("Handcrafted ceramic dripper with double-wall glass carafe. Includes 100 unbleached paper filters and a walnut wood stand.")
                    .price(new BigDecimal("54.99")).imageUrl("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600")
                    .category("Kitchen").brand("BrewCraft").stock(65).rating(4.9).reviewCount(203).tags(List.of("coffee","ceramic","handmade")).featured(true).build(),

                Product.builder().name("Leather Weekender Bag").description("Full-grain leather weekender with YKK zippers. Interior laptop sleeve, shoe compartment, and brass hardware. Ages beautifully.")
                    .price(new BigDecimal("189.00")).originalPrice(new BigDecimal("249.00")).imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600")
                    .category("Bags").brand("Heritage").stock(18).rating(4.7).reviewCount(74).tags(List.of("leather","travel","premium")).featured(true).build(),

                Product.builder().name("Smart Fitness Watch").description("Advanced fitness tracker with AMOLED display, SpO2 monitor, GPS, heart rate tracking, sleep analysis, and 14-day battery life.")
                    .price(new BigDecimal("199.99")).originalPrice(new BigDecimal("279.99")).imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600")
                    .category("Electronics").brand("FitPro").stock(42).rating(4.4).reviewCount(312).tags(List.of("fitness","smartwatch","health")).featured(false).build(),

                Product.builder().name("Bamboo Standing Desk").description("Height-adjustable standing desk with bamboo top. Dual motor, 4 memory presets, cable management tray. 60x30 inch surface.")
                    .price(new BigDecimal("449.99")).originalPrice(new BigDecimal("599.99")).imageUrl("https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600")
                    .category("Furniture").brand("ErgoLift").stock(15).rating(4.8).reviewCount(95).tags(List.of("desk","ergonomic","bamboo")).featured(false).build(),

                Product.builder().name("Linen Throw Blanket").description("Stonewashed French linen throw. Naturally temperature-regulating, hypoallergenic. 60x80 inches. Gets softer with each wash.")
                    .price(new BigDecimal("89.00")).imageUrl("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600")
                    .category("Home").brand("LinenHouse").stock(55).rating(4.6).reviewCount(41).tags(List.of("linen","home","cozy")).featured(false).build(),

                Product.builder().name("Ultralight Running Shoes").description("Carbon-plate running shoes weighing just 198g. Responsive ZoomX foam, engineered mesh upper, reflective details for night runs.")
                    .price(new BigDecimal("159.99")).originalPrice(new BigDecimal("199.99")).imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600")
                    .category("Footwear").brand("StrideMax").stock(38).rating(4.5).reviewCount(178).tags(List.of("running","lightweight","sport")).featured(false).build(),

                Product.builder().name("Portable Bluetooth Speaker").description("Waterproof IPX7 speaker with 360° sound. 24-hour playtime, USB-C fast charging. Pairs two for stereo mode.")
                    .price(new BigDecimal("69.99")).originalPrice(new BigDecimal("89.99")).imageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600")
                    .category("Electronics").brand("SoundCore").stock(80).rating(4.3).reviewCount(224).tags(List.of("speaker","bluetooth","portable")).featured(false).build(),

                Product.builder().name("Japanese Chef Knife 8\"").description("Hand-forged VG-10 steel blade with Damascus pattern. Pakka wood handle, 67 layers. Comes with magnetic sheath and care guide.")
                    .price(new BigDecimal("134.99")).imageUrl("https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600")
                    .category("Kitchen").brand("Kai Seki").stock(22).rating(4.9).reviewCount(156).tags(List.of("knife","japanese","cooking")).featured(false).build(),

                Product.builder().name("Wool Beanie").description("Merino wool beanie knitted in Scotland. Naturally moisture-wicking and odor-resistant. One size fits most. Unisex design.")
                    .price(new BigDecimal("34.99")).imageUrl("https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600")
                    .category("Clothing").brand("Highland").stock(200).rating(4.4).reviewCount(67).tags(List.of("wool","winter","accessories")).featured(false).build(),

                Product.builder().name("Plant-Based Protein Powder").description("Organic pea and rice protein blend, 25g per serving. No artificial sweeteners. Chocolate flavor. 30 servings per container.")
                    .price(new BigDecimal("42.99")).imageUrl("https://images.unsplash.com/photo-1593095948071-474c5cc2c4d8?w=600")
                    .category("Health").brand("GreenFuel").stock(90).rating(4.2).reviewCount(143).tags(List.of("protein","vegan","fitness")).featured(false).build(),

                Product.builder().name("Canvas Backpack").description("Waxed canvas backpack with leather trim. Padded 15\" laptop compartment, water-resistant finish. 25L capacity with hidden pockets.")
                    .price(new BigDecimal("98.00")).originalPrice(new BigDecimal("128.00")).imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600")
                    .category("Bags").brand("Heritage").stock(35).rating(4.6).reviewCount(88).tags(List.of("backpack","canvas","everyday")).featured(false).build(),

                Product.builder().name("Aromatherapy Diffuser").description("Ultrasonic essential oil diffuser with wood grain finish. 7 LED colors, auto shut-off, whisper-quiet operation. 300ml tank.")
                    .price(new BigDecimal("39.99")).imageUrl("https://images.unsplash.com/photo-1602928321679-560bb453f190?w=600")
                    .category("Home").brand("ZenAir").stock(70).rating(4.5).reviewCount(195).tags(List.of("diffuser","aromatherapy","relaxation")).featured(false).build()
            );

            productRepository.saveAll(products);
            log.info("Seeded {} products", products.size());
        }
    }
}
