<script lang="ts">
    import { t } from "../../../i18n/store";
    import type { Project, ProjectReward } from "../../../openapi/client";
    import PlusIcon from "../../../svgs/PlusIcon.svelte";
    import Button from "../../library/Button.svelte";
    import WizardRewardModal from "./WizardRewardModal.svelte";

    let {
        onclick,
        open = $bindable(false),
        project,
        reward,
        onSave,
    } = $props<{
        onclick: () => void;
        open: boolean;
        project: Project;
        reward: ProjectReward | null;
        onSave: (data: any) => Promise<void>;
    }>();
</script>

<div
    class="bg-secondary border-variant1 flex h-148.75 w-full max-w-109.25 basis-1/2 flex-col content-between items-center rounded-4xl border p-6 shadow-sm"
>
    <div class="flex flex-col gap-4">
        <h2 class="text-soft-purple self-stretch text-[40px] leading-12 font-bold">
            <!-- {$t("wizard.steps.rewards.createCard.title")} -->
            ¡No Lances Tu Campaña Sin Ellas! Las recompensas son tu superpoder
        </h2>
        <p class="text-variant1 self-stretch text-base font-normal">
            <!-- {$t("wizard.steps.rewards.createCard.description")} -->
            Las donaciones aumentan un 30%* en campañas con múltiples y atractivas recompensas. Es simple:
            más opciones significan más posibilidades de conectar con los intereses de potenciales donantes.
            ¿Productos exclusivos? ¿Experiencias únicas? ¿Reconocimientos especiales? ¡Tu creatividad
            es el límite! Cuanto más variado sea tu menú de recompensas, mayor será tu éxito.
        </p>
    </div>
    <Button kind="secondary" class="flex w-full items-center justify-center gap-2" {onclick}>
        <PlusIcon class="p-[2.25px]" />
        <!-- {$t("wizard.steps.rewards.createCard.btn")} -->
        Añadir recompensa
    </Button>
</div>
<WizardRewardModal bind:open {project} {onSave} {reward} />
