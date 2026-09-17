package com.example.productservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "inventory-service", url = "${inventory-service.url:http://localhost:8083}")
public interface InventoryClient {

    @GetMapping("/api/inventory/{sku}")
    boolean isInStock(@PathVariable("sku") String sku);
}
