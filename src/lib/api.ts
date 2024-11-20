import { RNPlugin } from '@remnote/plugin-sdk';

export async function createRem(plugin: RNPlugin, text: string, parentId?: string) {
  const rem = await plugin.rem.createRem();
  await rem?.setText([text]);
  
  if (parentId) {
    const parentRem = await plugin.rem.findOne(parentId);
    if (parentRem) {
      await rem?.setParent(parentRem);
    }
  }
  
  return rem;
}