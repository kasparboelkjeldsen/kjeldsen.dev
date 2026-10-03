import { defineCustomElement, type Component } from "vue";

// Every *.ce.vue under src/components/ becomes a native custom element usable in
// any Razor view — no mount points, no per-page bootstrapping:
//
//   HelloWorld.ce.vue  →  <umbracobench-hello-world msg="Hi from Razor"></umbracobench-hello-world>
//
// Props arrive as attributes (numbers/booleans are auto-cast from the prop types),
// <style> blocks ship inside the element's shadow root, and slots are native slots.
const components = import.meta.glob<{ default: Component }>("./components/**/*.ce.vue", { eager: true });

const registered: string[] = [];
for (const [path, module] of Object.entries(components)) {
    const fileName = path.split("/").pop()!.replace(".ce.vue", "");
    const kebab = fileName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    const tag = `umbracobench-${kebab}`;
    if (!customElements.get(tag)) {
        customElements.define(tag, defineCustomElement(module.default));
        registered.push(`<${tag}>`);
    }
}

console.log(`[Umbraco.Bench] frontend registered: ${registered.join(", ")}`);
