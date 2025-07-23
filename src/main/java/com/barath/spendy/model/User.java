package com.barath.spendy.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")

public class User {

     @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
     private Integer id;

     @Column(nullable = false, unique = true, length = 50)
     private String username;

     @Column(nullable = false , unique = true, length = 100)
     private String email;

     @Column(nullable = false, length = 255)
     private String password;

     @Column(name = "created_at")
     private LocalDateTime createdAt;

     public User() {}

     public User(String username, String email, String password , LocalDateTime createdAt ) {
          this.username = username;
          this.email = email;
          this.password = password;
          this.createdAt = createdAt;
     }

     public Integer getId() { return id; }
     
     public String getUsername() { return username; }
     public void setUsername(String username) {this.username = username;}

     public String getEmail() { return email; }
     public void setEmail(String email) {this.email = email; }

     public String getPassword() { return password; }
     public void setpassword(String password) {this.password = password;}

     public LocalDateTime getCreatedAt() { return createdAt ;}
     public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt; }

     

}
