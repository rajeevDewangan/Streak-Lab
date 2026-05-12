-- Optional seed for default categories. Run AFTER both users have signed up.
-- It uses the first profile it finds as the creator; cards are visible to both users.

with creator as (
  select id from public.profiles order by created_at asc limit 1
)
insert into public.categories (name, icon, color, goal, created_by)
select * from (values
  ('DSA',           'cpu',           '#7c5cff', 30, (select id from creator)),
  ('React',         'atom',          '#00d4ff', 20, (select id from creator)),
  ('English',       'mic',           '#f0883e', 15, (select id from creator)),
  ('Resume',        'file-text',     '#f85149', 5,  (select id from creator)),
  ('Backend',       'server',        '#2ea043', 20, (select id from creator)),
  ('System Design', 'workflow',      '#a371f7', 10, (select id from creator)),
  ('Projects',      'rocket',        '#db61a2', 15, (select id from creator)),
  ('Aptitude',      'calculator',    '#ffd60a', 10, (select id from creator))
) as t(name, icon, color, goal, created_by)
where not exists (select 1 from public.categories where name = t.name);
