package Com.E_Commerce.MarketPlace.Repository;

import Com.E_Commerce.MarketPlace.Model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerEmailIgnoreCaseOrderByPlacedAtDesc(String email);
}