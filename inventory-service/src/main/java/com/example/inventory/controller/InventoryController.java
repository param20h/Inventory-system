package com.example.inventory.controller;

import com.example.inventory.model.Inventory;
import com.example.inventory.service.InventoryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    
    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{productId}")
    public Inventory getStock(@PathVariable String productId) {
        return inventoryService.getStock(productId);
    }

    @PostMapping("/add")
    public Inventory addStock(@RequestParam String productId, @RequestParam Integer quantity) {
        return inventoryService.addStock(productId, quantity);
    }

    @PostMapping("/deduct")
    public Inventory deductStock(@RequestParam String productId, @RequestParam Integer quantity) {
        return inventoryService.deductStock(productId, quantity);
    }
}
