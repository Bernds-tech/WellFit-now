import type { BuddyAction, BuddyState } from "../types";
import BuddyActions from "./BuddyActions";
import BuddyCarePanel from "./BuddyCarePanel";
import BuddyFutureModules from "./BuddyFutureModules";
import BuddyHomePanel from "./BuddyHomePanel";
import BuddyInventoryPreview from "./BuddyInventoryPreview";
import BuddyRecoveryPanel from "./BuddyRecoveryPanel";
import BuddyStoryBox from "./BuddyStoryBox";

type BuddyMainGridProps = {
  buddy: BuddyState;
  actions: BuddyAction[];
  story: string;
  buddyMessage: string;
  onAction: (action: BuddyAction) => void;
};

export default function BuddyMainGrid({ buddy, actions, story, buddyMessage, onAction }: BuddyMainGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-4">
        <BuddyStoryBox story={story} message={buddyMessage} />
        <BuddyCarePanel buddy={buddy} />
        <BuddyRecoveryPanel buddy={buddy} />
        <BuddyInventoryPreview />
        <BuddyFutureModules />
      </div>
      <div className="space-y-4 xl:sticky xl:top-5 xl:self-start">
        <BuddyActions actions={actions} onAction={onAction} />
        <BuddyHomePanel buddy={buddy} />
      </div>
    </div>
  );
}
