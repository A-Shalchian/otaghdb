export const knollingScrollbars = `
html::-webkit-scrollbar { width: 16px; }
html::-webkit-scrollbar-track {
  background-color: #C9CFD6;
  background-image: repeating-linear-gradient(to bottom, transparent 0 15px, rgba(31, 75, 176, 0.45) 15px 16px),
    repeating-linear-gradient(to bottom, transparent 0 79px, #1F4BB0 79px 80px);
  background-size: 6px 100%, 11px 100%;
  background-repeat: no-repeat;
  background-position: left top, left top;
  border-left: 1px solid #A9B1BC;
}
html::-webkit-scrollbar-thumb { background: #1F4BB0; border: 4px solid #C9CFD6; border-left-width: 5px; }
html::-webkit-scrollbar-thumb:hover { background: #14202E; }
.knolling-root pre::-webkit-scrollbar { height: 10px; }
.knolling-root pre::-webkit-scrollbar-track { background: #0F2459; }
.knolling-root pre::-webkit-scrollbar-thumb { background: #8FA8E6; border: 3px solid #0F2459; }
@supports not selector(::-webkit-scrollbar) {
  html { scrollbar-color: #1F4BB0 #C9CFD6; }
  .knolling-root pre { scrollbar-color: #8FA8E6 #0F2459; }
}
`;

export const pixelScrollbars = `
html::-webkit-scrollbar { width: 20px; }
html::-webkit-scrollbar-track { background: #191628; box-shadow: inset 4px 0 0 #2B2950; }
html::-webkit-scrollbar-thumb {
  background: #F0B84C;
  border: 4px solid #191628;
  box-shadow: inset 4px 4px 0 #FFE6A6, inset -4px -4px 0 #8C5A3A;
}
html::-webkit-scrollbar-thumb:hover { background: #4FA05C; box-shadow: inset 4px 4px 0 #A8D8EA, inset -4px -4px 0 #45495C; }
html::-webkit-scrollbar-button:single-button { display: block; height: 20px; background: #574A82; border: 4px solid #191628; }
html::-webkit-scrollbar-button:single-button:hover { background: #F0B84C; }
.pixel-root pre::-webkit-scrollbar { height: 12px; }
.pixel-root pre::-webkit-scrollbar-track { background: #2B2950; }
.pixel-root pre::-webkit-scrollbar-thumb { background: #F0B84C; border: 4px solid #2B2950; }
@supports not selector(::-webkit-scrollbar) {
  html { scrollbar-color: #F0B84C #191628; }
  .pixel-root pre { scrollbar-color: #F0B84C #2B2950; }
}
`;

export const chatScrollbars = `
html::-webkit-scrollbar { width: 14px; }
html::-webkit-scrollbar-track { background: #e8ecf1; }
html::-webkit-scrollbar-thumb { background: #9fb0d6; border: 4px solid #e8ecf1; border-radius: 999px; }
html::-webkit-scrollbar-thumb:hover { background: #3d4f8f; }
.chat-root .chat-code::-webkit-scrollbar { height: 10px; }
.chat-root .chat-code::-webkit-scrollbar-track { background: #18212c; border-radius: 0 0 14px 14px; }
.chat-root .chat-code::-webkit-scrollbar-thumb { background: #4f5b69; border: 3px solid #18212c; border-radius: 999px; }
@supports not selector(::-webkit-scrollbar) {
  html { scrollbar-color: #9fb0d6 #e8ecf1; }
  .chat-root .chat-code { scrollbar-color: #4f5b69 #18212c; }
}
`;
