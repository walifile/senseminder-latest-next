import type { RootState, AppDispatch } from "@/redux/store";

import { useCallback } from "react";
import { selectUserId } from "@/redux/slices/auth/auth-slice";
import { setIsShow } from "@/redux/slices/feedback/feedback-slice";
import {
  useCreateFeedbackTaskMutation,
  useGetNextFeedbackPromptMutation,
} from "@/api/feedback";

import { useDispatch, useSelector } from "react-redux";
import { Logger } from "@/lib/utils/logger";

type TriggerOptions = {
  trigger: string;
  delayMinutes?: number;
};

type PromptResponse = {
  show: boolean;
  type: string;
  promptId: string;
  eligibleAt: string;
  priority: number;
  reason: string;
};

export function useFeedback() {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((state: RootState) => selectUserId(state));

  const [createTask, { isLoading: creating }] = useCreateFeedbackTaskMutation();
  const [getNextPrompt, { isLoading: fetching }] =
    useGetNextFeedbackPromptMutation();

  const triggerFeedback = useCallback(
    async ({ trigger, delayMinutes = 0 }: TriggerOptions) => {
      if (!userId) return;

      try {
        await createTask({
          userId,
          trigger,
          delayMinutes,
        }).unwrap();

        const { show } = (await getNextPrompt({
          userId,
        }).unwrap()) as PromptResponse;

        dispatch(setIsShow(Boolean(show)));
      } catch (error) {
        Logger.error("Feedback flow failed:", error);
      }
    },
    [createTask, getNextPrompt, dispatch, userId]
  );

  return { triggerFeedback, isRunning: creating || fetching };
}
