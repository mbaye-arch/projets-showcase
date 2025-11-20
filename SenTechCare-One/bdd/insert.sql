INSERT INTO roles (name) VALUES
('ADMIN'),
('MANAGER'),
('TECHNICIAN'),
('ACCOUNTANT'),
('SUPPORT')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (first_name, last_name, email, password, phone, active, role_id)
SELECT
  'Super',
  'Admin',
  'admin@sentechcare.one',
  '$2y$12$BrPppmzTEjK5jPtPTRZogOJbpihx8MOUfJrfXRVZkgOr8S08iQrCm',
  NULL,
  1,
  r.id
FROM roles r
WHERE r.name = 'ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.email = 'admin@sentechcare.one'
  );
