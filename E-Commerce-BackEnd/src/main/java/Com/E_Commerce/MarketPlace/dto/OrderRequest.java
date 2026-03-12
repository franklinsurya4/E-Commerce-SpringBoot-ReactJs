package Com.E_Commerce.MarketPlace.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private String customerName;
    private String customerEmail;
    private String deliveryAddress;
    private Double totalAmount;
    private List<OrderItemDto> items;

    @Data
    public static class OrderItemDto {
        private Long    productId;
        private String  productName;
        private String  imageUrl;
        private Double  price;
        private Integer quantity;
        private String  category;
    }
}