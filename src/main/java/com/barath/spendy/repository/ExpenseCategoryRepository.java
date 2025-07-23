package com.barath.spendy.repository;

import com.barath.spendy.model.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Integer> {

}
