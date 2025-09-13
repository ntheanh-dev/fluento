# Custom MySQL image with Fluento schema
FROM mysql:8.0

# Copy initialization script
COPY 001_init_fluento_schema.sql /docker-entrypoint-initdb.d/

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=Admin@123
ENV MYSQL_DATABASE=fluento
ENV MYSQL_USER=app_user
ENV MYSQL_PASSWORD=Admin@123

# Expose port
EXPOSE 3306
