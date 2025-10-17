-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletionScheduledAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Deck" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "ownerId" INTEGER NOT NULL,
    "copiedFromId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Card" (
    "id" SERIAL NOT NULL,
    "deckId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "questionImageUrl" TEXT,
    "answerImageUrl" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpacedRepetitionDay" (
    "id" SERIAL NOT NULL,
    "deckId" INTEGER NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "dayStr" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpacedRepetitionDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Classroom" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "lessonText" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClassroomMembership" (
    "id" SERIAL NOT NULL,
    "classroomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClassroomDeck" (
    "id" SERIAL NOT NULL,
    "classroomId" INTEGER NOT NULL,
    "deckId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomDeck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deckId" INTEGER,
    "text" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemNotification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LearningSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deckId" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER NOT NULL,

    CONSTRAINT "LearningSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CardInteraction" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "public"."User"("name");

-- CreateIndex
CREATE INDEX "User_lastActiveAt_idx" ON "public"."User"("lastActiveAt");

-- CreateIndex
CREATE INDEX "Deck_ownerId_idx" ON "public"."Deck"("ownerId");

-- CreateIndex
CREATE INDEX "Deck_copiedFromId_idx" ON "public"."Deck"("copiedFromId");

-- CreateIndex
CREATE INDEX "Deck_ownerId_updated_at_idx" ON "public"."Deck"("ownerId", "updated_at");

-- CreateIndex
CREATE INDEX "Card_deckId_idx" ON "public"."Card"("deckId");

-- CreateIndex
CREATE INDEX "SpacedRepetitionDay_deckId_day_idx" ON "public"."SpacedRepetitionDay"("deckId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "SpacedRepetitionDay_deckId_dayStr_key" ON "public"."SpacedRepetitionDay"("deckId", "dayStr");

-- CreateIndex
CREATE INDEX "ClassroomMembership_userId_idx" ON "public"."ClassroomMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomMembership_classroomId_userId_key" ON "public"."ClassroomMembership"("classroomId", "userId");

-- CreateIndex
CREATE INDEX "ClassroomDeck_deckId_idx" ON "public"."ClassroomDeck"("deckId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomDeck_classroomId_deckId_key" ON "public"."ClassroomDeck"("classroomId", "deckId");

-- CreateIndex
CREATE INDEX "Notification_userId_created_at_idx" ON "public"."Notification"("userId", "created_at");

-- CreateIndex
CREATE INDEX "Notification_userId_expires_at_idx" ON "public"."Notification"("userId", "expires_at");

-- CreateIndex
CREATE INDEX "Notification_expires_at_idx" ON "public"."Notification"("expires_at");

-- CreateIndex
CREATE INDEX "SystemNotification_userId_expires_at_idx" ON "public"."SystemNotification"("userId", "expires_at");

-- CreateIndex
CREATE INDEX "LearningSession_userId_completedAt_idx" ON "public"."LearningSession"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "LearningSession_deckId_completedAt_idx" ON "public"."LearningSession"("deckId", "completedAt");

-- CreateIndex
CREATE INDEX "CardInteraction_sessionId_cardId_round_idx" ON "public"."CardInteraction"("sessionId", "cardId", "round");

-- AddForeignKey
ALTER TABLE "public"."Deck" ADD CONSTRAINT "Deck_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "public"."Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpacedRepetitionDay" ADD CONSTRAINT "SpacedRepetitionDay_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "public"."Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Classroom" ADD CONSTRAINT "Classroom_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassroomMembership" ADD CONSTRAINT "ClassroomMembership_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "public"."Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassroomMembership" ADD CONSTRAINT "ClassroomMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassroomDeck" ADD CONSTRAINT "ClassroomDeck_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "public"."Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassroomDeck" ADD CONSTRAINT "ClassroomDeck_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "public"."Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "public"."Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LearningSession" ADD CONSTRAINT "LearningSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LearningSession" ADD CONSTRAINT "LearningSession_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "public"."Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardInteraction" ADD CONSTRAINT "CardInteraction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."LearningSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardInteraction" ADD CONSTRAINT "CardInteraction_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
