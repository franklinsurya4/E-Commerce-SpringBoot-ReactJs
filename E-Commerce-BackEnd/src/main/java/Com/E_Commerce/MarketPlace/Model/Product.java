package Com.E_Commerce.MarketPlace.Model;

import jakarta.persistence.*;;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500)       // URLs can be long
    private String name;

    private String category;
    private double price;
    private int stock;

    @Column(length = 1000)      // image URLs can be very long
    private String image;

    // Electronics-specific
    @ElementCollection
    private List<String> variants;
    private String offers;

    // Sports/Fashion
    @ElementCollection
    private List<String> sizes;
    private String material;

    // Jewelry-specific
    private String purity;
}