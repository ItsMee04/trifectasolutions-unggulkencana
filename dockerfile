# Gunakan image PHP dengan Apache
FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm \
    libzip-dev \
    libmagickwand-dev \
    imagemagick

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Imagick PHP extension
RUN pecl install imagick && \
    docker-php-ext-enable imagick

# Enable Apache mod_rewrite (penting untuk Laravel)
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy existing application directory contents
COPY . /var/www/html

# Install PHP dependencies
RUN composer install --no-interaction --optimize-autoloader

# Install Node dependencies dan build Vue.js
RUN npm install && npm run production

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Generate key
RUN php artisan key:generate

# Copy Apache virtual host configuration
COPY laravel.conf /etc/apache2/sites-available/000-default.conf

# Enable mod_headers untuk security
RUN a2enmod headers

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
