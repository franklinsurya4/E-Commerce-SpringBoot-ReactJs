package Com.E_Commerce.MarketPlace.Controller;

import Com.E_Commerce.MarketPlace.Model.Product;
import Com.E_Commerce.MarketPlace.Service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // allow React frontend
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }


    // GET /api/products/category/electronics
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getByCategory(@PathVariable String category) {
        List<Product> products = service.getProductsByCategory(category);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public Product getProductDetails(@PathVariable Long id) {
        return service.getProductById(id);
    }

    // DELETE all products
    @DeleteMapping
    public ResponseEntity<String> deleteAll() {
        service.deleteAllProducts();
        return ResponseEntity.ok("All products deleted");
    }

    @PostMapping("/{category}/bulk")
    public ResponseEntity<List<Product>> addBulkProductsToCategory(
            @PathVariable String category,
            @RequestBody List<Product> products) {

        // Set the category for all products
        products.forEach(p -> p.setCategory(category));

        List<Product> saved = service.saveProducts(products);
        return ResponseEntity.ok(saved);
    }


}