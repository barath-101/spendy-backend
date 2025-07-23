
package com.barath.spendy.controller;

import com.barath.spendy.model.SubCategory;
import com.barath.spendy.repository.SubCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcategories")
public class SubCategoryController {

     @Autowired
     private SubCategoryRepository subCategoryRepository;

     // Get all subcategories
     @GetMapping
     public List<SubCategory> getAllSubCategories() {
          return subCategoryRepository.findAll();
     }

     // Get subcategories by category ID
     @GetMapping("/category/{categoryId}")
     public List<SubCategory> getSubCategoriesByCategory(@PathVariable Integer categoryId) {
          return subCategoryRepository.findByCategoryId(categoryId);
     }

     // Add subcategory (optional)
     @PostMapping
     public SubCategory addSubCategory(@RequestBody SubCategory subCategory) {
          return subCategoryRepository.save(subCategory);
     }
}
