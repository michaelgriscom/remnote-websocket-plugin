import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerWidget('server', WidgetLocation.RightSidebar, {
    dimensions: { height: 'auto', width: '100%' },
    widgetTabTitle: 'Websocket',
    widgetTabIcon: 'https://www.svgrepo.com/show/443547/brand-websocket.svg',
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(
  onActivate,
  onDeactivate,
);