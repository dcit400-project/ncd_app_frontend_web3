-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Clear all tables
TRUNCATE TABLE comment_records RESTART IDENTITY CASCADE;
TRUNCATE TABLE payment_records RESTART IDENTITY CASCADE;
TRUNCATE TABLE patient_records RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';
