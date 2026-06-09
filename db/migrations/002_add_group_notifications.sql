-- Add group_notifications table
CREATE TABLE IF NOT EXISTS group_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_notifications_group_id ON group_notifications(group_id);
CREATE INDEX IF NOT EXISTS idx_group_notifications_created_at ON group_notifications(created_at);
