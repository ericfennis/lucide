import { test } from "@webcontainer/test";

test("run development server inside webcontainer", async ({
  webcontainer,
  preview,
}) => {
  await webcontainer.mount("./nextjs");

  await webcontainer.runCommand("npm", ["install"]);
  const { exit } = webcontainer.runCommand("npm", ["run", "dev"]);

  await preview.getByRole("heading", { level: 1, name: "Hello Vite!" });
  await exit();
});