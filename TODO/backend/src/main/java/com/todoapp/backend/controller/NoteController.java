package com.todoapp.backend.controller;

import com.todoapp.backend.model.Note;
import com.todoapp.backend.repository.NoteRepository;
import com.todoapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Note>> getNotes() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Long userId = userRepository.findByUsername(username).get().getId();

        List<Note> notes = noteRepository.findByUserId(userId);
        return ResponseEntity.ok(notes);
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody Note note) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        note.setUser(userRepository.findByUsername(username).get());

        Note savedNote = noteRepository.save(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedNote);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note note) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Long userId = userRepository.findByUsername(username).get().getId();

        Note existingNote = noteRepository.findById(id).orElse(null);
        if (existingNote == null || !existingNote.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        existingNote.setTitle(note.getTitle());
        existingNote.setContent(note.getContent());

        Note updatedNote = noteRepository.save(existingNote);
        return ResponseEntity.ok(updatedNote);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Long userId = userRepository.findByUsername(username).get().getId();

        Note note = noteRepository.findById(id).orElse(null);
        if (note == null || !note.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        noteRepository.delete(note);
        return ResponseEntity.ok("Note deleted successfully");
    }
}