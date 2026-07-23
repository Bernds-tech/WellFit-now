"use client";

import React, { useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import type { InternalEconomyHealthSnapshot } from "@/lib/economy";
import type { Beta1MissionSummary } from "@/lib/beta1/beta1Types";
import { readPublishedMissions } from "@/lib/beta1/clientReadProjections";
import { signOut } from "firebase/auth";

import AppSidebar from "@/app/AppSidebar";
import { useWellFitBrightness } from "@/app/hooks/useWellFitBrightness";
import DashboardHeader from "./components/DashboardHeader";
import DashboardMissionPanel from "./components/DashboardMissionPanel";
import DashboardAvatarPanel from "./components/DashboardAvatarPanel";
import DashboardEconomyPanel from "./components/DashboardEconomyPanel";
import DashboardSavedCardsPanel from "./components/DashboardSavedCardsPanel";
import Beta1ReadProjectionPanel from "./components/Beta1ReadProjectionPanel";
import { useDashboardUser } from "./hooks/useDashboardUser";
import { useDashboardActions } from "./hooks/useDashboardActions";
import type { DashboardMissionPreview } from "./types";
import {
  getPersonalMission,
  getServerBackedDashboardMission,
  selectPublishedDashboardMission,
} from "./lib/personalMission";
import {
  createDashboardMissionRewardPreview,
  getRewardPreviewUiLabel,
} from "./lib/missionRewardPreview";
import { fetchDashboardEconomyHealthPreview, fetchDashboardMissionRewardPreview } from "./lib/serverPreviewApi";
import {
  fetchDashboardUserProjection,
  type DashboardProjectionSource,
} from "./lib/serverProjectionApi";

export default function DashboardPage() {
  const {
    user,
    isLoadingUser,
    message,
    setMessage,
    loadedFromCache,
    isRealtimeConnected,
  } = useDashboardUser();

  const [brightness, setBrightness] = useWellFitBrightness(100);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [buddyLevel, setBuddyLevel] = useState(1);
  const [stepsToday, setStepsToday] = useState(0);
  const [buddyEnergy, setBuddyEnergy] = useState(100);
  const [buddyHunger, setBuddyHunger] = useState(70);
  const [foodPrice, setFoodPrice] = useState(5);
  const [buddyCareServerOwned, setBuddyCareServerOwned] = useState(false);
  const [buddyFoodAvailable, setBuddyFoodAvailable] = useState(false);
  const [buddyCareError, setBuddyCareError] = useState<string | null>(null);
  const [serverMissionPreview, setServerMissionPreview] = useState<DashboardMissionPreview | undefined>(undefined);
  const [projectionSource, setProjectionSource] = useState<DashboardProjectionSource>("local");
  const [economyHealth, setEconomyHealth] = useState<InternalEconomyHealthSnapshot | null>(null);
  const [economyHealthSource, setEconomyHealthSource] = useState<"server" | "local">("local");
  const [publishedMission, setPublishedMission] = useState<Beta1MissionSummary | null>(null);
  const [missionCatalogLoading, setMissionCatalogLoading] = useState(false);
  const [missionCatalogError, setMissionCatalogError] = useState<string | null>(null);

  const personalMission = useMemo(() => getPersonalMission(user), [user]);
  const mission = useMemo(
    () => publishedMission ? getServerBackedDashboardMission(publishedMission, personalMission) : personalMission,
    [personalMission, publishedMission],
  );

  const localMissionPreview = useMemo<DashboardMissionPreview>(() => {
    const localDecision = createDashboardMissionRewardPreview({ user, mission, stepsToday });
    return {
      decision: localDecision,
      label: getRewardPreviewUiLabel(localDecision),
      source: "local",
    };
  }, [mission, stepsToday, user]);
  const missionPreview = serverMissionPreview ?? localMissionPreview;

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      queueMicrotask(() => {
        if (cancelled) return;
        setPublishedMission(null);
        setMissionCatalogLoading(false);
        setMissionCatalogError(null);
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      if (cancelled) return;
      setMissionCatalogLoading(true);
      setMissionCatalogError(null);
    });

    readPublishedMissions().then((result) => {
      if (cancelled) return;
      const selected = selectPublishedDashboardMission(result.data);
      setPublishedMission(selected);
      setMissionCatalogLoading(false);
      setMissionCatalogError(
        result.error
          ?? (selected ? null : "Derzeit ist keine veröffentlichte Beta-1-Mission vorhanden."),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let isCancelled = false;
    queueMicrotask(() => setServerMissionPreview(undefined));

    fetchDashboardMissionRewardPreview({ user, mission, stepsToday }).then((preview) => {
      if (!isCancelled) setServerMissionPreview(preview);
    });

    return () => {
      isCancelled = true;
    };
  }, [mission, stepsToday, user]);

  useEffect(() => {
    let isCancelled = false;

    fetchDashboardEconomyHealthPreview({ requestedReward: mission.reward }).then((preview) => {
      if (isCancelled) return;
      setEconomyHealth(preview.health);
      setEconomyHealthSource(preview.source);
    });

    return () => {
      isCancelled = true;
    };
  }, [mission.reward]);

  useEffect(() => {
    let isCancelled = false;

    const loadProjection = () => {
      fetchDashboardUserProjection(user).then((projection) => {
        if (isCancelled) return;

        queueMicrotask(() => {
          setPointsBalance(projection.points);
          setBuddyEnergy(projection.avatarEnergy);
          setBuddyHunger(projection.avatarHunger);
          setBuddyLevel(projection.avatarLevel);
          setStepsToday(projection.stepsToday);
          setProjectionSource(projection.source);
          setFoodPrice(projection.buddyFoodPriceWfxp);
          setBuddyCareServerOwned(projection.buddyCareServerOwned);
          setBuddyFoodAvailable(projection.buddyFoodAvailable);
          setBuddyCareError(projection.buddyCareError);
        });
      });
    };

    loadProjection();

    const onProjectionUpdated = () => loadProjection();
    window.addEventListener("wellfit-client-beta-projection-updated", onProjectionUpdated);
    window.addEventListener("wellfit-beta1-projection-updated", onProjectionUpdated);

    return () => {
      isCancelled = true;
      window.removeEventListener("wellfit-client-beta-projection-updated", onProjectionUpdated);
      window.removeEventListener("wellfit-beta1-projection-updated", onProjectionUpdated);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      setMessage("Du wirst abgemeldet...");
      await signOut(auth);
      window.location.href = "/";
    } catch {
      setMessage("Abmelden fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  const {
    handleStartMission,
    handleCheckMissionStatus,
    handleDismissPendingMission,
    handleFeedBuddy,
    isSubmittingMission,
    isCheckingMission,
    isFeedingBuddy,
    pendingMission,
  } = useDashboardActions({
    user,
    mission,
    missionPreview,
    setMessage,
    setPointsBalance,
    setBuddyHunger,
  });

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{
        background: "linear-gradient(160deg, rgba(15,23,42,0.98), rgba(30,41,59,0.96))",
      }}
    >
      <div className="flex h-full">
        <AppSidebar
          brightness={brightness}
          onBrightnessChange={setBrightness}
          onLogout={handleLogout}
        />

        <section className="flex flex-1 flex-col gap-4 overflow-y-auto px-7 py-5">
          <DashboardHeader
            message={message}
            isRealtimeConnected={isRealtimeConnected}
            loadedFromCache={loadedFromCache}
            isLoadingUser={isLoadingUser}
            hasUser={!!user}
            buddyLevel={buddyLevel}
          />

          <DashboardEconomyPanel
            pointsBalance={pointsBalance}
            userId={user?.id}
            projectionSource={projectionSource}
            economyHealth={economyHealth}
            economyHealthSource={economyHealthSource}
          />

          <DashboardMissionPanel
            mission={mission}
            missionPreview={missionPreview}
            stepsToday={stepsToday}
            onStartMission={handleStartMission}
            onCheckMissionStatus={handleCheckMissionStatus}
            onDismissPendingMission={handleDismissPendingMission}
            pendingMission={pendingMission}
            isSubmittingMission={isSubmittingMission}
            isCheckingMission={isCheckingMission}
            missionCatalogLoading={missionCatalogLoading}
            missionCatalogError={missionCatalogError}
          />

          <DashboardAvatarPanel
            buddyLevel={buddyLevel}
            buddyEnergy={buddyEnergy}
            buddyHunger={buddyHunger}
            pointsBalance={pointsBalance}
            foodPrice={foodPrice}
            serverCareReady={buddyCareServerOwned}
            foodItemAvailable={buddyFoodAvailable}
            buddyCareError={buddyCareError}
            isFeeding={isFeedingBuddy}
            onFeedBuddy={handleFeedBuddy}
          />

          <Beta1ReadProjectionPanel />

          <DashboardSavedCardsPanel />
        </section>
      </div>
    </main>
  );
}
