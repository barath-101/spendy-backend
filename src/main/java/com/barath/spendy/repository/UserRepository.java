package com.barath.spendy.repository;

import com.barath.spendy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional ;


public interface UserRepository extends JpaRepository<User, Integer> {
     Optional<User> findByUsername(String username);
     Optional<User> findByEmail(String email);
}
