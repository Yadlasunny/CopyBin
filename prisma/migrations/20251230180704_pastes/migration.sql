-- CreateTable
CREATE TABLE "pastes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "max_views" INTEGER,
    "view_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pastes_pkey" PRIMARY KEY ("id")
);
