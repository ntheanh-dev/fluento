# MySQL Dockerfile for Fluento application
FROM mysql:8.0

# Expose MySQL port
EXPOSE 3306

# Set working directory
WORKDIR /var/lib/mysql

# Create necessary directories
RUN mkdir -p /var/lib/mysql/fluento

# Set proper permissions
RUN chown -R mysql:mysql /var/lib/mysql

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD mysqladmin ping -h localhost || exit 1

# Use the default MySQL entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["mysqld"]
