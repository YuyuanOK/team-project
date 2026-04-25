package com.todoapp.backend.repository;

import com.todoapp.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserId(Long userId);
    List<Task> findByUserIdAndType(Long userId, String type);
    List<Task> findByUserIdAndCompleted(Long userId, boolean completed);
}