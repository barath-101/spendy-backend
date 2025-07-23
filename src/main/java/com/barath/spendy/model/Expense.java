package com.barath.spendy.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.FetchType;

@Entity
@Table(name = "expenses")
public class Expense {

     @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Integer id;

     @ManyToOne(fetch = FetchType.EAGER)
     @JoinColumn(name = "user_id")
     private User user;

     private BigDecimal amount;

     private String description;

     @ManyToOne(fetch = FetchType.EAGER)
     @JoinColumn(name = "category_id")
     private ExpenseCategory category;

     @ManyToOne(fetch = FetchType.EAGER)
     @JoinColumn(name = "sub_category_id")
     private SubCategory subCategory;

     private LocalDateTime createdAt;
     private LocalDateTime updatedAt;

     // Getters and setters
     public Integer getId() {
          return id;
     }

     public void setId(Integer id) {
          this.id = id;
     }

     public User getUser() {
          return user;
     }

     public void setUser(User user) {
          this.user = user;
     }

     public BigDecimal getAmount() {
          return amount;
     }

     public void setAmount(BigDecimal amount) {
          this.amount = amount;
     }

     public String getDescription() {
          return description;
     }

     public void setDescription(String description) {
          this.description = description;
     }

     public ExpenseCategory getCategory() {
          return category;
     }

     public void setCategory(ExpenseCategory category) {
          this.category = category;
     }

     public SubCategory getSubCategory() {
          return subCategory;
     }

     public void setSubCategory(SubCategory subCategory) {
          this.subCategory = subCategory;
     }

     public LocalDateTime getCreatedAt() {
          return createdAt;
     }

     public void setCreatedAt(LocalDateTime createdAt) {
          this.createdAt = createdAt;
     }

     public LocalDateTime getUpdatedAt() {
          return updatedAt;
     }

     public void setUpdatedAt(LocalDateTime updatedAt) {
          this.updatedAt = updatedAt;
     }
}
