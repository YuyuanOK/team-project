package com.todoapp.backend.repository;

import com.todoapp.backend.model.CalendarTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;

@Repository
public interface CalendarTaskRepository extends JpaRepository<CalendarTask, Long> {
    List<CalendarTask> findByUserId(Long userId);
    List<CalendarTask> findByUserIdAndDate(Long userId, LocalDate date);
    List<CalendarTask> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}