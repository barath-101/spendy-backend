package com.barath.spendy.controller;

import com.barath.spendy.model.ExpenseCategory;
import com.barath.spendy.repository.ExpenseCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class ExpenseCategoryController {

     @Autowired
     private ExpenseCategoryRepository categoryRepository;

     // 1. Get all categories
     @GetMapping
     public List<ExpenseCategory> getAllCategories() {
          return categoryRepository.findAll();
     }

     // 2. Add a new category (optional)
     @PostMapping
     public ExpenseCategory addCategory(@RequestBody ExpenseCategory category) {
          return categoryRepository.save(category);
     }
}
