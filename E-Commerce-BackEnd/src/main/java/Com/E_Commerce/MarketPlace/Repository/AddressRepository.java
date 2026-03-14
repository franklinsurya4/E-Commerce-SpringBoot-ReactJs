package Com.E_Commerce.MarketPlace.Repository;

import Com.E_Commerce.MarketPlace.Model.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findAllByEmail(String email);
    Optional<Address> findByEmailAndId(String email, Long id);
    void deleteByEmailAndId(String email, Long id);
}
