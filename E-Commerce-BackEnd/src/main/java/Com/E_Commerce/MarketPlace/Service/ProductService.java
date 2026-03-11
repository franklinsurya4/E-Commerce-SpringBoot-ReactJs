package Com.E_Commerce.MarketPlace.Service;

import Com.E_Commerce.MarketPlace.Model.Product;
import Com.E_Commerce.MarketPlace.Repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public Product getProductById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found with id: " + id
                ));
    }

    public List<Product> getProductsByCategory(String category) {
        return repository.findByCategoryIgnoreCase(category);
    }

    public List<Product> saveProducts(List<Product> products) {
        return repository.saveAll(products);
    }

    public void deleteAllProducts() {
        repository.deleteAll();
    }
}