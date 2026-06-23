-- Add categories to expenses
ALTER TABLE expenses
ADD COLUMN category TEXT DEFAULT 'other';

-- Create index for filtering by category
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_group_category ON expenses(group_id, category);
