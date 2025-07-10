CREATE TABLE deal_stage_history (
    id SERIAL PRIMARY KEY,
    deal_record_id VARCHAR NOT NULL,
    contact_record_id VARCHAR,
    old_stage VARCHAR,
    new_stage VARCHAR NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL,
    changed_by VARCHAR,
    deal_type VARCHAR,
    extra JSONB
);

CREATE INDEX idx_deal_stage_history_deal ON deal_stage_history(deal_record_id);
CREATE INDEX idx_deal_stage_history_contact ON deal_stage_history(contact_record_id);
CREATE INDEX idx_deal_stage_history_changed_at ON deal_stage_history(changed_at); 