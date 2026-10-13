-- =============================================================================
-- Migration: 001_identity_verification.sql
-- Description: Creates identity_verifications and identity_verification_attempts tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS identity_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started' 
        CHECK (status IN ('not_started', 'pending', 'in_progress', 'verified', 'failed', 'manual_review', 'cancelled')),
    verification_method VARCHAR(50), -- 'uidai_offline_ekyc_zip', 'uidai_offline_ekyc_xml', 'eaadhaar_pdf'
    document_type VARCHAR(50),       -- 'zip', 'xml', 'pdf'
    reference_id VARCHAR(100),       -- UIDAI referenceId or correlation ID
    masked_aadhaar VARCHAR(50),      -- e.g. 'XXXX-XXXX-4819'
    aadhaar_hash VARCHAR(100),       -- e.g. '#OK-82914' badge token
    name_matched BOOLEAN DEFAULT FALSE,
    extracted_name VARCHAR(255),
    name_match_score NUMERIC(5, 2),
    failure_reason TEXT,
    audit_notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_identity_verifications_user ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_status ON identity_verifications(status);

CREATE TABLE IF NOT EXISTS identity_verification_attempts (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES identity_verifications(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_size_bytes INTEGER,
    outcome VARCHAR(50) NOT NULL CHECK (outcome IN ('success', 'failed', 'rejected', 'manual_review')),
    error_code VARCHAR(100),
    error_message TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verification_attempts_user ON identity_verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_session ON identity_verification_attempts(session_id);
