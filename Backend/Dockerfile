# Usa la imagen de Java 17
FROM eclipse-temurin:17-jdk

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el .jar generado por Maven al contenedor
COPY target/*.jar app.jar

# Expone el puerto (Render usará automáticamente PORT)
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD ["java", "-jar", "app.jar"]
