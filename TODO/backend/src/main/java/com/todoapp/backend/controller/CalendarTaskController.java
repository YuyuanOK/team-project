package com.todoapp.backend.controller;

import com.todoapp.backend.model.CalendarTask;
import com.todoapp.backend.repository.CalendarTaskRepository;
import com.todoapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/calendar")
public class CalendarTaskController {

    @Autowired
    private CalendarTaskRepository calendarTaskRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CalendarTask>> getCalendarTasks() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Long userId = userRepository.findByUsername(username).get().getId();

        List<CalendarTask> tasks = calendarTaskRepository.findByUserId(userId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<CalendarTask>> getCalendarTasksByDate(@PathVariable String date) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Long userId = userRepository.findByUsername(username).get().getId();

        LocalDate localDate = LocalDate.parse(date);
        List<CalendarTask> tasks = calendarTaskRepository.findByUserIdAndDate(userId, localDate);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<CalendarTask> createCalendarTask(@RequestBody CalendarTask task) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        task.setUser(userRepository.findByUsername(username).get());

        CalendarTask savedTask = calendarTaskRepository.save(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CalendarTask> updateCalendarTask(@PathVariable Long id, @RequestBody CalendarTask task) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Long userId = userRepository.findByUsername(username).get().getId();

        CalendarTask existingTask = calendarTaskRepository.findById(id).orElse(null);
        if (existingTask == null || !existingTask.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        existingTask.setTitle(task.getTitle());
        existingTask.setDate(task.getDate());

        CalendarTask updatedTask = calendarTaskRepository.save(existingTask);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCalendarTask(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Long userId = userRepository.findByUsername(username).get().getId();

        CalendarTask task = calendarTaskRepository.findById(id).orElse(null);
        if (task == null || !task.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        calendarTaskRepository.delete(task);
        return ResponseEntity.ok("Calendar task deleted successfully");
    }
}