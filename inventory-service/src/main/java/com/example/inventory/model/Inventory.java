package com.example.inventory.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "inventory")
public class Inventory {
    
    @Id
    private String id;
    private String productId;
    private Integer quantity;
    private Integer reservedQty;

    public Inventory() {}

    public Inventory(String productId, Integer quantity, Integer reservedQty) {
        this.productId = productId;
        this.quantity = quantity;
        this.reservedQty = reservedQty;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getReservedQty() {
        return reservedQty;
    }

    public void setReservedQty(Integer reservedQty) {
        this.reservedQty = reservedQty;
    }
}
