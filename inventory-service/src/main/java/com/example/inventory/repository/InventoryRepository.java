package com.example.inventory.repository;

import com.example.inventory.model.Inventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface InventoryRepository extends MongoRepository<Inventory, String> {
    Optional<Inventory> findByProductId(String productId);
}
