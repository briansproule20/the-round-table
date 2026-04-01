-- Add per-member admin passwords
-- Each member gets their own password to access the admin panel
alter table members add column admin_password text;

-- Remove correct_index from anon access by using a view for quiz mode
-- (Questions table still has correct_index for server-side verification)
create or replace view quiz_questions as
  select id, member_id, question_text, options, "order", created_at
  from questions;

-- Grant anon access to the view
grant select on quiz_questions to anon, authenticated;
