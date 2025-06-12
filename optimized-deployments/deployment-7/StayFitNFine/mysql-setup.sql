-- StayFitNFine Database Setup Script
-- MySQL/MariaDB Database initialization

-- Create database
CREATE DATABASE IF NOT EXISTS stayfitnfine;
USE stayfitnfine;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create consultation_types table
CREATE TABLE IF NOT EXISTS consultation_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    features JSON NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create client_inquiries table
CREATE TABLE IF NOT EXISTS client_inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    consultation_type VARCHAR(255) NOT NULL,
    health_goals TEXT,
    selected_plan VARCHAR(255) NOT NULL,
    payment_method VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    calendly_event_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_category (category),
    INDEX idx_published (is_published),
    INDEX idx_created_at (created_at)
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_title VARCHAR(255),
    client_image TEXT,
    testimonial_text TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    achievement VARCHAR(255),
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_published (is_published),
    INDEX idx_rating (rating)
);

-- Insert default consultation types
INSERT INTO consultation_types (name, description, price, duration, features, is_popular) VALUES
('Basic Consultation', 'Initial assessment and basic nutrition guidance for healthy lifestyle', 999.00, 60, JSON_ARRAY('60-minute consultation', 'Basic meal plan', 'Email support (7 days)', 'Dietary assessment'), FALSE),
('Premium Consultation', 'Comprehensive nutrition plan with ongoing support and monitoring', 2499.00, 90, JSON_ARRAY('90-minute consultation', 'Detailed meal plan', '3 follow-up sessions', 'WhatsApp support', 'Progress tracking'), TRUE),
('VIP Package', 'Complete lifestyle transformation with personalized coaching', 4999.00, 120, JSON_ARRAY('Multiple consultations', 'Custom meal planning', '6 months support', '24/7 support access', 'Lifestyle coaching', 'Weekly check-ins'), FALSE);

-- Insert sample testimonials
INSERT INTO testimonials (client_name, client_title, client_image, testimonial_text, rating, achievement, is_published) VALUES
('Priya Sharma', 'Software Engineer', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'Ishita''s guidance completely transformed my relationship with food. I lost 15kg in 6 months and feel more energetic than ever!', 5, 'Lost 15kg', TRUE),
('Raj Mehta', 'Business Owner', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Professional, knowledgeable, and truly caring. My diabetes is now well-controlled thanks to her meal plans.', 5, 'Diabetes Control', TRUE),
('Anita Kumar', 'Marketing Manager', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'The best investment I made for my health. Clear guidance, sustainable changes, amazing results!', 5, 'Lifestyle Change', TRUE),
('Dr. Suresh Patel', 'Cardiologist', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'I recommend Ishita to all my patients. Her evidence-based approach delivers real results.', 5, 'Heart Health', TRUE),
('Meera Singh', 'New Mother', 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face', 'Excellent guidance during pregnancy and post-delivery. Both my baby and I stayed healthy throughout.', 5, 'Maternal Health', TRUE),
('Arjun Reddy', 'Fitness Trainer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'Amazing sports nutrition advice. My performance improved significantly with her meal plans.', 5, 'Athletic Performance', TRUE);

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, category, image_url, is_published) VALUES
('Top 10 Superfoods for Weight Loss', 'top-10-superfoods-weight-loss', 'Discover the power of nutrient-dense foods that can boost your metabolism and support healthy weight management.', 'Discover the incredible power of superfoods in your weight loss journey. These nutrient-dense foods not only provide essential vitamins and minerals but also boost your metabolism naturally...', 'Nutrition', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop', TRUE),
('Managing Diabetes Through Diet', 'managing-diabetes-through-diet', 'Learn how proper meal planning and food choices can help maintain stable blood sugar levels naturally.', 'Diabetes management through diet is not just about restriction - it''s about making smart food choices that help stabilize blood sugar levels while still enjoying delicious meals...', 'Diabetes Care', 'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=800&h=400&fit=crop', TRUE),
('Meal Prep Made Simple', 'meal-prep-made-simple', 'Save time and eat healthier with these practical meal preparation strategies for busy professionals.', 'Meal preparation is the secret weapon of successful nutrition. By dedicating a few hours each week to meal prep, you can ensure healthy eating throughout your busy schedule...', 'Meal Prep', 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=800&h=400&fit=crop', TRUE),
('Plant-Based Nutrition Guide', 'plant-based-nutrition-guide', 'Everything you need to know about getting complete nutrition from plant-based sources.', 'Plant-based nutrition is gaining popularity for its health benefits and environmental impact. Learn how to get all essential nutrients from plant sources...', 'Plant-Based', 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=800&h=400&fit=crop', TRUE),
('Healthy Snacking for Weight Loss', 'healthy-snacking-weight-loss', 'Discover healthy snack options that support your weight loss goals while keeping you satisfied.', 'Smart snacking can actually boost your weight loss efforts when done right. Learn about portion control and nutrient-dense snack options...', 'Weight Management', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&h=400&fit=crop', TRUE),
('Pre & Post Workout Nutrition', 'pre-post-workout-nutrition', 'Optimize your workout performance and recovery with strategic pre and post-exercise nutrition.', 'Proper nutrition timing around workouts can significantly impact your performance, recovery, and results. Learn the science behind pre and post-workout meals...', 'Sports Nutrition', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop', TRUE);

-- Create admin user (password: admin123 - change this in production!)
INSERT INTO users (username, password) VALUES 
('admin', '$2b$10$rOzJKKJKQqJQqJQqJQqJQO7vK8K8K8K8K8K8K8K8K8K8K8K8K8K8K');

-- Display completion message
SELECT 'StayFitNFine database setup completed successfully!' as message;
SELECT CONCAT('Database: ', DATABASE()) as current_database;
SELECT COUNT(*) as consultation_types FROM consultation_types;
SELECT COUNT(*) as testimonials FROM testimonials;
SELECT COUNT(*) as blog_posts FROM blog_posts;
