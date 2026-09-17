package com.example.inventory.service;

import com.example.inventory.model.Inventory;
import com.example.inventory.repository.InventoryRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class InventoryService {
    
    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public Inventory getStock(String productId) {
        return inventoryRepository.findByProductId(productId)
                .orElse(new Inventory(productId, 0, 0));
    }

    public Inventory addStock(String productId, Integer quantity) {
        Optional<Inventory> optionalInventory = inventoryRepository.findByProductId(productId);
        Inventory inventory;
        if (optionalInventory.isPresent()) {
            inventory = optionalInventory.get();
            inventory.setQuantity(inventory.getQuantity() + quantity);
        } else {
            inventory = new Inventory(productId, quantity, 0);
        }
        return inventoryRepository.save(inventory);
    }

    public Inventory deductStock(String productId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (inventory.getQuantity() - inventory.getReservedQty() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }
        
        inventory.setQuantity(inventory.getQuantity() - quantity);
        return inventoryRepository.save(inventory);
    }
}
