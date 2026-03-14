package Com.E_Commerce.MarketPlace.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponseDTO {

    private Long   id;
    private String email;

    private String name;
    private String phone;
    private String street;
    private String city;
    private String state;
    private String country;
    private String pincode;

    private Double latitude;
    private Double longitude;

    private String formattedAddress;   // "street, city, state - pincode"
    private String mapLink;            // Google Maps URL
}
