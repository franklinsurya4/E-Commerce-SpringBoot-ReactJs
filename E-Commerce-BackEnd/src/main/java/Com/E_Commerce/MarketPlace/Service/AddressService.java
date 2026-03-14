package Com.E_Commerce.MarketPlace.Service;

import Com.E_Commerce.MarketPlace.Model.Address;
import Com.E_Commerce.MarketPlace.Repository.AddressRepository;
import Com.E_Commerce.MarketPlace.dto.AddressRequestDTO;
import Com.E_Commerce.MarketPlace.dto.AddressResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    // ── Save or Update ──────────────────────────────────────────
    public AddressResponseDTO saveAddress(AddressRequestDTO dto) {
        Address address = Address.builder()
                .email(dto.getEmail())
                .name(dto.getName())
                .phone(dto.getPhone())
                .street(dto.getStreet())
                .city(dto.getCity())
                .state(dto.getState())
                .country(dto.getCountry())
                .pincode(dto.getPincode())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .build();

        Address saved = addressRepository.save(address);
        return toResponse(saved);
    }

    // ── Get All by Email ────────────────────────────────────────
    public List<AddressResponseDTO> getAddressesByEmail(String email) {
        return addressRepository.findAllByEmail(email)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get Single by ID ────────────────────────────────────────
    public AddressResponseDTO getAddressById(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + id));
        return toResponse(address);
    }

    // ── Update ──────────────────────────────────────────────────
    public AddressResponseDTO updateAddress(Long id, AddressRequestDTO dto) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + id));

        address.setName(dto.getName());
        address.setPhone(dto.getPhone());
        address.setStreet(dto.getStreet());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setCountry(dto.getCountry());
        address.setPincode(dto.getPincode());
        address.setLatitude(dto.getLatitude());
        address.setLongitude(dto.getLongitude());

        Address updated = addressRepository.save(address);
        return toResponse(updated);
    }

    // ── Delete ──────────────────────────────────────────────────
    @Transactional
    public void deleteAddress(Long id) {
        if (!addressRepository.existsById(id)) {
            throw new RuntimeException("Address not found with id: " + id);
        }
        addressRepository.deleteById(id);
    }

    // ── Map to Response ─────────────────────────────────────────
    private AddressResponseDTO toResponse(Address a) {
        String formatted = String.format("%s, %s, %s - %s",
                a.getStreet(), a.getCity(), a.getState(), a.getPincode());

        String mapLink = (a.getLatitude() != null && a.getLongitude() != null)
                ? "https://www.google.com/maps?q=" + a.getLatitude() + "," + a.getLongitude()
                : null;

        return AddressResponseDTO.builder()
                .id(a.getId())
                .email(a.getEmail())
                .name(a.getName())
                .phone(a.getPhone())
                .street(a.getStreet())
                .city(a.getCity())
                .state(a.getState())
                .country(a.getCountry())
                .pincode(a.getPincode())
                .latitude(a.getLatitude())
                .longitude(a.getLongitude())
                .formattedAddress(formatted)
                .mapLink(mapLink)
                .build();
    }
}