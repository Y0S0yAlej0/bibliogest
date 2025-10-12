package com.BIbliogest.Real.model;

public enum CategoriaLibro {
    SEMILLA("Semilla"),
    SEMILLA_2("Semilla 2"),
    REFERENCIA("Referencia"),
    OBRAS_GENERALES("Obras Generales"),
    FILOSOFIA("Filosofía"),
    SOCIALES("Sociales"),
    RELIGION("Religión"),
    LENGUAJE("Lenguaje"),
    CIENCIAS_PURAS("Ciencias Puras"),
    ARTES_RECREACION("Artes y Recreación"),
    LITERATURA("Literatura"),
    HISTORIA("Historia"),
    REVISTAS("Revistas"),
    DESCARTE("Descarte");

    private final String displayName;

    CategoriaLibro(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    // Método para obtener todas las categorías como array de strings
    public static String[] getAllDisplayNames() {
        CategoriaLibro[] categorias = values();
        String[] nombres = new String[categorias.length];
        for (int i = 0; i < categorias.length; i++) {
            nombres[i] = categorias[i].getDisplayName();
        }
        return nombres;
    }

    // Método para validar si una categoría es válida
    public static boolean isValid(String categoria) {
        if (categoria == null || categoria.trim().isEmpty()) {
            return false;
        }
        for (CategoriaLibro cat : values()) {
            if (cat.getDisplayName().equalsIgnoreCase(categoria.trim())) {
                return true;
            }
        }
        return false;
    }

    // Método para normalizar el nombre de la categoría
    public static String normalize(String categoria) {
        if (categoria == null) return null;
        for (CategoriaLibro cat : values()) {
            if (cat.getDisplayName().equalsIgnoreCase(categoria.trim())) {
                return cat.getDisplayName();
            }
        }
        return categoria; // Retornar original si no se encuentra
    }
}