import { Runtime } from "foldkit";
import { Flags, flags, init } from "./main";
import { Message } from "./message";
import { Model } from "./model";
import { update } from "./update";
import { view } from "./view";

const application = Runtime.makeApplication({
	Model,
	Flags,
	init,
	update,
	view,
	container: document.getElementById("root"),
	devTools: { Message },
});

Runtime.run(application, { flags });

globalThis.addEventListener("hashchange", () => globalThis.location.reload());
