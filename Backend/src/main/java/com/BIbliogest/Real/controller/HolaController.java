package com.BIbliogest.Real.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hola")
public class HolaController {

    @GetMapping
    public String saludar() {
        return "Hola desde Spring Boot!";
    }
}
