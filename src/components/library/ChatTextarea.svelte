<script lang="ts">
    import SendIcon from "../icons/SendIcon.svelte";
</script>

<div class="flex items-center gap-6">
    <div class="bg-grey flex flex-1 items-center gap-2 rounded-lg p-4 shadow-sm">
        <textarea
            class="placeholder:text-content flex-1 border-none bg-transparent outline-none focus:ring-0 focus:outline-none"
            placeholder="Escriba aquí"
            rows="1"
        ></textarea>
    </div>
    <button
        class="border-grey flex aspect-square h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white p-2 shadow-md"
    >
        <SendIcon />
    </button>
</div>
