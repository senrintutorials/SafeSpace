import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});
async function main() {
  try {
    const models = await ai.models.list();
    for await (const m of models) {
      console.log(m.name);
    }
  } catch(e) {
    console.error(e);
  }
}
main();
