package com.barath.spendy.repository;

import com.barath.spendy.model.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubCategoryRepository extends JpaRepository<SubCategory, Integer> {
    List<SubCategory> findByCategoryId(Integer categoryId);
}
