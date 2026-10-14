import qrcode from "qrcode-generator";

export const qrDataUrl = (text: string): string | null => {
	try {
		const code = qrcode(0, "L");
		code.addData(text, "Byte");
		code.make();

		return code.createDataURL(4, 2);
	} catch {
		return null;
	}
};
