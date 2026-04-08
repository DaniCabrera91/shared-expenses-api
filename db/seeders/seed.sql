-- Users
INSERT INTO users (first_name, last_name, alias, email, password_hash)
VALUES
('Daniel', 'Cabrera', 'danitxu', 'dani@example.com', '$2b$10$jLapfZF4XxSmdKO/LZhK3OU/Ghu.RLH24W5GId.0QN96cQnXl/Wk.'),
('Borja', 'García', 'borja', 'borja@example.com', '$2b$10$jLapfZF4XxSmdKO/LZhK3OU/Ghu.RLH24W5GId.0QN96cQnXl/Wk.'),
('Carmen', 'Pérez', 'carmen', 'carmen@example.com', '$2b$10$jLapfZF4XxSmdKO/LZhK3OU/Ghu.RLH24W5GId.0QN96cQnXl/Wk.')
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  alias = EXCLUDED.alias,
  password_hash = EXCLUDED.password_hash;

-- Groups
INSERT INTO groups (name, emoji, currency, created_by)
SELECT 'Vacaciones', '🏖️', 'EUR', id FROM users WHERE email = 'dani@example.com'
ON CONFLICT (name, created_by) DO UPDATE SET emoji = EXCLUDED.emoji, currency = EXCLUDED.currency;

-- Group members
INSERT INTO group_members (group_id, user_id, role)
SELECT g.id, u.id,
  CASE
    WHEN u.email = 'dani@example.com' THEN 'admin'::member_role
    ELSE 'member'::member_role
  END
FROM groups g
CROSS JOIN users u
WHERE g.name = 'Vacaciones'
  AND u.email IN ('dani@example.com', 'borja@example.com', 'carmen@example.com')
ON CONFLICT (group_id, user_id) DO UPDATE SET role = EXCLUDED.role;

-- Expenses
INSERT INTO expenses (group_id, paid_by, created_by, description, total_amount, currency)
SELECT g.id, u.id, u.id, 'Alquiler apartamento', 600.00, 'EUR'
FROM groups g, users u
WHERE g.name = 'Vacaciones' AND u.email = 'dani@example.com'
ON CONFLICT (group_id, description, created_by) DO UPDATE SET
  paid_by = EXCLUDED.paid_by,
  total_amount = EXCLUDED.total_amount,
  currency = EXCLUDED.currency;

INSERT INTO expenses (group_id, paid_by, created_by, description, total_amount, currency)
SELECT g.id, u.id, u.id, 'Supermercado', 150.00, 'EUR'
FROM groups g, users u
WHERE g.name = 'Vacaciones' AND u.email = 'borja@example.com'
ON CONFLICT (group_id, description, created_by) DO UPDATE SET
  paid_by = EXCLUDED.paid_by,
  total_amount = EXCLUDED.total_amount,
  currency = EXCLUDED.currency;

-- Expense shares
INSERT INTO expense_shares (expense_id, user_id, amount_owed)
SELECT e.id, u.id, 200.00
FROM expenses e
CROSS JOIN users u
WHERE e.description = 'Alquiler apartamento'
  AND u.email IN ('dani@example.com', 'borja@example.com', 'carmen@example.com')
ON CONFLICT (expense_id, user_id) DO UPDATE SET amount_owed = EXCLUDED.amount_owed;

INSERT INTO expense_shares (expense_id, user_id, amount_owed)
SELECT e.id, u.id, 50.00
FROM expenses e
CROSS JOIN users u
WHERE e.description = 'Supermercado'
  AND u.email IN ('dani@example.com', 'borja@example.com', 'carmen@example.com')
ON CONFLICT (expense_id, user_id) DO UPDATE SET amount_owed = EXCLUDED.amount_owed;