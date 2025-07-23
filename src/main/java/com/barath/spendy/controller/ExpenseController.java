package com.barath.spendy.controller;

import com.barath.spendy.model.Expense;
import com.barath.spendy.model.ExpenseCategory;
import com.barath.spendy.model.SubCategory;
import com.barath.spendy.model.User;
import com.barath.spendy.repository.ExpenseRepository;
import com.barath.spendy.repository.UserRepository;
import com.barath.spendy.repository.CategoryRepository;
import com.barath.spendy.repository.SubCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    // Create a new expense
    @PostMapping
    public Expense createExpense(@RequestBody Expense expense) {
        expense.setCreatedAt(LocalDateTime.now());
        expense.setUpdatedAt(LocalDateTime.now());

        // Fetch full User object
        User user = userRepository.findById(expense.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        expense.setUser(user);

        // Fetch full Category object
        ExpenseCategory category = categoryRepository.findById(expense.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        expense.setCategory(category);

        // Fetch full SubCategory object
        SubCategory subCategory = subCategoryRepository.findById(expense.getSubCategory().getId())
                .orElseThrow(() -> new RuntimeException("SubCategory not found"));
        expense.setSubCategory(subCategory);

        return expenseRepository.save(expense);
    }

    // Get all expenses by userId
    @GetMapping("/user/{userId}")
    public List<Expense> getExpensesByUser(@PathVariable Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.map(expenseRepository::findByUser).orElse(null);
    }
}
