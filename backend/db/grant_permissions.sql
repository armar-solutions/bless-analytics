-- Grant read access to all relevant tables
GRANT SELECT ON TABLE deal_stage_history TO analytics_user;
GRANT SELECT ON TABLE course_deals TO analytics_user;
GRANT SELECT ON TABLE seminars TO analytics_user;
GRANT SELECT ON TABLE webinars TO analytics_user;

-- (Optional) Allow writing to deal_stage_history if you want to record history from the app
-- GRANT INSERT, UPDATE, DELETE ON TABLE deal_stage_history TO analytics_user;

-- (Optional) Grant usage on the schema if not public
-- GRANT USAGE ON SCHEMA public TO analytics_user;

-- (Optional) Grant connect on the database
-- GRANT CONNECT ON DATABASE influencer_analytics TO analytics_user; 