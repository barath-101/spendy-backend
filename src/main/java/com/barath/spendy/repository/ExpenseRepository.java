package com.barath.spendy.repository;

import com.barath.spendy.model.Expense;
import com.barath.spendy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Integer> {
    List<Expense> findByUser(User user);
}
