-- Backfill deal_stage_history with current stages from all deal tables

-- Courses
INSERT INTO deal_stage_history (deal_record_id, contact_record_id, old_stage, new_stage, changed_at, changed_by, deal_type)
SELECT record_id, contact_record_id, NULL, stage, NOW(), NULL, 'course'
FROM course_deals
WHERE stage IS NOT NULL;

-- Seminars
INSERT INTO deal_stage_history (deal_record_id, contact_record_id, old_stage, new_stage, changed_at, changed_by, deal_type)
SELECT record_id, contact_record_id, NULL, stage, NOW(), NULL, 'seminar'
FROM seminars
WHERE stage IS NOT NULL;

-- Webinars
INSERT INTO deal_stage_history (deal_record_id, contact_record_id, old_stage, new_stage, changed_at, changed_by, deal_type)
SELECT record_id, contact_record_id, NULL, stage, NOW(), NULL, 'webinar'
FROM webinars
WHERE stage IS NOT NULL; 