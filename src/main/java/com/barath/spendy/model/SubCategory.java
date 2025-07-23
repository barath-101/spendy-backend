package com.barath.spendy.model;

import jakarta.persistence.*;

@Entity
@Table(name = "sub_categories")
public class SubCategory {

     @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Integer id;

     private String name;

     @ManyToOne
     @JoinColumn(name = "category_id")
     private ExpenseCategory category;

     public Integer getId() {
          return id;
     }

     public String getName() {
          return name;
     }

     public ExpenseCategory getCategory() {
          return category;
     }

     public void setId(Integer id) {
          this.id = id;
     }

     public void setName(String name) {
          this.name = name;
     }

     public void setCategory(ExpenseCategory category) {
          this.category = category;
     }
}
