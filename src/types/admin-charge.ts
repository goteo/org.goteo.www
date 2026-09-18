import type { MoneyInput } from "../openapi/client/types.gen";

export type DonorType = "individual" | "organization";

export interface ExistingUser {
    id: string;
    handle: string;
    email: string;
    displayName?: string;
    type: DonorType;
    accounting: string;
}

export interface CreateChargeFormUser {
    type: DonorType;
    email: string;
    password: string;
}

export interface CreateChargeFormFiscalIndividual {
    kind: "individual";
    firstName: string;
    lastName: string;
    taxId: string;
}

export interface CreateChargeFormFiscalOrganization {
    kind: "organization";
    legalName: string;
    taxId: string;
    repFirstName: string;
    repLastName: string;
    repTaxId: string;
}

export type CreateChargeFormFiscal =
    CreateChargeFormFiscalIndividual | CreateChargeFormFiscalOrganization;

export interface CreateChargeFormCharge {
    targetIri: string;
    targetType: "project" | "tipjar";
    targetLabel: string;
    gatewayIri: string;
    gatewayName: string;
    title: string;
    description?: string;
    money: MoneyInput;
}

export interface CreateChargeForm {
    existingUser: ExistingUser | null;
    user: CreateChargeFormUser;
    fiscal: CreateChargeFormFiscal;
    charge: CreateChargeFormCharge;
}

export function initialFiscal(donorType: DonorType): CreateChargeFormFiscal {
    if (donorType === "organization") {
        return {
            kind: "organization",
            legalName: "",
            taxId: "",
            repFirstName: "",
            repLastName: "",
            repTaxId: "",
        };
    }
    return {
        kind: "individual",
        firstName: "",
        lastName: "",
        taxId: "",
    };
}

export function initialFormState(): CreateChargeForm {
    return {
        existingUser: null,
        user: { type: "individual", email: "", password: "" },
        fiscal: initialFiscal("individual"),
        charge: {
            targetIri: "",
            targetType: "project",
            targetLabel: "",
            gatewayIri: "",
            gatewayName: "",
            title: "",
            description: "",
            money: { amount: 0, currency: "EUR" },
        },
    };
}
