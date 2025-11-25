<script lang="ts">
    import type { Campaign } from "../../types/campaign";
    import { t } from "../../i18n/store";
    import CommentModal from "./CommentModal.svelte";

    interface Props {
        project: Campaign;
        token: string;
    }

    let { project, token }: Props = $props();
    let showModal = $state(false);

    function openModal() {
        if (project.projectSupport) {
            showModal = true;
        }
    }

    function closeModal() {
        showModal = false;
    }
</script>

<div data-breakpoint="Desktop" data-type="Dejar comentarios" class="w-full md:w-[668px] p-6 bg-neutral-50 rounded-[32px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] shadow-[0px_6px_6px_0px_rgba(0,0,0,0.09)] shadow-[0px_13px_8px_0px_rgba(0,0,0,0.05)] shadow-[0px_22px_9px_0px_rgba(0,0,0,0.01)] shadow-[0px_35px_10px_0px_rgba(0,0,0,0.00)] outline outline-1 outline-offset-[-1px] outline-stone-100 flex flex-col justify-start items-center gap-2">
    <div class="self-stretch flex flex-col justify-start items-center gap-6">
        <div class="self-stretch flex flex-col justify-end items-end gap-6">
            <div class="self-stretch flex flex-col md:flex-row justify-start items-start gap-6">
                <img class="w-full md:w-[298px] h-[172px] object-cover rounded-3xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] shadow-[0px_13px_8px_0px_rgba(0,0,0,0.05)] shadow-[0px_6px_6px_0px_rgba(0,0,0,0.09)] shadow-[0px_35px_10px_0px_rgba(0,0,0,0.00)] shadow-[0px_22px_9px_0px_rgba(0,0,0,0.01)] border border-stone-100" src={project.image} alt={project.title} />
                <div class="w-full md:w-72 flex flex-col justify-start items-start gap-6">
                    <div class="self-stretch flex flex-col justify-start items-start gap-1">
                        <div class="self-stretch justify-start text-neutral-700 text-base font-bold font-['Karla'] leading-6">Has donado a:</div>
                        <div class="self-stretch min-h-16 justify-start text-zinc-700 text-2xl font-bold font-['Karla'] leading-8 line-clamp-2">{project.title}</div>
                    </div>
                    <button disabled={!project.projectSupport} onclick={openModal} class="self-stretch px-6 py-4 bg-slate-200 rounded-3xl inline-flex justify-center items-center gap-2 hover:bg-slate-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        <div class="w-6 h-6 relative flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M5.25 9H8.25M5.25 6H12.75M0.75 2.25V17.25L4.5 14.25H15.75C16.5784 14.25 17.25 13.5784 17.25 12.75V2.25C17.25 1.42157 16.5784 0.75 15.75 0.75H2.25C1.42157 0.75 0.75 1.42157 0.75 2.25Z" stroke="#462949" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="justify-start text-zinc-700 text-base font-bold font-['Karla'] leading-6 line-clamp-1">Quiero dejar comentario</div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<CommentModal bind:open={showModal} {project} {token} projectSupport={project.projectSupport} onClose={closeModal} />
