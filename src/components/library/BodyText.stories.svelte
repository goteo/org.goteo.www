<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import BodyText from "./BodyText.svelte";

    const { Story } = defineMeta({
        component: BodyText,
        title: "Library/BodyText",
        tags: ["autodocs"],
    });
</script>

<Story name="Default">
    <h2>Lorem ipsum dolor sit amet</h2>
    <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet
        ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit.
    </p>
    <h3>Sed ut perspiciatis</h3>
    <p>
        Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam,
        nisi ut aliquid ex ea commodi consequatur.
    </p>
    <ul>
        <li>Nisi ut aliquid ex ea commodi consequatur</li>
        <li>Quis autem vel eum iure reprehenderit</li>
        <li>Qui in ea voluptate velit esse quam nihil</li>
    </ul>
    <blockquote>
        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
    </blockquote>
    <p>
        Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id
        quod maxime placeat facere possimus, omnis voluptas assumenda est.
    </p>
</Story>
