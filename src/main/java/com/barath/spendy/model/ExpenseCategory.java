package com.barath.spendy.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "expense_categories")
public class ExpenseCategory {

     @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Integer id;

     private String name;

     public Integer getId() {
          return id;
     }

     public String getName() {
          return name;
     }

     public void setId(Integer id) {
          this.id = id;
     }

     public void setName(String name) {
          this.name = name;
     }
}
