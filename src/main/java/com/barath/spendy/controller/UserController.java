package com.barath.spendy.controller;

import com.barath.spendy.model.User;
import com.barath.spendy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

     @Autowired
     private UserRepository userRepository;

     // create a new user
     @PostMapping
     public User createUser(@RequestBody User user) {
          return userRepository.save(user);

     }

     @GetMapping
     public List<User> getAllUsers() {
          return userRepository.findAll();
     }

     // Get user by ID
     @GetMapping("/{id}")
     public Optional<User> getUserById(@PathVariable Integer id) {
          return userRepository.findById(id);
     }

     // Delete user by ID
     @DeleteMapping("/{id}")
     public void deleteUser(@PathVariable Integer id) {
          userRepository.deleteById(id);
     }
}
