import * as CL from "stdnum/lib/esm/cl";
import * as DE from "stdnum/lib/esm/de";
import * as ES from "stdnum/lib/esm/es";
import * as FR from "stdnum/lib/esm/fr";
import * as IN from "stdnum/lib/esm/in";
import * as IT from "stdnum/lib/esm/it";
import * as JP from "stdnum/lib/esm/jp";
import * as MX from "stdnum/lib/esm/mx";
import * as PT from "stdnum/lib/esm/pt";
import * as US from "stdnum/lib/esm/us";

import type { Validator } from "stdnum/lib/esm/types";

type OwnerType = "individual" | "organization";

// ponytail: subset of stdnum's personValidators/entityValidators, deep-imported per country
// to keep the client bundle small. Add a country here when the API supports it.
const validators: Record<string, Partial<Record<OwnerType, Validator[]>>> = {
    ES: { individual: [ES.nif], organization: [ES.nif] },
    PT: { individual: [PT.nif], organization: [PT.nipc, PT.nif] },
    FR: { individual: [FR.nif], organization: [FR.siren, FR.siret, FR.tva] },
    DE: { individual: [DE.idnr], organization: [DE.stnr, DE.vat] },
    IT: { individual: [IT.codicefiscale], organization: [IT.iva] },
    JP: { organization: [JP.cn] },
    CL: { individual: [CL.run], organization: [CL.rut] },
    MX: { individual: [MX.curp, MX.rfc], organization: [MX.rfc] },
    IN: { individual: [IN.pan, IN.aadhaar], organization: [IN.pan, IN.gstin] },
    US: { individual: [US.ssn], organization: [US.ein] },
};

/**
 * Checks a tax id against the known formats for the issuing country and owner type.
 * Returns `undefined` when the country has no known validator (cannot be checked).
 */
export function isValidTaxId(country: string, type: OwnerType, value: string) {
    const set = validators[country.toUpperCase()]?.[type];

    if (!set?.length) {
        return undefined;
    }

    return set.some((validator) => {
        const result = validator.validate(value);

        // Umbrella validators (e.g. ES.nif) also accept company ids; individuals must not use them.
        return result.isValid && !(type === "individual" && result.isCompany);
    });
}
