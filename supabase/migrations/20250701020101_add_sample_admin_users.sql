
-- Insert sample admin users with simple passwords for testing
-- In production, these should use proper password hashing

INSERT INTO public.admin_users (username, password_hash, role) 
VALUES
('anas', 'eva919123', 'super_admin'),
('adminlocal', 'admin9094', 'local_admin'),
('adminuser', 'user123', 'user_admin')
ON CONFLICT (username) DO NOTHING;
