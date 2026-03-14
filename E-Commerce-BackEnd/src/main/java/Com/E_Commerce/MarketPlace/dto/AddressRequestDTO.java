package Com.E_Commerce.MarketPlace.dto;

import lombok.Data;

@Data
public class AddressRequestDTO {

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
}
