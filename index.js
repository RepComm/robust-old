import { EXPONENT_CSS_BODY_STYLES, EXPONENT_CSS_STYLES, Panel, Text } from "@repcomm/exponent-ts";
EXPONENT_CSS_STYLES.mount(document.head);
EXPONENT_CSS_BODY_STYLES.mount(document.head);

async function main() {
  const container = new Panel().setId("container").mount(document.body);
  const title = new Text().setTextContent("Hello World").mount(container);
}

main();