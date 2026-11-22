-- 001_initial_cloud_schema.sql
-- Production Cloud Schema for Supabase PostgreSQL
-- Covers projects, versioned canonical models, Pascal 3D scenes, storage artifacts, and async export jobs.

-- 1. Helper function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'archived')),
    active_version_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Project Versions (Snapshots of Canonical Building Model)
CREATE TABLE IF NOT EXISTS project_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    canonical_building JSONB NOT NULL,
    archlang_dsl TEXT,
    locked_room_ids TEXT[] NOT NULL DEFAULT '{}',
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai_generation', 'ai_edit', 'repair', 'import')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_version UNIQUE (project_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id);

-- Optional circular foreign key for active_version_id
ALTER TABLE projects
    DROP CONSTRAINT IF EXISTS fk_projects_active_version,
    ADD CONSTRAINT fk_projects_active_version
    FOREIGN KEY (active_version_id)
    REFERENCES project_versions(id)
    ON DELETE SET NULL;

-- 4. Pascal 3D Scenes (Flat scene graphs derived/edited from canonical model)
CREATE TABLE IF NOT EXISTS pascal_scenes (
    project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    scene_json JSONB NOT NULL,
    warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_pascal_scenes_updated_at
    BEFORE UPDATE ON pascal_scenes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Artifacts Metadata (Generated DWG, DXF, PDF, SVG, ArchLang, IFC, GLB)
CREATE TABLE IF NOT EXISTS artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version_id UUID REFERENCES project_versions(id) ON DELETE SET NULL,
    kind TEXT NOT NULL,
    format TEXT NOT NULL,
    storage_provider TEXT NOT NULL DEFAULT 'local' CHECK (storage_provider IN ('local', 'r2')),
    storage_key TEXT NOT NULL,
    sha256 TEXT NOT NULL,
    byte_size BIGINT NOT NULL,
    manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_project_id ON artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_storage_key ON artifacts(storage_key);
CREATE INDEX IF NOT EXISTS idx_artifacts_kind ON artifacts(kind);

-- 6. Export Jobs (Asynchronous queue tracking for Linux & Windows Workers)
CREATE TABLE IF NOT EXISTS export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    queue_name TEXT NOT NULL CHECK (queue_name IN ('ai-and-light-exports', 'windows-native-cad')),
    job_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'active', 'completed', 'failed', 'cancelled')),
    progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_jobs_project_id ON export_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_queue ON export_jobs(queue_name);

CREATE TRIGGER update_export_jobs_updated_at
    BEFORE UPDATE ON export_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Row-Level Security (RLS) Configuration

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pascal_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- 7.1 Service-Role Bypass (Full access for backend workers & internal APIs)
CREATE POLICY "service_role_bypass_projects" ON projects FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_project_versions" ON project_versions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_pascal_scenes" ON pascal_scenes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_artifacts" ON artifacts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_bypass_export_jobs" ON export_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7.2 User Ownership Policies (Scoped to authenticated owner: auth.uid())

-- projects
CREATE POLICY "owner_select_projects" ON projects FOR SELECT TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "owner_insert_projects" ON projects FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "owner_update_projects" ON projects FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "owner_delete_projects" ON projects FOR DELETE TO authenticated
    USING (auth.uid() = owner_id);

-- project_versions
CREATE POLICY "owner_select_project_versions" ON project_versions FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_versions.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "owner_insert_project_versions" ON project_versions FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_versions.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "owner_update_project_versions" ON project_versions FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_versions.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "owner_delete_project_versions" ON project_versions FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_versions.project_id AND projects.owner_id = auth.uid()));

-- pascal_scenes
CREATE POLICY "owner_select_pascal_scenes" ON pascal_scenes FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = pascal_scenes.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "owner_insert_pascal_scenes" ON pascal_scenes FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = pascal_scenes.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "owner_update_pascal_scenes" ON pascal_scenes FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = pascal_scenes.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "owner_delete_pascal_scenes" ON pascal_scenes FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = pascal_scenes.project_id AND projects.owner_id = auth.uid()));

-- artifacts
CREATE POLICY "owner_select_artifacts" ON artifacts FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = artifacts.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "owner_delete_artifacts" ON artifacts FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = artifacts.project_id AND projects.owner_id = auth.uid()));

-- export_jobs
CREATE POLICY "owner_select_export_jobs" ON export_jobs FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = export_jobs.project_id AND projects.owner_id = auth.uid()));

CREATE POLICY "owner_insert_export_jobs" ON export_jobs FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = export_jobs.project_id AND projects.owner_id = auth.uid()));
