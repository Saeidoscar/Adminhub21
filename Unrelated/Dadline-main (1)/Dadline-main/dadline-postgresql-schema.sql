-- ============================================================================
-- Dadline — PostgreSQL 17 Schema (v1)

-- 2.5. سایت اختصاصی وکیل/کارشناس (دامنه‌ی مستقل هر vendor)
-- ============================================================================
CREATE TABLE vendor_sites (
  user_id             BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  domain              VARCHAR(255) UNIQUE,
  domain_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  site_name           TEXT,
  favicon             TEXT,
  logo                TEXT,
  theme_id            VARCHAR(50),
  primary_color       VARCHAR(20),
  font                VARCHAR(50),
  banner_img          TEXT,
  about_text          TEXT,
  phone_public        VARCHAR(20),
  address             VARCHAR(255),
  social_links        JSONB,  -- {"instagram":..,"linkedin":..,"telegram":..}
  seo_title           VARCHAR(255),
  seo_description     VARCHAR(500),
  og_image            TEXT,
  google_analytics_id VARCHAR(50),
  meta_data           JSONB,   -- {"bill":..,"petition":..,"statement":..,"complaint":..,"contract":..}
  plan_type           VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  expires_at          TIMESTAMPTZ,
  visits_count        BIGINT NOT NULL DEFAULT 0,
  status              VARCHAR(12) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'active', 'suspended', 'holiday')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_vendor_sites_domain ON vendor_sit
