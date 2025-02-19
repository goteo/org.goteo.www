// This file is auto-generated by @hey-api/openapi-ts

import type { Options as ClientOptions, TDataShape, Client } from "@hey-api/client-fetch";
import type {
  ApiAccountingsGetCollectionData,
  ApiAccountingsGetCollectionResponse,
  ApiAccountingsIdGetData,
  ApiAccountingsIdGetResponse,
  ApiAccountingsIdPatchData,
  ApiAccountingsIdPatchResponse,
  ApiAccountingBalancePointsGetCollectionData,
  ApiAccountingBalancePointsGetCollectionResponse,
  ApiAccountingTransactionsGetCollectionData,
  ApiAccountingTransactionsGetCollectionResponse,
  ApiAccountingTransactionsIdGetData,
  ApiAccountingTransactionsIdGetResponse,
  ApiGatewaysGetCollectionData,
  ApiGatewaysGetCollectionResponse,
  ApiGatewaysNameGetData,
  ApiGatewaysNameGetResponse,
  ApiGatewayChargesIdGetData,
  ApiGatewayChargesIdGetResponse,
  ApiGatewayCheckoutsGetCollectionData,
  ApiGatewayCheckoutsGetCollectionResponse,
  ApiGatewayCheckoutsPostData,
  ApiGatewayCheckoutsPostResponse,
  ApiGatewayCheckoutsIdGetData,
  ApiGatewayCheckoutsIdGetResponse,
  ApiProjectsGetCollectionData,
  ApiProjectsGetCollectionResponse,
  ApiProjectsPostData,
  ApiProjectsPostResponse,
  ApiProjectsIdDeleteData,
  ApiProjectsIdDeleteResponse,
  ApiProjectsIdGetData,
  ApiProjectsIdGetResponse,
  ApiProjectsIdPatchData,
  ApiProjectsIdPatchResponse,
  ApiProjectBudgetItemsGetCollectionData,
  ApiProjectBudgetItemsGetCollectionResponse,
  ApiProjectBudgetItemsPostData,
  ApiProjectBudgetItemsPostResponse,
  ApiProjectBudgetItemsIdDeleteData,
  ApiProjectBudgetItemsIdDeleteResponse,
  ApiProjectBudgetItemsIdGetData,
  ApiProjectBudgetItemsIdGetResponse,
  ApiProjectBudgetItemsIdPatchData,
  ApiProjectBudgetItemsIdPatchResponse,
  ApiProjectRewardsGetCollectionData,
  ApiProjectRewardsGetCollectionResponse,
  ApiProjectRewardsPostData,
  ApiProjectRewardsPostResponse,
  ApiProjectRewardsIdDeleteData,
  ApiProjectRewardsIdDeleteResponse,
  ApiProjectRewardsIdGetData,
  ApiProjectRewardsIdGetResponse,
  ApiProjectRewardsIdPatchData,
  ApiProjectRewardsIdPatchResponse,
  ApiProjectRewardClaimsGetCollectionData,
  ApiProjectRewardClaimsGetCollectionResponse,
  ApiProjectRewardClaimsPostData,
  ApiProjectRewardClaimsPostResponse,
  ApiProjectRewardClaimsIdDeleteData,
  ApiProjectRewardClaimsIdDeleteResponse,
  ApiProjectRewardClaimsIdGetData,
  ApiProjectRewardClaimsIdGetResponse,
  ApiProjectRewardClaimsIdPatchData,
  ApiProjectRewardClaimsIdPatchResponse,
  ApiTipjarsGetCollectionData,
  ApiTipjarsGetCollectionResponse,
  ApiTipjarsPostData,
  ApiTipjarsPostResponse,
  ApiTipjarsIdDeleteData,
  ApiTipjarsIdDeleteResponse,
  ApiTipjarsIdGetData,
  ApiTipjarsIdGetResponse,
  ApiTipjarsIdPatchData,
  ApiTipjarsIdPatchResponse,
  ApiUsersGetCollectionData,
  ApiUsersGetCollectionResponse,
  ApiUsersPostData,
  ApiUsersPostResponse,
  ApiUsersIdDeleteData,
  ApiUsersIdDeleteResponse,
  ApiUsersIdGetData,
  ApiUsersIdGetResponse,
  ApiUsersIdPatchData,
  ApiUsersIdPatchResponse,
  ApiUserPersonalsGetCollectionData,
  ApiUserPersonalsGetCollectionResponse,
  ApiUserPersonalsPostData,
  ApiUserPersonalsPostResponse,
  ApiUserPersonalsUserDeleteData,
  ApiUserPersonalsUserDeleteResponse,
  ApiUserPersonalsUserGetData,
  ApiUserPersonalsUserGetResponse,
  ApiUserPersonalsUserPatchData,
  ApiUserPersonalsUserPatchResponse,
  ApiUserTokensPostData,
  ApiUserTokensPostResponse,
  ApiUserTokensIdDeleteData,
  ApiUserTokensIdDeleteResponse,
  ApiUserTokensIdGetData,
  ApiUserTokensIdGetResponse,
  ApiVersionsGetCollectionData,
  ApiVersionsGetCollectionResponse,
  ApiVersionsIdGetData,
  ApiVersionsIdGetResponse,
} from "./types.gen";
import { client as _heyApiClient } from "./client.gen";

export type Options<TData extends TDataShape = TDataShape, ThrowOnError extends boolean = boolean> = ClientOptions<
  TData,
  ThrowOnError
> & {
  /**
   * You can provide a client instance returned by `createClient()` instead of
   * individual options. This might be also useful if you want to implement a
   * custom client.
   */
  client?: Client;
  /**
   * You can pass arbitrary values through the `meta` object. This can be
   * used to access values that aren't defined as part of the SDK function.
   */
  meta?: Record<string, unknown>;
};

/**
 * List all Accountings
 * Retrieves the collection of Accounting resources.
 */
export const apiAccountingsGetCollection = <ThrowOnError extends boolean = false>(
  options?: Options<ApiAccountingsGetCollectionData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<ApiAccountingsGetCollectionResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/accountings",
    ...options,
  });
};

/**
 * Retrieve one Accounting
 * Retrieves one Accounting resource.
 */
export const apiAccountingsIdGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiAccountingsIdGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiAccountingsIdGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/accountings/{id}",
    ...options,
  });
};

/**
 * Updates the Accounting resource.
 * Updates the Accounting resource.
 */
export const apiAccountingsIdPatch = <ThrowOnError extends boolean = false>(
  options: Options<ApiAccountingsIdPatchData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).patch<ApiAccountingsIdPatchResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/accountings/{id}",
    ...options,
    headers: {
      "Content-Type": "application/merge-patch+json",
      ...options?.headers,
    },
  });
};

/**
 * List all AccountingBalancePoints
 * Retrieves the collection of AccountingBalancePoint resources.
 */
export const apiAccountingBalancePointsGetCollection = <ThrowOnError extends boolean = false>(
  options: Options<ApiAccountingBalancePointsGetCollectionData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiAccountingBalancePointsGetCollectionResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/accounting_balance_points",
    ...options,
  });
};

/**
 * List all AccountingTransactions
 * Retrieves the collection of AccountingTransaction resources.
 */
export const apiAccountingTransactionsGetCollection = <ThrowOnError extends boolean = false>(
  options?: Options<ApiAccountingTransactionsGetCollectionData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<ApiAccountingTransactionsGetCollectionResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/accounting_transactions",
    ...options,
  });
};

/**
 * Retrieve one AccountingTransaction
 * Retrieves one AccountingTransaction resource.
 */
export const apiAccountingTransactionsIdGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiAccountingTransactionsIdGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiAccountingTransactionsIdGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/accounting_transactions/{id}",
    ...options,
  });
};

/**
 * List all Gateways
 * Retrieves the collection of Gateway resources.
 */
export const apiGatewaysGetCollection = <ThrowOnError extends boolean = false>(
  options?: Options<ApiGatewaysGetCollectionData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<ApiGatewaysGetCollectionResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/gateways",
    ...options,
  });
};

/**
 * Retrieve one Gateway
 * Retrieves one Gateway resource.
 */
export const apiGatewaysNameGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiGatewaysNameGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiGatewaysNameGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/gateways/{name}",
    ...options,
  });
};

/**
 * Retrieve one GatewayCharge
 * Retrieves one GatewayCharge resource.
 */
export const apiGatewayChargesIdGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiGatewayChargesIdGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiGatewayChargesIdGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/gateway_charges/{id}",
    ...options,
  });
};

/**
 * List all GatewayCheckouts
 * Retrieves the collection of GatewayCheckout resources.
 */
export const apiGatewayCheckoutsGetCollection = <ThrowOnError extends boolean = false>(
  options?: Options<ApiGatewayCheckoutsGetCollectionData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<ApiGatewayCheckoutsGetCollectionResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/gateway_checkouts",
    ...options,
  });
};

/**
 * Creates a GatewayCheckout resource.
 * Creates a GatewayCheckout resource.
 */
export const apiGatewayCheckoutsPost = <ThrowOnError extends boolean = false>(
  options: Options<ApiGatewayCheckoutsPostData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<ApiGatewayCheckoutsPostResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/gateway_checkouts",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Retrieve one GatewayCheckout
 * Retrieves one GatewayCheckout resource.
 */
export const apiGatewayCheckoutsIdGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiGatewayCheckoutsIdGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiGatewayCheckoutsIdGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/gateway_checkouts/{id}",
    ...options,
  });
};

/**
 * List all Projects
 * Retrieves the collection of Project resources.
 */
export const apiProjectsGetCollection = <ThrowOnError extends boolean = false>(
  options?: Options<ApiProjectsGetCollectionData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<ApiProjectsGetCollectionResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/projects",
    ...options,
  });
};

/**
 * Creates a Project resource.
 * Creates a Project resource.
 */
export const apiProjectsPost = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectsPostData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<ApiProjectsPostResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/projects",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Removes the Project resource.
 * Removes the Project resource.
 */
export const apiProjectsIdDelete = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectsIdDeleteData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<ApiProjectsIdDeleteResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/projects/{id}",
    ...options,
  });
};

/**
 * Retrieve one Project
 * Retrieves one Project resource.
 */
export const apiProjectsIdGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectsIdGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiProjectsIdGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/projects/{id}",
    ...options,
  });
};

/**
 * Updates the Project resource.
 * Updates the Project resource.
 */
export const apiProjectsIdPatch = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectsIdPatchData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).patch<ApiProjectsIdPatchResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/projects/{id}",
    ...options,
    headers: {
      "Content-Type": "application/merge-patch+json",
      ...options?.headers,
    },
  });
};

/**
 * List all ProjectBudgetItems
 * Retrieves the collection of ProjectBudgetItem resources.
 */
export const apiProjectBudgetItemsGetCollection = <ThrowOnError extends boolean = false>(
  options?: Options<ApiProjectBudgetItemsGetCollectionData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<ApiProjectBudgetItemsGetCollectionResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_budget_items",
    ...options,
  });
};

/**
 * Creates a ProjectBudgetItem resource.
 * Creates a ProjectBudgetItem resource.
 */
export const apiProjectBudgetItemsPost = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectBudgetItemsPostData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<ApiProjectBudgetItemsPostResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_budget_items",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Removes the ProjectBudgetItem resource.
 * Removes the ProjectBudgetItem resource.
 */
export const apiProjectBudgetItemsIdDelete = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectBudgetItemsIdDeleteData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<ApiProjectBudgetItemsIdDeleteResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_budget_items/{id}",
    ...options,
  });
};

/**
 * Retrieve one ProjectBudgetItem
 * Retrieves one ProjectBudgetItem resource.
 */
export const apiProjectBudgetItemsIdGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectBudgetItemsIdGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiProjectBudgetItemsIdGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_budget_items/{id}",
    ...options,
  });
};

/**
 * Updates the ProjectBudgetItem resource.
 * Updates the ProjectBudgetItem resource.
 */
export const apiProjectBudgetItemsIdPatch = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectBudgetItemsIdPatchData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).patch<ApiProjectBudgetItemsIdPatchResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_budget_items/{id}",
    ...options,
    headers: {
      "Content-Type": "application/merge-patch+json",
      ...options?.headers,
    },
  });
};

/**
 * List all ProjectRewards
 * Retrieves the collection of ProjectReward resources.
 */
export const apiProjectRewardsGetCollection = <ThrowOnError extends boolean = false>(
  options?: Options<ApiProjectRewardsGetCollectionData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<ApiProjectRewardsGetCollectionResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_rewards",
    ...options,
  });
};

/**
 * Creates a ProjectReward resource.
 * Creates a ProjectReward resource.
 */
export const apiProjectRewardsPost = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectRewardsPostData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<ApiProjectRewardsPostResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_rewards",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Removes the ProjectReward resource.
 * Removes the ProjectReward resource.
 */
export const apiProjectRewardsIdDelete = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectRewardsIdDeleteData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<ApiProjectRewardsIdDeleteResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_rewards/{id}",
    ...options,
  });
};

/**
 * Retrieve one ProjectReward
 * Retrieves one ProjectReward resource.
 */
export const apiProjectRewardsIdGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectRewardsIdGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiProjectRewardsIdGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_rewards/{id}",
    ...options,
  });
};

/**
 * Updates the ProjectReward resource.
 * Updates the ProjectReward resource.
 */
export const apiProjectRewardsIdPatch = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectRewardsIdPatchData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).patch<ApiProjectRewardsIdPatchResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_rewards/{id}",
    ...options,
    headers: {
      "Content-Type": "application/merge-patch+json",
      ...options?.headers,
    },
  });
};

/**
 * List all ProjectRewardClaims
 * Retrieves the collection of ProjectRewardClaim resources.
 */
export const apiProjectRewardClaimsGetCollection = <ThrowOnError extends boolean = false>(
  options?: Options<ApiProjectRewardClaimsGetCollectionData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<ApiProjectRewardClaimsGetCollectionResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_reward_claims",
    ...options,
  });
};

/**
 * Creates a ProjectRewardClaim resource.
 * Creates a ProjectRewardClaim resource.
 */
export const apiProjectRewardClaimsPost = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectRewardClaimsPostData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<ApiProjectRewardClaimsPostResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_reward_claims",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Removes the ProjectRewardClaim resource.
 * Removes the ProjectRewardClaim resource.
 */
export const apiProjectRewardClaimsIdDelete = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectRewardClaimsIdDeleteData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<ApiProjectRewardClaimsIdDeleteResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_reward_claims/{id}",
    ...options,
  });
};

/**
 * Retrieve one ProjectRewardClaim
 * Retrieves one ProjectRewardClaim resource.
 */
export const apiProjectRewardClaimsIdGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectRewardClaimsIdGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiProjectRewardClaimsIdGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_reward_claims/{id}",
    ...options,
  });
};

/**
 * Updates the ProjectRewardClaim resource.
 * Updates the ProjectRewardClaim resource.
 */
export const apiProjectRewardClaimsIdPatch = <ThrowOnError extends boolean = false>(
  options: Options<ApiProjectRewardClaimsIdPatchData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).patch<ApiProjectRewardClaimsIdPatchResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/project_reward_claims/{id}",
    ...options,
    headers: {
      "Content-Type": "application/merge-patch+json",
      ...options?.headers,
    },
  });
};

/**
 * List all Tipjars
 * Retrieves the collection of Tipjar resources.
 */
export const apiTipjarsGetCollection = <ThrowOnError extends boolean = false>(
  options?: Options<ApiTipjarsGetCollectionData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<ApiTipjarsGetCollectionResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/tipjars",
    ...options,
  });
};

/**
 * Creates a Tipjar resource.
 * Creates a Tipjar resource.
 */
export const apiTipjarsPost = <ThrowOnError extends boolean = false>(
  options: Options<ApiTipjarsPostData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<ApiTipjarsPostResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/tipjars",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Removes the Tipjar resource.
 * Removes the Tipjar resource.
 */
export const apiTipjarsIdDelete = <ThrowOnError extends boolean = false>(
  options: Options<ApiTipjarsIdDeleteData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<ApiTipjarsIdDeleteResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/tipjars/{id}",
    ...options,
  });
};

/**
 * Retrieve one Tipjar
 * Retrieves one Tipjar resource.
 */
export const apiTipjarsIdGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiTipjarsIdGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiTipjarsIdGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/tipjars/{id}",
    ...options,
  });
};

/**
 * Updates the Tipjar resource.
 * Updates the Tipjar resource.
 */
export const apiTipjarsIdPatch = <ThrowOnError extends boolean = false>(
  options: Options<ApiTipjarsIdPatchData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).patch<ApiTipjarsIdPatchResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/tipjars/{id}",
    ...options,
    headers: {
      "Content-Type": "application/merge-patch+json",
      ...options?.headers,
    },
  });
};

/**
 * List all Users
 * Retrieves the collection of User resources.
 */
export const apiUsersGetCollection = <ThrowOnError extends boolean = false>(
  options?: Options<ApiUsersGetCollectionData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<ApiUsersGetCollectionResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/users",
    ...options,
  });
};

/**
 * Creates a User resource.
 * Creates a User resource.
 */
export const apiUsersPost = <ThrowOnError extends boolean = false>(
  options: Options<ApiUsersPostData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<ApiUsersPostResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/users",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Removes the User resource.
 * Removes the User resource.
 */
export const apiUsersIdDelete = <ThrowOnError extends boolean = false>(
  options: Options<ApiUsersIdDeleteData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<ApiUsersIdDeleteResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/users/{id}",
    ...options,
  });
};

/**
 * Retrieve one User
 * Retrieves one User resource.
 */
export const apiUsersIdGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiUsersIdGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiUsersIdGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/users/{id}",
    ...options,
  });
};

/**
 * Updates the User resource.
 * Updates the User resource.
 */
export const apiUsersIdPatch = <ThrowOnError extends boolean = false>(
  options: Options<ApiUsersIdPatchData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).patch<ApiUsersIdPatchResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/users/{id}",
    ...options,
    headers: {
      "Content-Type": "application/merge-patch+json",
      ...options?.headers,
    },
  });
};

/**
 * List all UserPersonals
 * Retrieves the collection of UserPersonal resources.
 */
export const apiUserPersonalsGetCollection = <ThrowOnError extends boolean = false>(
  options?: Options<ApiUserPersonalsGetCollectionData, ThrowOnError>,
) => {
  return (options?.client ?? _heyApiClient).get<ApiUserPersonalsGetCollectionResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/user_personals",
    ...options,
  });
};

/**
 * Creates a UserPersonal resource.
 * Creates a UserPersonal resource.
 */
export const apiUserPersonalsPost = <ThrowOnError extends boolean = false>(
  options: Options<ApiUserPersonalsPostData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<ApiUserPersonalsPostResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/user_personals",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Removes the UserPersonal resource.
 * Removes the UserPersonal resource.
 */
export const apiUserPersonalsUserDelete = <ThrowOnError extends boolean = false>(
  options: Options<ApiUserPersonalsUserDeleteData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<ApiUserPersonalsUserDeleteResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/user_personals/{user}",
    ...options,
  });
};

/**
 * Retrieve one UserPersonal
 * Retrieves one UserPersonal resource.
 */
export const apiUserPersonalsUserGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiUserPersonalsUserGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiUserPersonalsUserGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/user_personals/{user}",
    ...options,
  });
};

/**
 * Updates the UserPersonal resource.
 * Updates the UserPersonal resource.
 */
export const apiUserPersonalsUserPatch = <ThrowOnError extends boolean = false>(
  options: Options<ApiUserPersonalsUserPatchData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).patch<ApiUserPersonalsUserPatchResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/user_personals/{user}",
    ...options,
    headers: {
      "Content-Type": "application/merge-patch+json",
      ...options?.headers,
    },
  });
};

/**
 * Create one UserToken
 * Creates a new UserToken resource.
 */
export const apiUserTokensPost = <ThrowOnError extends boolean = false>(
  options: Options<ApiUserTokensPostData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).post<ApiUserTokensPostResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/user_tokens",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
};

/**
 * Removes the UserToken resource.
 * Removes the UserToken resource.
 */
export const apiUserTokensIdDelete = <ThrowOnError extends boolean = false>(
  options: Options<ApiUserTokensIdDeleteData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).delete<ApiUserTokensIdDeleteResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/user_tokens/{id}",
    ...options,
  });
};

/**
 * Retrieve one UserToken
 * Retrieves one UserToken resource.
 */
export const apiUserTokensIdGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiUserTokensIdGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiUserTokensIdGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/user_tokens/{id}",
    ...options,
  });
};

/**
 * List all Versions
 * Retrieves the collection of Version resources.
 */
export const apiVersionsGetCollection = <ThrowOnError extends boolean = false>(
  options: Options<ApiVersionsGetCollectionData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiVersionsGetCollectionResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/versions",
    ...options,
  });
};

/**
 * Retrieve one Version
 * Retrieves one Version resource.
 */
export const apiVersionsIdGet = <ThrowOnError extends boolean = false>(
  options: Options<ApiVersionsIdGetData, ThrowOnError>,
) => {
  return (options.client ?? _heyApiClient).get<ApiVersionsIdGetResponse, unknown, ThrowOnError>({
    security: [
      {
        scheme: "bearer",
        type: "http",
      },
    ],
    url: "/v4/versions/{id}",
    ...options,
  });
};
