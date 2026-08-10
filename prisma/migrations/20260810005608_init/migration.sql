-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "MediaProvider" AS ENUM ('CLOUDINARY', 'LOCAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('OPEN_TO_WORK', 'FREELANCE', 'BUSY', 'HIDDEN');

-- CreateEnum
CREATE TYPE "CategoryKind" AS ENUM ('TECH', 'PROJECT');

-- CreateEnum
CREATE TYPE "Proficiency" AS ENUM ('BASICS', 'GOOD_KNOWLEDGE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('COMPLETED', 'IN_PROGRESS', 'MAINTAINED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectImageKind" AS ENUM ('SCREENSHOT', 'DIAGRAM', 'MOCKUP', 'LOGO');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('INTERNSHIP', 'APPRENTICESHIP', 'FULL_TIME', 'PART_TIME', 'FREELANCE', 'PROJECT');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('ONSITE', 'HYBRID', 'REMOTE');

-- CreateEnum
CREATE TYPE "EducationStatus" AS ENUM ('COMPLETED', 'PENDING_DIPLOMA', 'ONGOING');

-- CreateEnum
CREATE TYPE "StatSource" AS ENUM ('PROJECTS_COUNT', 'TECHNOLOGIES_COUNT', 'EXPERIENCES_COUNT', 'CERTIFICATIONS_COUNT', 'ACHIEVEMENTS_COUNT', 'SKILLS_COUNT', 'YEARS_SINCE_START', 'MANUAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "avatarUrl" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "provider" "MediaProvider" NOT NULL DEFAULT 'CLOUDINARY',
    "publicId" TEXT,
    "alt" TEXT NOT NULL DEFAULT '',
    "caption" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "mime" TEXT,
    "bytes" INTEGER,
    "folder" TEXT NOT NULL DEFAULT 'general',
    "blurHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL DEFAULT 'profile',
    "fullName" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "subline" TEXT,
    "tagline" TEXT,
    "bioShort" TEXT,
    "bioLong" TEXT,
    "location" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "avatarId" TEXT,
    "cvUrl" TEXT,
    "cvLabel" TEXT DEFAULT 'Télécharger mon CV',
    "cvUpdatedAt" TIMESTAMP(3),
    "availability" "Availability" NOT NULL DEFAULT 'OPEN_TO_WORK',
    "availabilityLabel" TEXT,
    "careerStartYear" INTEGER,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageId" TEXT,
    "i18n" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "iconKey" TEXT,
    "inHero" BOOLEAN NOT NULL DEFAULT true,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qualities" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "iconKey" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "qualities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "percent" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "kind" "CategoryKind" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "iconKey" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technologies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT,
    "iconKey" TEXT,
    "logoId" TEXT,
    "color" TEXT,
    "url" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT,
    "technologyId" TEXT,
    "proficiency" "Proficiency" NOT NULL DEFAULT 'GOOD_KNOWLEDGE',
    "percent" INTEGER,
    "iconKey" TEXT,
    "description" TEXT,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "summary" TEXT NOT NULL,
    "categoryId" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'COMPLETED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "year" INTEGER,
    "role" TEXT,
    "teamSize" INTEGER,
    "client" TEXT,
    "context" TEXT,
    "coverId" TEXT,
    "demoUrl" TEXT,
    "repoUrl" TEXT,
    "docUrl" TEXT,
    "overview" TEXT,
    "problem" TEXT,
    "solution" TEXT,
    "architecture" TEXT,
    "results" TEXT,
    "learnings" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "i18n" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_technologies" (
    "projectId" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_technologies_pkey" PRIMARY KEY ("projectId","technologyId")
);

-- CreateTable
CREATE TABLE "project_features" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "iconKey" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_challenges" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_metrics" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "iconKey" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_images" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "kind" "ProjectImageKind" NOT NULL DEFAULT 'SCREENSHOT',
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'INTERNSHIP',
    "workMode" "WorkMode",
    "location" TEXT,
    "companyUrl" TEXT,
    "logoId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "i18n" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_highlights" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "experience_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_technologies" (
    "experienceId" TEXT NOT NULL,
    "technologyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "experience_technologies_pkey" PRIMARY KEY ("experienceId","technologyId")
);

-- CreateTable
CREATE TABLE "education" (
    "id" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT,
    "grade" TEXT,
    "mention" TEXT,
    "honors" TEXT,
    "status" "EducationStatus" NOT NULL DEFAULT 'COMPLETED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "schoolUrl" TEXT,
    "logoId" TEXT,
    "description" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "i18n" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "description" TEXT,
    "imageId" TEXT,
    "fileUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "organisation" TEXT,
    "date" TIMESTAMP(3),
    "year" INTEGER,
    "url" TEXT,
    "iconKey" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconKey" TEXT,
    "features" TEXT[],
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stat_cards" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "source" "StatSource" NOT NULL,
    "manualValue" INTEGER,
    "prefix" TEXT,
    "suffix" TEXT,
    "iconKey" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stat_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "media_folder_idx" ON "media"("folder");

-- CreateIndex
CREATE INDEX "media_createdAt_idx" ON "media"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "social_links_platform_key" ON "social_links"("platform");

-- CreateIndex
CREATE INDEX "social_links_order_idx" ON "social_links"("order");

-- CreateIndex
CREATE INDEX "qualities_order_idx" ON "qualities"("order");

-- CreateIndex
CREATE INDEX "languages_order_idx" ON "languages"("order");

-- CreateIndex
CREATE INDEX "categories_kind_order_idx" ON "categories"("kind", "order");

-- CreateIndex
CREATE UNIQUE INDEX "categories_kind_slug_key" ON "categories"("kind", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "technologies_name_key" ON "technologies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "technologies_slug_key" ON "technologies"("slug");

-- CreateIndex
CREATE INDEX "technologies_order_idx" ON "technologies"("order");

-- CreateIndex
CREATE INDEX "technologies_featured_idx" ON "technologies"("featured");

-- CreateIndex
CREATE INDEX "skills_order_idx" ON "skills"("order");

-- CreateIndex
CREATE INDEX "skills_categoryId_idx" ON "skills"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_published_featured_order_idx" ON "projects"("published", "featured", "order");

-- CreateIndex
CREATE INDEX "projects_categoryId_idx" ON "projects"("categoryId");

-- CreateIndex
CREATE INDEX "project_technologies_technologyId_idx" ON "project_technologies"("technologyId");

-- CreateIndex
CREATE INDEX "project_features_projectId_order_idx" ON "project_features"("projectId", "order");

-- CreateIndex
CREATE INDEX "project_challenges_projectId_order_idx" ON "project_challenges"("projectId", "order");

-- CreateIndex
CREATE INDEX "project_metrics_projectId_order_idx" ON "project_metrics"("projectId", "order");

-- CreateIndex
CREATE INDEX "project_images_projectId_order_idx" ON "project_images"("projectId", "order");

-- CreateIndex
CREATE INDEX "experiences_order_idx" ON "experiences"("order");

-- CreateIndex
CREATE INDEX "experience_highlights_experienceId_order_idx" ON "experience_highlights"("experienceId", "order");

-- CreateIndex
CREATE INDEX "experience_technologies_technologyId_idx" ON "experience_technologies"("technologyId");

-- CreateIndex
CREATE INDEX "education_order_idx" ON "education"("order");

-- CreateIndex
CREATE INDEX "certifications_order_idx" ON "certifications"("order");

-- CreateIndex
CREATE INDEX "achievements_order_idx" ON "achievements"("order");

-- CreateIndex
CREATE INDEX "services_order_idx" ON "services"("order");

-- CreateIndex
CREATE INDEX "stat_cards_order_idx" ON "stat_cards"("order");

-- CreateIndex
CREATE INDEX "contact_messages_isRead_createdAt_idx" ON "contact_messages"("isRead", "createdAt");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technologies" ADD CONSTRAINT "technologies_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technologies" ADD CONSTRAINT "technologies_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "technologies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_features" ADD CONSTRAINT "project_features_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_challenges" ADD CONSTRAINT "project_challenges_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_metrics" ADD CONSTRAINT "project_metrics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_highlights" ADD CONSTRAINT "experience_highlights_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_technologies" ADD CONSTRAINT "experience_technologies_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_technologies" ADD CONSTRAINT "experience_technologies_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education" ADD CONSTRAINT "education_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
