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
