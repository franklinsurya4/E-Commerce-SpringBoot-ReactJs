package com.aishop.service;

import com.aishop.dto.Dtos.*;
import com.aishop.exception.AppException;
import com.aishop.model.*;
import com.aishop.repository.CartItemRepository;
import com.aishop.repository.ProductRepository;
import com.aishop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.08");
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("50.00");
    private static final BigDecimal SHIPPING_COST = new BigDecimal("5.99");

    public CartSummary getCart(Long userId) {
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        List<CartItemDto> dtos = items.stream().map(this::toDto).collect(Collectors.toList());

        BigDecimal subtotal = dtos.stream()
                .map(CartItemDto::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : SHIPPING_COST;
        BigDecimal total = subtotal.add(tax).add(shipping);

        return CartSummary.builder()
                .items(dtos).subtotal(subtotal).tax(tax)
                .shipping(shipping).total(total)
                .itemCount(items.stream().mapToInt(CartItem::getQuantity).sum())
                .build();
    }

    public CartItemDto addToCart(Long userId, AddToCartRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException("Product not found"));

        if (product.getStock() < request.getQuantity()) {
            throw new AppException("Not enough stock available");
        }

        var existing = cartItemRepository.findByUserIdAndProductId(userId, request.getProductId());
        CartItem cartItem;
        if (existing.isPresent()) {
            cartItem = existing.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            cartItem = CartItem.builder()
                    .user(user).product(product)
                    .quantity(request.getQuantity())
                    .selectedSize(request.getSelectedSize())
                    .selectedColor(request.getSelectedColor())
                    .build();
        }
        return toDto(cartItemRepository.save(cartItem));
    }

    public CartItemDto updateQuantity(Long userId, Long itemId, int quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new AppException("Cart item not found"));
        if (!item.getUser().getId().equals(userId)) throw new AppException("Unauthorized");
        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return null;
        }
        item.setQuantity(quantity);
        return toDto(cartItemRepository.save(item));
    }

    @Transactional
    public void removeItem(Long userId, Long itemId) {
        cartItemRepository.deleteByIdAndUserId(itemId, userId);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    public int getCartCount(Long userId) {
        return cartItemRepository.countByUserId(userId);
    }

    private CartItemDto toDto(CartItem item) {
        BigDecimal lineTotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return CartItemDto.builder()
                .id(item.getId())
                .product(productService.toDto(item.getProduct()))
                .quantity(item.getQuantity())
                .selectedSize(item.getSelectedSize())
                .selectedColor(item.getSelectedColor())
                .lineTotal(lineTotal)
                .build();
    }
}
