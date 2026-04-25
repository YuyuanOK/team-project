package com.todoapp.backend.controller;

import com.todoapp.backend.model.FocusHistory;
import com.todoapp.backend.repository.FocusHistoryRepository;
import com.todoapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/focus")
public class FocusHistoryController {

    @Autowired
    private FocusHistoryRepository focusHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<FocusHistory>> getFocusHistories() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Long userId = userRepository.findByUsername(username).get().getId();

        List<FocusHistory> histories = focusHistoryRepository.findByUserId(userId);
        return ResponseEntity.ok(histories);
    }

    @PostMapping
    public ResponseEntity<FocusHistory> createFocusHistory(@RequestBody FocusHistory history) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        history.setUser(userRepository.findByUsername(username).get());

        // 计算持续时间（分钟）
        int duration = (int) (history.getEndTime().getHour() * 60 + history.getEndTime().getMinute()
                - history.getStartTime().getHour() * 60 - history.getStartTime().getMinute());
        history.setDuration(duration);

        FocusHistory savedHistory = focusHistoryRepository.save(history);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedHistory);
    }
}