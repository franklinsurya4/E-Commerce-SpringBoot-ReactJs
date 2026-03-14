package Com.E_Commerce.MarketPlace.Controller;

import Com.E_Commerce.MarketPlace.Service.AddressService;
import Com.E_Commerce.MarketPlace.dto.AddressRequestDTO;
import Com.E_Commerce.MarketPlace.dto.AddressResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/address")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AddressController {

    private final AddressService addressService;

    // POST /api/address — Save new address
    @PostMapping
    public ResponseEntity<AddressResponseDTO> saveAddress(@RequestBody AddressRequestDTO dto) {
        return ResponseEntity.ok(addressService.saveAddress(dto));
    }

    // GET /api/address?email=xyz@gmail.com — Get all addresses for a user
    @GetMapping
    public ResponseEntity<List<AddressResponseDTO>> getAddresses(@RequestParam String email) {
        return ResponseEntity.ok(addressService.getAddressesByEmail(email));
    }

    // GET /api/address/{id} — Get single address
    @GetMapping("/{id}")
    public ResponseEntity<AddressResponseDTO> getAddressById(@PathVariable Long id) {
        return ResponseEntity.ok(addressService.getAddressById(id));
    }

    // PUT /api/address/{id} — Update address
    @PutMapping("/{id}")
    public ResponseEntity<AddressResponseDTO> updateAddress(
            @PathVariable Long id,
            @RequestBody AddressRequestDTO dto) {
        return ResponseEntity.ok(addressService.updateAddress(id, dto));
    }

    // DELETE /api/address/{id} — Delete address
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok("Address deleted successfully");
    }
}