import {
    apiProjectBudgetItemsPost,
    apiProjectCollaborationsPost,
    apiProjectRewardsPost,
    apiProjectsIdPatch,
} from "../openapi/client";

import type {
    ProjectReward,
    ProjectCollaboration,
    ProjectBudgetItem,
    ProjectProjectUpdationDto,
} from "../openapi/client";
import type { Session } from "../auth/types";

export async function patchProject(
    projectId: string,
    body: ProjectProjectUpdationDto,
    session: Session,
) {
    return apiProjectsIdPatch({
        path: { id: projectId },
        body,
        headers: session.token.asHttpHeaders,
    });
}

export async function createReward(
    reward: ProjectReward,
    session: Session,
) {
    return apiProjectRewardsPost({
        body: reward,
        headers: session.token.asHttpHeaders,
    });
}

export async function createCollaboration(
    collab: ProjectCollaboration,
    session: Session,
) {
    return apiProjectCollaborationsPost({
        body: {
            ...collab,
            isFulfilled: false,
        },
        headers: session.token.asHttpHeaders,
    });
}

export async function createBudgetItem(
    item: ProjectBudgetItem,
    session: Session,
) {
    return apiProjectBudgetItemsPost({
        body: item,
        headers: session.token.asHttpHeaders,
    });
}
