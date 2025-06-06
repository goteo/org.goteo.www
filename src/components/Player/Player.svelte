<script lang="ts">
    // Import styles.
    import "vidstack/player/styles/base.css";
    // Register elements.
    import "vidstack/player";
    import "vidstack/player/ui";
    import "vidstack/icons";

    import { onMount } from "svelte";
    import { isHLSProvider, type MediaCanPlayEvent, type MediaProviderChangeEvent } from "vidstack";
    import type { MediaPlayerElement } from "vidstack/elements";

    import VideoLayout from "./components/layouts/VideoLayout.svelte";

    let player: MediaPlayerElement;

    export let src: string;
    export let title: string;
    export let thumbnails: string = "";
    export let poster: {
        src: string;
        alt: string;
    };

    onMount(() => {
        /**
         * You can add these tracks using HTML as well.
         *
         * @example
         * ```html
         * <media-provider>
         *   <track label="..." src="..." kind="..." srclang="..." default />
         *   <track label="..." src="..." kind="..." srclang="..." />
         * </media-provider>
         * ```
         */
        // for (const track of textTracks) player.textTracks.add(track);

        // Subscribe to state updates.
        return player.subscribe(({ paused, viewType }) => {
            // console.log('is paused?', '->', paused);
            // console.log('is audio view?', '->', viewType === 'audio');
        });
    });

    function onProviderChange(event: MediaProviderChangeEvent) {
        const provider = event.detail;
        // We can configure provider's here.
        if (isHLSProvider(provider)) {
            provider.config = {};
        }
    }

    // We can listen for the `can-play` event to be notified when the player is ready.
    function onCanPlay(event: MediaCanPlayEvent) {
        // ...
    }
</script>

<media-player
    class="ring-media-focus aspect-video h-full w-full overflow-hidden rounded-md bg-slate-900 font-sans text-white data-[focus]:ring-4"
    {title}
    {src}
    crossOrigin
    playsInline
    on:provider-change={onProviderChange}
    on:can-play={onCanPlay}
    bind:this={player}
>
    <media-provider>
        <media-poster
            class="absolute inset-0 block h-full w-full rounded-md opacity-0 transition-opacity data-[visible]:opacity-100 [&>img]:h-full [&>img]:w-full [&>img]:object-cover"
            {...poster}
        ></media-poster>
    </media-provider>

    <VideoLayout {thumbnails} />
</media-player>
