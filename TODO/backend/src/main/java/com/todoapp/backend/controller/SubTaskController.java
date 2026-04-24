package com.todoapp.backend.controller;

import com.todoapp.backend.model.SubTask;
import com.todoapp.backend.model.Task;
import com.todoapp.backend.repository.TaskRepository;
import com.todoapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/subtasks")
public class SubTaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/task/{taskId}")
    public ResponseEntity<SubTask> createSubTask(@PathVariable Long taskId, @RequestBody SubTask subTask) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Long userId = userRepository.findByUsername(username).get().getId();

        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null || !task.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        subTask.setTask(task);
        task.getSubtasks().add(subTask);

        Task updatedTask = taskRepository.save(task);
        SubTask savedSubTask = updatedTask.getSubtasks().get(updatedTask.getSubtasks().size() - 1);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedSubTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubTask> updateSubTask(@PathVariable Long id, @RequestBody SubTask subTask) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Long userId = userRepository.findByUsername(username).get().getId();

        // 查找包含该子任务的任务
        Task task = taskRepository.findAll().stream()
                .filter(t -> t.getSubtasks().stream().anyMatch(st -> st.getId().equals(id)))
                .findFirst().orElse(null);

        if (task == null || !task.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // 查找并更新子任务
        SubTask existingSubTask = task.getSubtasks().stream()
                .filter(st -> st.getId().equals(id))
                .findFirst().orElse(null);

        if (existingSubTask == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        existingSubTask.setText(subTask.getText());
        existingSubTask.setCompleted(subTask.isCompleted());

        Task updatedTask = taskRepository.save(task);
        SubTask updatedSubTask = updatedTask.getSubtasks().stream()
                .filter(st -> st.getId().equals(id))
                .findFirst().orElse(null);

        return ResponseEntity.ok(updatedSubTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubTask(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Long userId = userRepository.findByUsername(username).get().getId();

        // 查找包含该子任务的任务
        Task task = taskRepository.findAll().stream()
                .filter(t -> t.getSubtasks().stream().anyMatch(st -> st.getId().equals(id)))
                .findFirst().orElse(null);

        if (task == null || !task.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // 查找并删除子任务
        SubTask subTaskToDelete = task.getSubtasks().stream()
                .filter(st -> st.getId().equals(id))
                .findFirst().orElse(null);

        if (subTaskToDelete == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        task.getSubtasks().remove(subTaskToDelete);
        taskRepository.save(task);

        return ResponseEntity.ok("Subtask deleted successfully");
    }
}