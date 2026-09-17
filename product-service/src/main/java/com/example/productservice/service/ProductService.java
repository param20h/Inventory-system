package com.example.productservice.service;

import com.example.productservice.client.InventoryClient;
import com.example.productservice.model.Product;
import com.example.productservice.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryClient inventoryClient;

    public ProductService(ProductRepository productRepository, InventoryClient inventoryClient) {
        this.productRepository = productRepository;
        this.inventoryClient = inventoryClient;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Product productDetails) {
        return productRepository.findById(id).map(product -> {
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setSku(productDetails.getSku());
            product.setPrice(productDetails.getPrice());
            product.setCategory(productDetails.getCategory());
            return productRepository.save(product);
        }).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    public boolean checkProductInStock(String sku) {
        return inventoryClient.isInStock(sku);
    }
}
